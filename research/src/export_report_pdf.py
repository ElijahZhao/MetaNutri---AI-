#!/usr/bin/env python3
"""Render ``reports/technical_report.md`` to a print-ready A4 PDF.

Kept as a script (rather than a one-off conversion) so the PDF can be
regenerated whenever the report changes:

    python src/export_report_pdf.py

Figures are resolved relative to the report directory, so the Markdown stays the
single source of truth and the existing ``figures/*.png`` paths work unchanged.
Requires ``markdown`` and ``weasyprint`` (report-tooling only — they are not
needed to train or to run the demo).
"""

from __future__ import annotations

import os
import re

# Pin the build timestamp so the PDF is byte-for-byte reproducible. Without
# this, both WeasyPrint (document date) and fontTools/FreeType (the subset
# font's ``head.modified`` field) stamp the current wall-clock time, so every
# regeneration produces a content-identical but byte-different PDF — a dirty
# diff for anyone who re-runs the pipeline. Honours a caller-provided
# SOURCE_DATE_EPOCH; defaults to 2024-01-01T00:00:00Z.
os.environ.setdefault("SOURCE_DATE_EPOCH", "1704067200")

import markdown  # noqa: E402  (must follow the SOURCE_DATE_EPOCH pin above)
from weasyprint import HTML  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
REPORT_DIR = os.path.abspath(os.path.join(HERE, "..", "reports"))
MD_PATH = os.path.join(REPORT_DIR, "technical_report.md")
PDF_PATH = os.path.join(REPORT_DIR, "technical_report.pdf")

CSS = """
@page {
  size: A4;
  margin: 19mm 17mm 16mm 17mm;
  @bottom-center {
    content: counter(page) " / " counter(pages);
    font-size: 8.5pt;
    color: #8a8a8a;
  }
}
body {
  font-family: "DejaVu Serif", Georgia, "Times New Roman", serif;
  font-size: 10.2pt;
  line-height: 1.52;
  color: #191919;
}
h1 { font-size: 19pt; line-height: 1.25; margin: 0 0 0.25em; }
h2 {
  font-size: 13.5pt; margin: 1.55em 0 0.45em; padding-bottom: 0.18em;
  border-bottom: 1px solid #dddddd; page-break-after: avoid;
}
h3 { font-size: 11.4pt; margin: 1.2em 0 0.35em; page-break-after: avoid; }
p { margin: 0.55em 0; text-align: justify; }
hr { border: none; border-top: 1px solid #e3e3e3; margin: 1.15em 0; }
blockquote {
  margin: 0.9em 0; padding: 0.62em 0.95em; background: #f6f7f9;
  border-left: 3px solid #2c6fbb; font-size: 9.2pt; color: #333333;
}
table {
  width: 100%; border-collapse: collapse; margin: 0.7em 0;
  font-size: 8.7pt; page-break-inside: avoid;
}
th, td {
  border: 1px solid #d8d8d8; padding: 3.5px 6px;
  text-align: left; vertical-align: top;
}
th { background: #eef2f7; }
img { max-width: 100%; height: auto; display: block; margin: 0.55em auto 0; }
p.caption {
  font-size: 8.6pt; color: #555555; text-align: center;
  margin: 0.3em 0 1.15em;
}
code {
  font-family: "DejaVu Sans Mono", "Courier New", monospace;
  font-size: 8.8pt; background: #f2f2f2; padding: 0 2px;
}
pre {
  background: #f6f8fa; border: 1px solid #e4e4e4; padding: 0.55em 0.7em;
  font-family: "DejaVu Sans Mono", "Courier New", monospace;
  font-size: 8.3pt; line-height: 1.4; white-space: pre-wrap;
  overflow-wrap: break-word; page-break-inside: avoid;
}
a { color: #1a4f8a; text-decoration: none; }
"""


def markdown_to_html(text: str) -> str:
    body = markdown.markdown(
        text,
        extensions=["tables", "fenced_code", "sane_lists", "attr_list"],
    )
    # Tag "**Figure N — …**" / "**Table N — …**" paragraphs so they render as
    # captions instead of full-weight body text.
    body = re.sub(
        r"<p>(<strong>(?:Figure|Table)\b.*?</strong>(?:\s.*?)?)</p>",
        r'<p class="caption">\1</p>',
        body,
        flags=re.DOTALL,
    )
    return body


def main() -> None:
    with open(MD_PATH, encoding="utf-8") as fh:
        md_text = fh.read()

    html = (
        "<!DOCTYPE html><html><head><meta charset='utf-8'>"
        f"<style>{CSS}</style></head><body>"
        f"{markdown_to_html(md_text)}</body></html>"
    )
    HTML(string=html, base_url=REPORT_DIR).write_pdf(PDF_PATH)
    size_kb = os.path.getsize(PDF_PATH) / 1024
    print(f"wrote {PDF_PATH} ({size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
