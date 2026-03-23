import subprocess
import json
import tempfile
import os
from typing import List
from app.services.github import get_file_content, get_code_files


async def run_semgrep_on_repo(repo_name: str) -> List[dict]:
    code_files = await get_code_files(repo_name)
    code_files = code_files[:50]
    findings = []
    with tempfile.TemporaryDirectory() as tmpdir:
        for file_path in code_files:
            content = await get_file_content(repo_name, file_path)
            if not content:
                continue
            full_path = os.path.join(tmpdir, file_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8", errors="ignore") as f:
                f.write(content)
        result = subprocess.run(
            ["semgrep", "--config=auto", "--json", "--quiet", tmpdir],
            capture_output=True, text=True, timeout=120,
        )
        if result.stdout:
            try:
                data = json.loads(result.stdout)
                for r in data.get("results", []):
                    findings.append({
                        "rule_id": r.get("check_id", ""),
                        "severity": r.get("extra", {}).get("severity", "medium").lower(),
                        "message": r.get("extra", {}).get("message", ""),
                        "file": r.get("path", "").replace(tmpdir, "").lstrip("/\\"),
                        "line": r.get("start", {}).get("line"),
                    })
            except json.JSONDecodeError:
                pass
    return findings
