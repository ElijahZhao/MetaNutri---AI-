# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Dependabot version updates for pip (backend, research, demo), npm and GitHub
  Actions — one grouped PR per ecosystem per week.
- A `ruff` lint gate for `research/`, plus inference unit tests and a 90%
  coverage gate (`research/ruff.toml`, `research/pyproject.toml`,
  `research/app/tests/`). The `research` CI job now runs lint + tests instead of
  only the AppTest smoke test.
- `CITATION.cff`.

### Changed

- `/api/predict/nutrient-absorption` is now fully deterministic. Its absorption
  rate was jittered with `np.random.uniform`, so identical requests returned
  different numbers; it now follows a saturating dose-response curve. Both
  READMEs and `docs/API.md` were updated to drop the "random values" wording.
- `/api/metabolomics/analysis` no longer fabricates `enrichment_score` /
  `p_value` with `np.random.uniform`. Both are now deterministic functions of the
  pathway counts (still illustrative, not a statistical test), so the same
  upload always reports the same numbers. The response shape is unchanged, so the
  frontend needs no update.
- `backend/Dockerfile` now runs as a non-root user (`appuser`), matching the
  frontend image.
- `.dockerignore` now excludes `research/` and venv / build artefacts, and the
  `.trae-html-share-packages` rule is corrected (it was missing the leading dot,
  so the directory was never ignored).
- Removed the unused imports and one unused local variable flagged by
  `ruff check app --select F` (backend `app/` now passes cleanly).

### Removed

- Dead `SHAPExplainer` / `LIMEExplainer` prototypes in
  `backend/app/ml/explainability.py` — no endpoint referenced them, and the LIME
  one fabricated its attributions with `np.random.uniform`.
- The backend dependencies nothing else used once those classes were gone:
  `shap==0.46.0`, `scikit-learn==1.5.1`, `scipy==1.14.0`.

### Fixed

- Change-password and reset-password failed with a 422 on every call: the
  frontend posted camelCase (`oldPassword` / `newPassword`) while the backend
  models expect snake_case (`old_password` / `new_password`). The request bodies
  now match the API contract, so both flows work again.
- Saving the profile failed with a 422 for every user. The form submitted
  `dietary_goals` / `dietary_restrictions` as string arrays, but the schema and
  the JSONB columns store them as `{ key: true }` objects (and reading a stored
  profile back as an array could throw). The form now converts between the two
  representations, so both save and reload work.
- Corrected the response types of three unused `datasetAPI` helpers
  (`categories`, `tianchiSearch`, `tianchiDetail`) so they match what the
  backend actually returns.
- `FeatureContributionExplainer` grouped contributions by a fixed-size slice, so
  when every contribution was positive the API interpretation still reported the
  smallest positives as "main negative factors". Contributions are now grouped
  by their sign.
- `calculate_confidence` raised `ZeroDivisionError` on an empty feature dict.
- The `research` CI job pinned Python 3.11, which cannot install
  `research/requirements.txt` (`numpy 2.5` / `pandas 3` require >=3.12); it now
  uses 3.12, matching the documented requirement.
- `evaluate.within_between()` now reports `0.0` (was `NaN`) for a predictor that
  is constant within every subject, matching the convention already recorded in
  `experiments/results.csv` and report §4.5 — so that CSV is reproducible from
  the code again.
- Clarified the CGMacros internal sample size used by external validation
  (all 1,699 meals, vs. the 1,557-meal `iauc > 0` subset in §4.2) in both
  `external_validate.py` and the technical report, so the two "internal" numbers
  are not mistakenly compared.
- The `forgot-password` page now reads the `?token=` query parameter, so a reset
  link delivered out of band opens the new-password form directly instead of
  being ignored. Covered by a new `content.test.tsx` regression test.

### Security

- `ci.yml` and `keepalive.yml` now declare `permissions: contents: read`, so the
  default `GITHUB_TOKEN` is scoped to least privilege instead of the repository
  default.
- `/api/auth/forgot-password` no longer returns the reset token to the caller by
  default. Previously anyone could submit a known email and receive a token that
  reset that account's password (account takeover, plus user enumeration). The
  token is now returned only when `PASSWORD_RESET_RETURN_TOKEN` is explicitly
  enabled for local development.
- The backend now refuses to start with `COOKIE_SAMESITE=none`, which would
  silently remove the project's only CSRF defence, unless
  `ALLOW_INSECURE_SAMESITE_NONE=1` is set.
- CodeQL code scanning is now enabled for both repositories. Its first pass
  raised three alerts, all addressed here: `/health` is public and no longer
  returns the database exception type/message (it logs the detail server-side and
  reports a bare `error`); the import endpoint no longer echoes per-record
  exception text to the client (logged instead); and the TianChi mock downloader
  now restricts `dataset_id` to a filename-safe set and verifies the resolved
  path stays inside the target directory.

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
