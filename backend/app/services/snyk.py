import subprocess
import json
import tempfile
import os
from typing import List
from app.services.github import get_file_content, get_repo_tree
from app.config import settings

MANIFEST_FILES = [
    "package.json", "requirements.txt", "go.mod", "Gemfile",
    "pom.xml", "build.gradle", "Cargo.toml", "composer.json",
    "Pipfile", "pyproject.toml",
]


async def run_snyk_scan(repo_name: str) -> List[dict]:
    all_files = await get_repo_tree(repo_name)
    manifest_paths = [f for f in all_files if f.split("/")[-1] in MANIFEST_FILES]
    if not manifest_paths:
        return []
    findings = []
    with tempfile.TemporaryDirectory() as tmpdir:
        for manifest_path in manifest_paths[:5]:
            content = await get_file_content(repo_name, manifest_path)
            if not content:
                continue
            full_path = os.path.join(tmpdir, manifest_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
            result = subprocess.run(
                ["snyk", "test", "--file=" + full_path, "--json", "--severity-threshold=low"],
                capture_output=True, text=True, timeout=120,
                env={**os.environ, "SNYK_TOKEN": settings.SNYK_TOKEN},
            )
            if result.stdout:
                try:
                    data = json.loads(result.stdout)
                    for v in data.get("vulnerabilities", []):
                        findings.append({
                            "rule_id": v.get("id", ""),
                            "cve": v.get("identifiers", {}).get("CVE", [""])[0],
                            "severity": v.get("severity", "medium").lower(),
                            "message": v.get("title", ""),
                            "file": manifest_path,
                            "line": None,
                            "package": v.get("packageName", ""),
                            "version": v.get("version", ""),
                            "fix_version": v.get("fixedIn", [""])[0] if v.get("fixedIn") else None,
                        })
                except json.JSONDecodeError:
                    pass
    return findings
