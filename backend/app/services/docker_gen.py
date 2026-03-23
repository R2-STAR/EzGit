from app.services.gemini import generate_setup_script
from app.services.github import detect_language, get_readme
from app.db.redis import cache_set, cache_get
import json


async def generate_local_setup(repo_name: str) -> dict:
    cache_key = f"setup:{repo_name}"
    cached = await cache_get(cache_key)
    if cached:
        return json.loads(cached)
    lang_info = await detect_language(repo_name)
    readme = await get_readme(repo_name)
    result = await generate_setup_script(
        repo_name=repo_name,
        language=lang_info["language"],
        framework=lang_info["framework"],
        config_files=lang_info["config_files"],
    )
    result["language"] = lang_info["language"]
    result["framework"] = lang_info["framework"]
    result["repo"] = repo_name
    await cache_set(cache_key, json.dumps(result), ttl_seconds=86400)
    return result
