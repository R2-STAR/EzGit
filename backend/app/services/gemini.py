import json
import re
import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

_model = genai.GenerativeModel("gemini-flash-lite-latest")
_embed_model = "models/gemini-embedding-001"


def _clean_json(text: str) -> str:
    text = re.sub(r"^```(?:json)?\s*", "", text.strip())
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


async def explain_pr(diff: str, files: list[str], title: str = "") -> dict:
    prompt = f"""You are a senior software engineer reviewing a pull request.
Analyze the diff below and return ONLY valid JSON (no markdown) with this structure:
{{
  "summary": "2-3 sentence overview of what this PR does",
  "risky_files": [
    {{"file": "path/to/file.py", "reason": "why it is risky", "severity": "high"}}
  ],
  "architecture_impact": "how this changes the system architecture",
  "onboarding_tip": "what a new developer must know about this change",
  "risk_score": 42
}}

Severity levels: critical, high, medium, low
Risk score: 0 (safe) to 100 (very dangerous)

PR Title: {title}
Changed Files: {", ".join(files[:30])}

Diff (truncated to 8000 chars):
{diff[:8000]}
"""
    response = _model.generate_content(prompt)
    raw = _clean_json(response.text)
    return json.loads(raw)


async def generate_setup_script(
    repo_name: str,
    language: str,
    framework: str,
    config_files: list[str],
) -> dict:
    prompt = f"""You are a DevOps engineer. Generate a local development setup for this repository.
Return ONLY valid JSON (no markdown) with this structure:
{{
  "docker_compose": "full docker-compose.yml content as string",
  "makefile": "full Makefile content as string",
  "instructions": ["step 1", "step 2", "step 3"]
}}

Repository: {repo_name}
Primary Language: {language}
Framework: {framework}
Config files found: {", ".join(config_files)}
"""
    response = _model.generate_content(prompt)
    raw = _clean_json(response.text)
    return json.loads(raw)


async def explain_scan_findings(
    semgrep_findings: list,
    snyk_findings: list,
    repo: str,
) -> str:
    prompt = f"""You are a security engineer. Review these scan findings for {repo}.
Write a clear, prioritized security report in markdown format.
Group findings by severity. Explain each risk in plain English. Give fix recommendations.

Semgrep findings (SAST): {json.dumps(semgrep_findings[:20])}
Snyk findings (dependency CVEs): {json.dumps(snyk_findings[:20])}
"""
    response = _model.generate_content(prompt)
    return response.text


async def explain_architecture(
    repo_tree: list[str],
    readme: str,
    repo_name: str,
) -> dict:
    prompt = f"""You are a senior architect onboarding a new developer to {repo_name}.
Based on the file tree and README, return ONLY valid JSON (no markdown):
{{
  "overview": "3-4 sentence architecture overview",
  "tech_stack": ["Python", "PostgreSQL", "..."],
  "important_directories": [
    {{"path": "src/api", "purpose": "HTTP route handlers"}}
  ],
  "entry_points": ["main.py", "index.ts"],
  "quick_start": "One paragraph on how to get started"
}}

README (truncated):
{readme[:3000]}

File tree (sample):
{chr(10).join(repo_tree[:100])}
"""
    response = _model.generate_content(prompt)
    raw = _clean_json(response.text)
    return json.loads(raw)


def _is_quota_exhausted(r) -> bool:
    try:
        body = r.text or ""
        return (
            r.status_code == 429
            and ("quota exceeded for metric" in body.lower() or "RESOURCE_EXHAUSTED" in body)
        )
    except Exception:
        return False


def _quota_message(r) -> str:
    try:
        body = (r.text or "").strip()
        line = next((l for l in body.splitlines() if "quota exceeded" in l.lower()), body[:300])
        return f"Gemini free-tier quota exhausted: {line.strip()}"
    except Exception:
        return "Gemini free-tier quota exhausted."


async def _embed(text: str, task_type: str) -> list[float]:
    import asyncio
    import random
    import httpx
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent"
        f"?key={settings.GEMINI_API_KEY}"
    )
    payload = {
        "model": "models/gemini-embedding-001",
        "content": {"parts": [{"text": text}]},
        "taskType": task_type,
        "outputDimensionality": 768,
    }
    async with httpx.AsyncClient() as client:
        for attempt in range(6):
            r = await client.post(url, json=payload)
            if r.status_code == 429 and _is_quota_exhausted(r):
                raise RuntimeError(_quota_message(r))
            if r.status_code == 429:
                await asyncio.sleep(min(2 ** attempt, 15) + random.random())
                continue
            r.raise_for_status()
            return r.json()["embedding"]["values"]
    raise RuntimeError("Gemini embedding rate limit exceeded after retries")


async def embed_text(text: str) -> list[float]:
    return await _embed(text, "RETRIEVAL_DOCUMENT")


async def embed_query(query: str) -> list[float]:
    return await _embed(query, "RETRIEVAL_QUERY")


async def embed_batch(texts: list[str], task_type: str = "RETRIEVAL_DOCUMENT") -> list[list[float]]:
    """Embed many texts in one batchEmbedContents call (up to 64 each).

    Reduces free-tier quota consumption ~64x compared to one call per chunk,
    which is the difference between indexing a whole repo and exhausting the
    daily 1000-request free-tier budget.
    """
    import asyncio
    import random
    import httpx
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents"
        f"?key={settings.GEMINI_API_KEY}"
    )
    results: list[list[float]] = []
    for start in range(0, len(texts), 64):
        batch = texts[start:start + 64]
        requests = [{
            "model": "models/gemini-embedding-001",
            "content": {"parts": [{"text": t}]},
            "taskType": task_type,
            "outputDimensionality": 768,
        } for t in batch]
        async with httpx.AsyncClient() as client:
            for attempt in range(6):
                r = await client.post(url, json={"model": "models/gemini-embedding-001", "requests": requests})
                if r.status_code == 429 and _is_quota_exhausted(r):
                    raise RuntimeError(_quota_message(r))
                if r.status_code == 429:
                    await asyncio.sleep(min(2 ** attempt, 15) + random.random())
                    continue
                r.raise_for_status()
                embeddings = [item["values"] for item in r.json()["embeddings"]]
                if len(embeddings) != len(batch):
                    raise RuntimeError(f"batchEmbedContents returned {len(embeddings)} embeddings for {len(batch)} texts")
                results.extend(embeddings)
                break
            else:
                raise RuntimeError("Gemini embedding rate limit exceeded after retries")
    return results
