from github import Github, GithubException
from app.config import settings

_gh = Github(settings.GITHUB_TOKEN)

CODE_EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".jsx", ".go",
    ".java", ".rb", ".rs", ".cpp", ".c", ".h",
    ".cs", ".php", ".swift", ".kt", ".scala",
}

CONFIG_FILES = {
    "package.json", "requirements.txt", "go.mod", "Gemfile",
    "pom.xml", "build.gradle", "Cargo.toml", "composer.json",
    "Pipfile", "pyproject.toml", "setup.py",
}


async def get_pr_data(repo_name: str, pr_number: int) -> dict:
    repo = _gh.get_repo(repo_name)
    pr = repo.get_pull(pr_number)
    files = list(pr.get_files())
    changed_files = [f.filename for f in files]
    patches = []
    for f in files:
        if f.patch:
            patches.append(f"--- {f.filename}\n{f.patch}")
    return {
        "title": pr.title,
        "description": pr.body or "",
        "diff": "\n\n".join(patches),
        "files": changed_files,
        "additions": pr.additions,
        "deletions": pr.deletions,
        "author": pr.user.login,
        "created_at": pr.created_at.isoformat(),
    }


async def get_repo_tree(repo_name: str) -> list[str]:
    repo = _gh.get_repo(repo_name)
    tree = repo.get_git_tree(repo.default_branch, recursive=True)
    return [item.path for item in tree.tree if item.type == "blob"]


async def get_file_content(repo_name: str, file_path: str) -> str:
    repo = _gh.get_repo(repo_name)
    try:
        content = repo.get_contents(file_path)
        return content.decoded_content.decode("utf-8", errors="ignore")
    except (GithubException, UnicodeDecodeError):
        return ""


async def get_readme(repo_name: str) -> str:
    try:
        return await get_file_content(repo_name, "README.md")
    except Exception:
        return ""


async def get_code_files(repo_name: str) -> list[str]:
    all_files = await get_repo_tree(repo_name)
    return [f for f in all_files if any(f.endswith(ext) for ext in CODE_EXTENSIONS)]


async def get_config_files(repo_name: str) -> list[str]:
    all_files = await get_repo_tree(repo_name)
    return [f for f in all_files if f.split("/")[-1] in CONFIG_FILES]


async def detect_language(repo_name: str) -> dict:
    config_files = await get_config_files(repo_name)
    config_names = [f.split("/")[-1] for f in config_files]
    language = "unknown"
    framework = "unknown"
    if "requirements.txt" in config_names or "pyproject.toml" in config_names:
        language = "Python"
        framework = "FastAPI/Django/Flask"
    elif "package.json" in config_names:
        language = "JavaScript/TypeScript"
        framework = "Node.js/React"
    elif "go.mod" in config_names:
        language = "Go"
        framework = "Go modules"
    elif "pom.xml" in config_names or "build.gradle" in config_names:
        language = "Java"
        framework = "Maven/Gradle"
    elif "Gemfile" in config_names:
        language = "Ruby"
        framework = "Rails"
    elif "Cargo.toml" in config_names:
        language = "Rust"
        framework = "Cargo"
    return {"language": language, "framework": framework, "config_files": config_files}
