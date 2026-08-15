import re

GITHUB_URL_RE = re.compile(
    r"(?:git@)?(?:https?://)?(?:www\.)?github\.com[/:]([^/]+/[^/]+?)(?:\.git)?(?:/.*)?$",
    re.IGNORECASE,
)


def normalize_repo(value: str) -> str:
    """Turn any common GitHub input into owner/name.

    Accepts:
        owner/repo
        https://github.com/owner/repo
        github.com/owner/repo
        https://github.com/owner/repo/pull/42
        https://github.com/owner/repo/tree/main/subdir
        git@github.com:owner/repo.git
        owner/repo.git
        owner/repo/
    """
    if not value:
        return value
    value = value.strip()
    m = GITHUB_URL_RE.match(value)
    if m:
        return m.group(1)
    value = value.rstrip("/")
    if value.endswith(".git"):
        value = value[:-4]
    return value
