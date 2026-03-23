from pydantic import BaseModel
from typing import List


class SearchRequest(BaseModel):
    repo: str
    query: str
    top_k: int = 10


class SearchHit(BaseModel):
    file_path: str
    chunk_text: str
    similarity: float


class SearchResponse(BaseModel):
    query: str
    repo: str
    results: List[SearchHit]
    total: int


class IndexRequest(BaseModel):
    repo: str


class IndexResponse(BaseModel):
    repo: str
    status: str
    message: str
