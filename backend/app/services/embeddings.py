from sqlalchemy import text
from app.db.postgres import AsyncSessionLocal
from app.db.vector import insert_embedding, delete_repo_embeddings
from app.services.gemini import embed_text
from app.services.github import get_code_files, get_file_content
from app.utils.chunker import chunk_code

MAX_FILES = 150
MAX_CHUNKS_PER_FILE = 20


async def index_repository(repo_name: str) -> dict:
    async with AsyncSessionLocal() as db:
        await db.execute(
            text("""
                INSERT INTO indexed_repos (repo_url, status)
                VALUES (:repo, 'indexing')
                ON CONFLICT (repo_url) DO UPDATE SET status = 'indexing'
            """),
            {"repo": repo_name},
        )
        await db.commit()
    try:
        code_files = await get_code_files(repo_name)
        code_files = code_files[:MAX_FILES]
        total_chunks = 0
        failed_files = 0
        async with AsyncSessionLocal() as db:
            await delete_repo_embeddings(db, repo_name)
            for file_path in code_files:
                content = await get_file_content(repo_name, file_path)
                if not content or len(content.strip()) < 50:
                    continue
                chunks = chunk_code(content, max_chars=600)
                chunks = chunks[:MAX_CHUNKS_PER_FILE]
                for chunk in chunks:
                    try:
                        embedding = await embed_text(chunk)
                        await insert_embedding(db, repo_name, file_path, chunk, embedding)
                        total_chunks += 1
                    except Exception:
                        failed_files += 1
                        continue
            await db.commit()
            await db.execute(
                text("""
                    UPDATE indexed_repos
                    SET status = 'done',
                        file_count = :file_count,
                        chunk_count = :chunk_count,
                        indexed_at = NOW()
                    WHERE repo_url = :repo
                """),
                {"repo": repo_name, "file_count": len(code_files), "chunk_count": total_chunks},
            )
            await db.commit()
        return {"repo": repo_name, "files_indexed": len(code_files), "chunks_created": total_chunks, "failed": failed_files}
    except Exception as e:
        async with AsyncSessionLocal() as db:
            await db.execute(
                text("UPDATE indexed_repos SET status = 'error' WHERE repo_url = :repo"),
                {"repo": repo_name},
            )
            await db.commit()
        raise e


async def get_index_status(repo_name: str) -> dict | None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            text("SELECT * FROM indexed_repos WHERE repo_url = :repo"),
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
            "indexed_at": row.indexed_at,
        }
