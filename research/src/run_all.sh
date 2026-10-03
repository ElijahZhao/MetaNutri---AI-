#!/usr/bin/env bash
# One-command reproduction of the full PPGR pipeline.
#
# From ``research/``:
#
#   bash src/run_all.sh                  # download data, then run everything
#   bash src/run_all.sh --skip-download  # reuse already-downloaded archives
#
# Downloads are idempotent, so re-running is safe. The step-by-step description
# of what each script does is in ``reports/technical_report.md`` §8.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"

SKIP_DOWNLOAD=0
case "${1:-}" in
  "")            ;;
  --skip-download) SKIP_DOWNLOAD=1 ;;
  *) echo "usage: bash src/run_all.sh [--skip-download]" >&2; exit 2 ;;
esac

# Prefer the project virtualenv; fall back to the system interpreter.
if [[ -x "$ROOT/.venv/bin/python" ]]; then
  PY="$ROOT/.venv/bin/python"
else
  PY="python3"
fi

cd "$ROOT"

step() {
  local label="$1"; shift
  echo
  echo "=== $label ==="
  "$@"
}

if [[ "$SKIP_DOWNLOAD" -eq 0 ]]; then
  step "download CGMacros (627 MB)" bash src/download_data.sh
  step "download BIG IDEAs (33 files, 2.4 MB)" "$PY" src/download_bigideas.py
else
  echo "=== skipping downloads (--skip-download) ==="
fi

step "build CGMacros meal-level table"      "$PY" src/build_dataset.py
step "LOPO evaluation (baselines + XGBoost)" "$PY" src/experiment.py
step "build BIG IDEAs meal-level table"     "$PY" src/build_external.py
step "cross-cohort validation"              "$PY" src/external_validate.py
step "figures 1-5"                          "$PY" src/make_figures.py
step "freeze model for the demo"            "$PY" src/train_final.py
step "render report PDF"                    "$PY" src/export_report_pdf.py

echo
echo "Pipeline complete: results in experiments/, figures and PDF in reports/,"
echo "frozen model in app/model/."
