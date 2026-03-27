import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

from app.db.postgres import get_db
from app.db.redis import cache_get, cache_set
from app.services.github import get_pr_data as github_pr_data
from app.services.gitlab import get_pr_data as gitlab_pr_data
from app.services.gemini import explain_pr

router = APIRouter()


class PRExplainRequest(BaseModel):
    repo: str
    pr_number: int
    provider: Optional[str] = "github"


class PRExplainResponse(BaseModel):
    repo: str
    pr_number: int
    title: str
    author: str
    changed_files: List[str]
    summary: Any
    risk_score: int


class PRHistoryItem(BaseModel):
    pr_number: int
    title: str
    risk_score: int
    created_at: Optional[datetime]


@router.post("/explain", response_model=PRExplainResponse)
async def explain_pull_request(body: PRExplainRequest, db: AsyncSession = Depends(get_db)):
    cache_key = f"pr:{body.repo}:{body.pr_number}"
    cached = await cache_get(cache_key)
    if cached:
        return json.loads(cached)
    existing = await db.execute(
        text("SELECT title, author, changed_files, summary, risk_score FROM pr_summaries WHERE repo_url = :repo AND pr_number = :num"),
        {"repo": body.repo, "num": body.pr_number},
    )
    row = existing.fetchone()
    if row:
        result = {
            "repo": body.repo,
            "pr_number": body.pr_number,
            "title": row.title,
            "author": row.author or "Unknown",
            "changed_files": row.changed_files or [],
            "summary": row.summary,
            "risk_score": row.risk_score,
        }
        await cache_set(cache_key, json.dumps(result))
        return result
    try:
        if body.provider == "gitlab":
            pr_data = await gitlab_pr_data(body.repo, body.pr_number)
        else:
            pr_data = await github_pr_data(body.repo, body.pr_number)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"PR not found: {str(e)}")
    try:
        explanation = await explain_pr(pr_data["diff"], pr_data["files"], pr_data["title"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI explanation failed: {str(e)}")
    risk_score = explanation.get("risk_score", 0)
    await db.execute(
        text("""
            INSERT INTO pr_summaries (repo_url, pr_number, title, author, changed_files, summary, risk_score)
            VALUES (:repo, :num, :title, :author, cast(:changed_files as jsonb), cast(:summary as jsonb), :risk)
            ON CONFLICT (repo_url, pr_number) DO UPDATE
            SET summary = EXCLUDED.summary, risk_score = EXCLUDED.risk_score,
                author = EXCLUDED.author, changed_files = EXCLUDED.changed_files
        """),
        {"repo": body.repo, "num": body.pr_number, "title": pr_data["title"],
         "author": pr_data["author"], "changed_files": json.dumps(pr_data["files"]),
         "summary": json.dumps(explanation), "risk": risk_score},
    )
    await db.commit()
    result = {
        "repo": body.repo, "pr_number": body.pr_number,
        "title": pr_data["title"], "author": pr_data["author"],
        "changed_files": pr_data["files"], "summary": explanation, "risk_score": risk_score,
    }
    await cache_set(cache_key, json.dumps(result), ttl_seconds=3600)
    return result


@router.get("/history/{repo:path}", response_model=List[PRHistoryItem])
async def get_pr_history(repo: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT pr_number, title, risk_score, created_at FROM pr_summaries WHERE repo_url = :repo ORDER BY created_at DESC LIMIT 20"),
        {"repo": repo},
    )
    rows = result.fetchall()
    return [{"pr_number": r.pr_number, "title": r.title, "risk_score": r.risk_score, "created_at": r.created_at} for r in rows]