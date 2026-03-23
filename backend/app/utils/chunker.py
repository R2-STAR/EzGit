import re
from typing import List


def chunk_code(content: str, max_chars: int = 600, overlap: int = 100) -> List[str]:
    boundaries = list(re.finditer(
        r"^(?:def |class |function |const |export |async def |public |private )",
        content, re.MULTILINE,
    ))
    if len(boundaries) > 2:
        chunks = []
        for i, match in enumerate(boundaries):
            start = match.start()
            end = boundaries[i + 1].start() if i + 1 < len(boundaries) else len(content)
            segment = content[start:end].strip()
            if len(segment) > max_chars:
                chunks.extend(_split_by_chars(segment, max_chars, overlap))
            elif len(segment) > 30:
                chunks.append(segment)
        return chunks
    return _split_by_chars(content, max_chars, overlap)


def _split_by_chars(text: str, max_chars: int, overlap: int) -> List[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        chunk = text[start:end].strip()
        if len(chunk) > 30:
            chunks.append(chunk)
        start += max_chars - overlap
    return chunks
