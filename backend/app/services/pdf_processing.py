"""
PDF text processing with semantic chunking.
Port of pdfProcessingService.ts + pdfToMarkdownService.ts
"""

import re
from typing import Optional


# ─────────── Semantic Section Model ───────────

class SemanticSection:
    def __init__(self, type_: str, content: str, level: int = 1):
        self.type = type_  # heading | paragraph | list | table | other
        self.content = content
        self.level = level


# ─────────── Heading detection ───────────

def _is_likely_heading(text: str) -> bool:
    lines = text.split("\n")
    if len(lines) > 3:
        return False
    first_line = lines[0].strip()
    if not first_line:
        return False
    return bool(
        re.match(r"^\d+(\.\d+)*\.?\s", first_line)
        or re.match(r"^[IVX]+\.?\s", first_line)
        or re.match(r"^[A-Z]\.?\s", first_line)
        or (first_line == first_line.upper() and 3 < len(first_line) < 100)
        or re.match(r"^(section|chapter|part|article|clause|schedule|appendix|exhibit)\s+\d+", first_line, re.I)
        or (len(first_line) < 80 and first_line.endswith(":"))
        or (len(first_line) < 60 and len(lines) == 1)
    )


def _get_heading_level(heading: str) -> int:
    first_line = heading.split("\n")[0].strip()
    m = re.match(r"^(\d+(?:\.\d+)*)\.?\s", first_line)
    if m:
        return len(m.group(1).split("."))
    if re.match(r"^[IVX]+\.?\s", first_line):
        return 1
    if re.match(r"^[A-Z]\.?\s", first_line):
        return 2
    return 1


# ─────────── List / table detection ───────────

_LIST_PATTERNS = [
    re.compile(r"^\s*[-•*]\s"),
    re.compile(r"^\s*\d+\.\s"),
    re.compile(r"^\s*[a-z]\)\s"),
    re.compile(r"^\s*\([a-z]\)\s"),
]


def _is_likely_list(text: str) -> bool:
    lines = text.split("\n")
    matches = sum(1 for l in lines if any(p.match(l) for p in _LIST_PATTERNS))
    return matches > len(lines) * 0.5


def _is_likely_table(text: str) -> bool:
    lines = text.split("\n")
    has_multi_cols = any(len(re.split(r"\s{2,}|\t", l)) >= 3 for l in lines)
    enough_lines = len([l for l in lines if l.strip()]) > 2
    return has_multi_cols and enough_lines


# ─────────── Regex-based semantic parser ───────────

def _parse_with_regex(text: str) -> list[SemanticSection]:
    normalised = re.sub(r"\r\n", "\n", text)
    normalised = re.sub(r"\r", "\n", normalised)
    normalised = re.sub(r"\n{3,}", "\n\n", normalised)
    normalised = re.sub(r"[ \t]+", " ", normalised).strip()

    paragraphs = re.split(r"\n\s*\n", normalised)
    sections: list[SemanticSection] = []
    for para in paragraphs:
        trimmed = para.strip()
        if not trimmed:
            continue
        if _is_likely_heading(trimmed):
            sections.append(SemanticSection("heading", trimmed, _get_heading_level(trimmed)))
        elif _is_likely_list(trimmed):
            sections.append(SemanticSection("list", trimmed))
        elif _is_likely_table(trimmed):
            sections.append(SemanticSection("table", trimmed))
        else:
            sections.append(SemanticSection("paragraph", trimmed))
    return sections


# ─────────── Overlap helpers ───────────

def _get_overlap_text(text: str, overlap_size: int) -> str:
    if len(text) <= overlap_size:
        return text
    area = text[-int(overlap_size * 1.5):]
    m = re.search(r"[.!?]\s+[A-Z]", area)
    if m:
        idx = text.rfind(m.group(0)) + 1
        return text[idx:].strip()
    return text[-overlap_size:]


def _split_large_section(section: str, chunk_size: int, overlap: int) -> list[str]:
    chunks: list[str] = []
    start = 0
    while start < len(section):
        end = start + chunk_size
        if end < len(section):
            search_area = section[start + chunk_size - overlap: end + overlap]
            candidates = [
                search_area.rfind("\n\n"),
                search_area.rfind("\n"),
                search_area.rfind(". "),
                search_area.rfind(", "),
            ]
            candidates = [c for c in candidates if c != -1]
            if candidates:
                best = max(candidates)
                end = start + chunk_size - overlap + best
        chunk = section[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap
    return chunks


# ─────────── Convert sections → chunks ───────────

def _sections_to_chunks(
    sections: list[SemanticSection], chunk_size: int, overlap: int
) -> list[str]:
    chunks: list[str] = []
    current = ""
    for section in sections:
        s_len = len(section.content)
        if len(current) + s_len > chunk_size and current:
            chunks.append(current.strip())
            over = _get_overlap_text(current, overlap)
            current = over + ("\n\n" if over else "") + section.content
        else:
            current = (current + "\n\n" + section.content) if current else section.content
        if s_len > chunk_size:
            subs = _split_large_section(section.content, chunk_size, overlap)
            current = subs[0]
            for sub in subs[1:]:
                chunks.append(sub)
    if current.strip():
        chunks.append(current.strip())
    return chunks


# ─────────── Public API ───────────

def chunk_text(text: str, chunk_size: int = 4000, overlap: int = 300) -> list[str]:
    """Semantic-aware text chunking."""
    if len(text) <= chunk_size:
        return [text]
    sections = _parse_with_regex(text)
    return _sections_to_chunks(sections, chunk_size, overlap)


def convert_pdf_to_markdown(pdf_text: str) -> str:
    """
    Simple converter that normalises PDF text – same role as pdfToMarkdownService.ts.
    """
    md = re.sub(r"\r\n", "\n", pdf_text)
    md = re.sub(r"\r", "\n", md)
    md = re.sub(r"\n{3,}", "\n\n", md)
    lines = md.split("\n")
    result: list[str] = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            result.append("")
            continue
        if _is_likely_heading(stripped):
            level = _get_heading_level(stripped)
            result.append(f"{'#' * level} {stripped}")
        else:
            result.append(stripped)
    return "\n".join(result).strip()
