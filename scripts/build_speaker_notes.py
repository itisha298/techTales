"""Refreshes the verbatim speeches in src/content/editable/speakerNotes.json.

Usage:
    python -I scripts/extract_docx.py source-assets/Meridian_4_Topics_Speeches.docx scripts/extracted.txt
    python -I scripts/build_speaker_notes.py

Copies the speeches and delivery tips verbatim from the extracted document
and tags each paragraph with the scene it is delivered on. Only the
"speeches" section is replaced; speaker plans and scene cues are kept.
Re-running it discards manual edits to the speech text (which should stay
word-for-word with the source document anyway).
"""

import json
import re

SRC = "scripts/extracted.txt"
OUT = "src/content/editable/speakerNotes.json"

# Paragraph index ranges (inclusive start, exclusive end) -> scene id.
SCENE_MAP = {
    "mayank": [(0, 3, "opening"), (3, 8, "context"), (8, 10, "journey"), (10, 11, "context")],
    "sushant": [(0, 7, "innovation-challenge"), (7, 12, "innovation-solution")],
    "neeti": [(0, 16, "value"), (16, 24, "june-28")],
    "suryakant": [(0, 12, "assessment"), (12, 13, "qa")],
}
SPEAKER_ID = {"mayank": "mayank", "sushant": "sushant", "neeti": "neeti", "suryakant": "suryakanta"}


def parse():
    blocks = open(SRC, encoding="utf-8").read().split("\n\n")
    out, cur, mode = {}, None, None
    for line in blocks:
        m = re.match(r"^SPEECH · (\w+)$", line)
        if m:
            cur = m.group(1).lower()
            out[cur] = {"paragraphs": [], "tips": []}
            mode = "p"
            continue
        if line == "DELIVERY TIPS":
            mode = "t"
            continue
        if line.startswith("[Heading1]"):
            mode = None
            continue
        if cur and mode == "p":
            out[cur]["paragraphs"].append(line)
        elif cur and mode == "t" and line.startswith("[ListParagraph] "):
            out[cur]["tips"].append(line[len("[ListParagraph] "):])
    return out


def scene_for(speaker, i):
    for a, b, scene in SCENE_MAP[speaker]:
        if a <= i < b:
            return scene
    raise ValueError(f"unmapped paragraph {speaker}[{i}]")


def main():
    data = parse()
    with open(OUT, encoding="utf-8") as f:
        notes = json.load(f)
    speeches = {}
    for speaker, d in data.items():
        speeches[SPEAKER_ID[speaker]] = {
            "paragraphs": [{"scene": scene_for(speaker, i), "text": p} for i, p in enumerate(d["paragraphs"])],
            "deliveryTips": d["tips"],
        }
    notes["speeches"] = speeches  # speaker plans and scene cues are kept as edited
    with open(OUT, "w", encoding="utf-8", newline=chr(10)) as f:
        json.dump(notes, f, ensure_ascii=False, indent=2)
        f.write(chr(10))
    print("refreshed speeches in", OUT)


if __name__ == "__main__":
    main()
