from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db.postgres import get_db
from app.models.scan import ScanRequest, ScanStartResponse
from app.workers.tasks import run_security_scan

router = APIRouter()


@router.post("/start", response_model=ScanStartResponse)
async def start_scan(body: ScanRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("INSERT INTO scan_results (repo_url, status) VALUES (:repo, 'pending') RETURNING id"),
        {"repo": body.repo},
    )
    scan_id = str(result.fetchone().id)
    run_security_scan.delay(scan_id, body.repo)
    return ScanStartResponse(scan_id=scan_id)


@router.get("/{scan_id}")
async def get_scan_result(scan_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT * FROM scan_results WHERE id = CAST(:id AS uuid)"),
        {"id": scan_id},
    )
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Scan not found")
    return {
        "id": str(row.id), "repo_url": row.repo_url, "status": row.status,
        "semgrep_findings": row.semgrep_findings or [],
        "snyk_findings": row.snyk_findings or [],
        "ai_report": row.ai_report, "error_message": row.error_message,
        "created_at": row.created_at, "completed_at": row.completed_at,
    }


@router.get("/history/{repo:path}")
async def get_scan_history(repo: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT id, status, created_at, completed_at FROM scan_results WHERE repo_url = :repo ORDER BY created_at DESC LIMIT 10"),
        {"repo": repo},
    )
    rows = result.fetchall()
    return [{"id": str(r.id), "status": r.status, "created_at": r.created_at, "completed_at": r.completed_at} for r in rows]
