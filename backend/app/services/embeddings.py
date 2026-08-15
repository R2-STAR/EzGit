from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
from app.db.postgres import AsyncSessionLocal as DefaultSessionLocal
from app.db.vector import insert_embedding, delete_repo_embeddings
from app.services.gemini import embed_batch
from app.services.github import get_code_files, get_file_content
from app.utils.chunker import chunk_code

MAX_FILES = 150
MAX_CHUNKS_PER_FILE = 20


async def index_repository(repo_name: str, AsyncSessionLocal=None) -> dict:
    if AsyncSessionLocal is None:
        AsyncSessionLocal = DefaultSessionLocal

    async with AsyncSessionLocal() as db:
        await db.execute(
            text("""
                INSERT INTO indexed_repos (repo_url, status, error_message)
                VALUES (:repo, 'indexing', NULL)
                ON CONFLICT (repo_url) DO UPDATE SET status = 'indexing', error_message = NULL
            """),
            {"repo": repo_name},
        )
        await db.commit()
    try:
        code_files = await get_code_files(repo_name)
        code_files = code_files[:MAX_FILES]
        total_chunks = 0
        embed_failures = 0
        first_error = None
        async with AsyncSessionLocal() as db:
            await delete_repo_embeddings(db, repo_name)
            for file_path in code_files:
                content = await get_file_content(repo_name, file_path)
                if not content or len(content.strip()) < 50:
                    continue
                chunks = chunk_code(content, max_chars=600)
                chunks = chunks[:MAX_CHUNKS_PER_FILE]
                if not chunks:
                    continue
                try:
                    embeddings = await embed_batch(chunks)
                    for chunk, embedding in zip(chunks, embeddings):
                        await insert_embedding(db, repo_name, file_path, chunk, embedding)
                        total_chunks += 1
                except Exception as e:
                    embed_failures += 1
                    if first_error is None:
                        first_error = e
            await db.commit()
            if embed_failures > 0 and total_chunks == 0:
                detail = str(first_error) if first_error else "Gemini API unavailable"
                raise RuntimeError(
                    f"No chunks could be embedded: {detail}. If this is a free-tier quota "
                    "limit, try again later or add a paid plan key."
                )
            await db.execute(
                text("""
                    UPDATE indexed_repos
                    SET status = 'done',
                        file_count = :file_count,
                        chunk_count = :chunk_count,
                        error_message = NULL,
                        indexed_at = NOW()
                    WHERE repo_url = :repo
                """),
                {"repo": repo_name, "file_count": len(code_files), "chunk_count": total_chunks},
            )
            await db.commit()
        return {"repo": repo_name, "files_indexed": len(code_files), "chunks_created": total_chunks, "failed": embed_failures}
    except Exception as e:
        async with AsyncSessionLocal() as db:
            await db.execute(
                text("UPDATE indexed_repos SET status = 'error', error_message = :err WHERE repo_url = :repo"),
                {"repo": repo_name, "err": str(e)},
            )
            await db.commit()
        raise e


async def get_index_status(repo_name: str) -> dict | None:
    async with DefaultSessionLocal() as db:
        result = await db.execute(
            text("SELECT * FROM indexed_repos WHERE repo_url = :repo").execution_options(no_cache=True),
            {"repo": repo_name},
        )
        row = result.fetchone()
        if not row:
            return None
        return {
            "repo_url": row.repo_url,
            "status": row.status,
            "file_count": row.file_count,
            "chunk_count": row.chunk_count,
            "error_message": row.error_message,
            "indexed_at": row.indexed_at,
        }
    