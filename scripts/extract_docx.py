"""One-time extraction of the speech document into plain text.

Usage:
    python -I scripts/extract_docx.py source-assets/Meridian_4_Topics_Speeches.docx scripts/extracted.txt

Uses direct DOCX XML parsing (standard library only). The production
application never parses DOCX; the output is a reference for authoring
src/content/presentationContent.ts and src/content/speakerNotes.ts.
"""

import sys
import zipfile
import xml.etree.ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def paragraphs(path):
    with zipfile.ZipFile(path) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    for p in root.iter(W + "p"):
        style = p.find(f"{W}pPr/{W}pStyle")
        style_name = style.get(W + "val") if style is not None else ""
        parts = []
        for node in p.iter():
            if node.tag == W + "t" and node.text:
                parts.append(node.text)
            elif node.tag == W + "tab":
                parts.append("\t")
            elif node.tag in (W + "br", W + "cr"):
                parts.append("\n")
        text = "".join(parts).strip()
        if text:
            yield style_name, text


def main():
    src = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else None
    lines = [f"[{s}] {t}" if s else t for s, t in paragraphs(src)]
    result = "\n\n".join(lines)
    if out:
        with open(out, "w", encoding="utf-8") as f:
            f.write(result)
    else:
        sys.stdout.reconfigure(encoding="utf-8")
        print(result)


if __name__ == "__main__":
    main()
