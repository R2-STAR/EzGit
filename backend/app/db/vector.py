from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List


def _fmt_vec(v: List[float]) -> str:
    return "[" + ",".join(str(x) for x in v) + "]"


async def insert_embedding(
    db: AsyncSession,
    repo_url: str,
    file_path: str,
    chunk_text: str,
    embedding: List[float],
):
    await db.execute(
        text("""
            INSERT INTO code_embeddings (repo_url, file_path, chunk_text, embedding)
            VALUES (:repo_url, :file_path, :chunk_text, CAST(:embedding AS vector))
        """),
        {
            "repo_url": repo_url,
            "file_path": file_path,
            "chunk_text": chunk_text,
            "embedding": _fmt_vec(embedding),
        },
    )


async def similarity_search(
    db: AsyncSession,
    repo_url: str,
    query_embedding: List[float],
    top_k: int = 10,
) -> list:
    result = await db.execute(
        text("""
            SELECT
                file_path,
                chunk_text,
                1 - (embedding <=> CAST(:embedding AS vector)) AS similarity
            FROM code_embeddings
            WHERE repo_url = :repo_url
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT :top_k
        """),
        {
            "repo_url": repo_url,
            "embedding": _fmt_vec(query_embedding),
            "top_k": top_k,
        },
    )
    rows = result.fetchall()
    return [
        {
            "file_path": row.file_path,
            "chunk_text": row.chunk_text,
            "similarity": round(float(row.similarity), 4),
        }
        for row in rows
    ]


async def delete_repo_embeddings(db: AsyncSession, repo_url: str):
    await db.execute(
        text("DELETE FROM code_embeddings WHERE repo_url = :repo_url"),
        {"repo_url": repo_url},
    )
