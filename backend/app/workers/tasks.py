import asyncio
from celery import Celery
from sqlalchemy import text
from app.config import settings
from app.db.postgres import AsyncSessionLocal

celery_app = Celery(
    "ezGit",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_track_started=True,
    result_expires=3600,
)


def run_async(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(bind=True, name="tasks.run_security_scan")
def run_security_scan(self, scan_id: str, repo_name: str):
    async def _run():
        from app.services.semgrep import run_semgrep_on_repo
        from app.services.snyk import run_snyk_scan
        from app.services.gemini import explain_scan_findings
        import json

        async with AsyncSessionLocal() as db:
            await db.execute(
                text("UPDATE scan_results SET status = 'running' WHERE id = :id::uuid"),
                {"id": scan_id},
            )
            await db.commit()
        try:
            semgrep_findings = await run_semgrep_on_repo(repo_name)
            snyk_findings = await run_snyk_scan(repo_name)
            ai_report = await explain_scan_findings(semgrep_findings, snyk_findings, repo_name)
            async with AsyncSessionLocal() as db:
                await db.execute(
                    text("""
                        UPDATE scan_results
                        SET status = 'done',
                            semgrep_findings = :semgrep::jsonb,
                            snyk_findings = :snyk::jsonb,
                            ai_report = :report,
                            completed_at = NOW()
                        WHERE id = :id::uuid
                    """),
                    {"id": scan_id, "semgrep": json.dumps(semgrep_findings),
                     "snyk": json.dumps(snyk_findings), "report": ai_report},
                )
                await db.commit()
        except Exception as e:
            async with AsyncSessionLocal() as db:
                await db.execute(
                    text("UPDATE scan_results SET status = 'error', error_message = :err WHERE id = :id::uuid"),
                    {"id": scan_id, "err": str(e)},
                )
                await db.commit()
            raise
    run_async(_run())


@celery_app.task(bind=True, name="tasks.index_repo")
def index_repo_task(self, repo_name: str):
    async def _run():
        from app.services.embeddings import index_repository
        return await index_repository(repo_name)
    return run_async(_run())
