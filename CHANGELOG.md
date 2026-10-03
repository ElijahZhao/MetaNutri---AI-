# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-03

First tagged release: the research module, the deployed PPGR demo, and a
full-stack platform whose AI features are labelled as demonstrative.

### Added

- `research/` — a reproducible postprandial-glucose pipeline on CGMacros
  (45 subjects / 1,557 meals) with strict leave-one-subject-out validation,
  external transfer to BIG IDEAs, conformal prediction intervals, a
  within/between-subject decomposition, and a subject-random-intercept
  mixed-effects model.
- `research/reports/technical_report.{md,pdf}` — a 16-page technical report whose
  figures and tables are generated from `research/experiments/*.csv`.
- Streamlit PPGR demo (`research/app/`) running the frozen XGBoost bundle with
  exact TreeSHAP explanations, deployed at
  <https://metanutri-ai-ppgr-predictor.streamlit.app/>.
- `research/app/test_app.py` — a headless Streamlit `AppTest` smoke test.
- A `research` CI job that runs the demo smoke test
  (`.github/workflows/ci.yml`).
- `SECURITY.md` and `docs/ARCHITECTURE.md`.

### Changed

- Deployment moved from Hugging Face Spaces to Streamlit Community Cloud, whose
  free tier still supports the Streamlit SDK.
- The technical-report PDF is now byte-reproducible (`SOURCE_DATE_EPOCH` pinned
  in `research/src/export_report_pdf.py`).

### Fixed

- `research/requirements.txt` now declares the packages `src/run_all.sh` needs
  (`requests`, `markdown`, `weasyprint`), so the documented one-command
  reproduction no longer fails partway through on a clean environment.
