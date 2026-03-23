import re
from typing import List


def extract_functions(content: str, language: str = "python") -> List[dict]:
    patterns = {
        "python": r"^(?:async )?def ([a-zA-Z_]\w*)\s*\(",
        "typescript": r"(?:function|const|async function)\s+([a-zA-Z_]\w*)\s*[=(]",
        "javascript": r"(?:function|const|async function)\s+([a-zA-Z_]\w*)\s*[=(]",
        "go": r"^func\s+(?:\([^)]+\)\s+)?([a-zA-Z_]\w*)\s*\(",
        "java": r"(?:public|private|protected|static|\s)+[\w<>\[\]]+\s+([a-zA-Z_]\w*)\s*\(",
    }
    pattern = patterns.get(language, patterns["python"])
    results = []
    for i, line in enumerate(content.split("\n"), 1):
        match = re.search(pattern, line)
        if match:
            results.append({"name": match.group(1), "line": i, "language": language})
    return results


def detect_file_language(file_path: str) -> str:
    ext_map = {
        ".py": "python", ".ts": "typescript", ".tsx": "typescript",
        ".js": "javascript", ".jsx": "javascript", ".go": "go",
        ".java": "java", ".rb": "ruby", ".rs": "rust",
    }
    for ext, lang in ext_map.items():
        if file_path.endswith(ext):
            return lang
    return "unknown"


def normalize_severity(severity: str) -> str:
    severity = severity.lower().strip()
    mapping = {
        "error": "high", "warning": "medium", "info": "low",
        "critical": "critical", "high": "high", "medium": "medium",
        "moderate": "medium", "low": "low",
    }
    return mapping.get(severity, "medium")
