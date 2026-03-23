import gitlab
from app.config import settings

_gl = gitlab.Gitlab(settings.GITLAB_URL, private_token=settings.GITLAB_TOKEN)


async def get_pr_data(project_id: str, mr_number: int) -> dict:
    project = _gl.projects.get(project_id)
    mr = project.mergerequests.get(mr_number)
    changes = mr.changes()
    files = [c["new_path"] for c in changes.get("changes", [])]
    patches = [
        f"--- {c['new_path']}\n{c.get('diff', '')}"
        for c in changes.get("changes", [])
    ]
    return {
        "title": mr.title,
        "description": mr.description or "",
        "diff": "\n\n".join(patches),
        "files": files,
        "author": mr.author.get("username", "unknown"),
        "created_at": mr.created_at,
    }


async def get_repo_tree(project_id: str, ref: str = "main") -> list[str]:
    project = _gl.projects.get(project_id)
    items = project.repository_tree(recursive=True, ref=ref, all=True)
    return [item["path"] for item in items if item["type"] == "blob"]


async def get_file_content(project_id: str, file_path: str, ref: str = "main") -> str:
    project = _gl.projects.get(project_id)
    try:
        f = project.files.get(file_path=file_path, ref=ref)
        return f.decode().decode("utf-8", errors="ignore")
    except Exception:
        return ""
