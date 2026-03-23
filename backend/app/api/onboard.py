import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.db.redis import cache_get, cache_set
from app.services.github import get_repo_tree as github_tree, get_readme as github_readme, detect_language
from app.services.gitlab import get_repo_tree as gitlab_tree, get_file_content as gitlab_file
from app.services.gemini import explain_architecture
from app.services.docker_gen import generate_local_setup

router = APIRouter()


class OnboardRequest(BaseModel):
    repo: str
    provider: Optional[str] = "github"


@router.post("/architecture")
async def get_architecture(body: OnboardRequest):
    cache_key = f"arch:{body.repo}"
    cached = await cache_get(cache_key)
    if cached:
        return json.loads(cached)
    try:
        if body.provider == "gitlab":
            repo_tree = await gitlab_tree(body.repo)
            readme = await gitlab_file(body.repo, "README.md") or ""
        else:
            repo_tree = await github_tree(body.repo)
            readme = await github_readme(body.repo)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Repo not found: {str(e)}")
    try:
        architecture = await explain_architecture(repo_tree, readme, body.repo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")
    result = {"repo": body.repo, "file_count": len(repo_tree), **architecture}
    await cache_set(cache_key, json.dumps(result), ttl_seconds=21600)
    return result


@router.post("/setup")
async def get_local_setup(body: OnboardRequest):
    try:
        setup = await generate_local_setup(body.repo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Setup generation failed: {str(e)}")
    return setup


@router.get("/tech-stack/{repo:path}")
async def get_tech_stack(repo: str):
    try:
        lang_info = await detect_language(repo)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Repo not found: {str(e)}")
    return {"repo": repo, **lang_info}
