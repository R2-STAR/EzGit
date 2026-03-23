from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.db.vector import similarity_search
from app.models.search import SearchRequest, SearchResponse, IndexRequest, IndexResponse
from app.services.gemini import embed_query
from app.services.embeddings import index_repository, get_index_status
from app.workers.tasks import index_repo_task

router = APIRouter()


@router.post("/", response_model=SearchResponse)
async def semantic_search(body: SearchRequest, db: AsyncSession = Depends(get_db)):
    status = await get_index_status(body.repo)
    if not status or status["status"] != "done":
        raise HTTPException(status_code=400, detail=f"Repo not indexed yet. Call POST /search/index first.")
    try:
        query_embedding = await embed_query(body.query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")
    results = await similarity_search(db, body.repo, query_embedding, top_k=body.top_k)
    return SearchResponse(query=body.query, repo=body.repo, results=results, total=len(results))


@router.post("/index", response_model=IndexResponse)
async def index_repo(body: IndexRequest):
    status = await get_index_status(body.repo)
    if status and status["status"] == "indexing":
        return IndexResponse(repo=body.repo, status="indexing", message="Indexing already in progress.")
    index_repo_task.delay(body.repo)
    return IndexResponse(repo=body.repo, status="started", message="Indexing started. Poll GET /search/index-status/{repo}.")


@router.get("/index-status/{repo:path}")
async def index_status(repo: str):
    status = await get_index_status(repo)
    if not status:
        return {"repo": repo, "status": "not_indexed"}
    return status
