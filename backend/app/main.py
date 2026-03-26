from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import pr, search, scan, onboard
from app.db.postgres import init_db
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
app = FastAPI(
    title="ezGit API",
    description="AI-powered code intelligence platform",
    version="1.0.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(pr.router,      prefix="/pr",      tags=["Pull Requests"])
app.include_router(search.router,  prefix="/search",  tags=["Code Search"])
app.include_router(scan.router,    prefix="/scan",    tags=["Security Scan"])
app.include_router(onboard.router, prefix="/onboard", tags=["Onboarding"])
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ezGit-api"}
