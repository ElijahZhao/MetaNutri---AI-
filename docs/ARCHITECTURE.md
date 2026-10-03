# Architecture

What the project is made of, who uses it, what it exposes, and which deviations
from the OpenSSF baseline it accepts on purpose. This document exists to satisfy
the design/interface documentation expected of a released project
(OSPS-SA-01.01, OSPS-SA-02.01), scaled to a single-author research portfolio
project rather than a multi-team product.

## 1. Purpose and scope

MetaNutri---AI- has three parts, deliberately separated:

1. **The platform** (`frontend/` + `backend/`) — a full-stack demonstration app.
   Its "AI" endpoints are **illustrative placeholders**: the interface is real,
   the models behind it are not. It is not wired to the research models.
2. **The research module** (`research/`) — the genuine machine learning:
   data pipeline, training, evaluation, the technical report, and a Streamlit
   demo that runs the real trained models.
3. **The deploy repo** (`ppgr-predictor`) — a curated, self-contained subset of
   (2), hosted on Streamlit Community Cloud. Regenerated from this repo; nothing
   flows back.

## 2. Actors

| Actor | Interacts with | Goal |
|---|---|---|
| Researcher / maintainer | `research/`, both repos | Train, evaluate, publish |
| Demo visitor | Streamlit app | Predict a meal's glucose response |
| Platform visitor | Next.js frontend → FastAPI backend | Explore the platform UI |
| Upstream data hosts | PhysioNet (CGMacros, BIG IDEAs) | Provide the training data |

## 3. Components and external interfaces

| Component | Tech | External interface |
|---|---|---|
| `frontend/` | Next.js 16 + React | Browser (HTTPS), Vercel hosting |
| `backend/` | FastAPI | REST over HTTPS, Render hosting |
| `research/` (pipeline) | Python + XGBoost | CLI (`src/run_all.sh`); CSV/figure/PDF outputs |
| `research/app/` (demo) | Streamlit | Web app; loads `model/*.json`, no network |
| `ppgr-predictor` | Streamlit Community Cloud | Public web app |

The only cross-component runtime contract is **frontend → backend REST**. The
demo and the research module run independently and share no code with the
platform.

## 4. Data flow

```
PhysioNet  ->  download_data.sh / download_bigideas.py
           ->  build_dataset.py        (meal-level table)
           ->  evaluate.py             (LOPO CV, external transfer)
           ->  uncertainty.py / mixed_effects.py   (intervals, variance)
           ->  make_figures.py         (reports/figures/*.png)
           ->  train_final.py          (frozen model -> research/app/model/*.json)
           ->  export_report_pdf.py    (reports/technical_report.pdf)
```

Every number in the report and in `ppgr-predictor`'s README is derived from the
CSV files this pipeline writes.

## 5. Testing and CI

| Area | What runs | Where |
|---|---|---|
| `frontend/` | typecheck, lint, Vitest, Playwright E2E, build | CI `frontend`, `e2e` |
| `backend/` | `compileall` + import smoke test | CI `backend` |
| `research/app/` | headless Streamlit `AppTest` | CI `research` |

The full research pipeline is **not** run in CI: it requires a 600 MB dataset
download and LOPO training on the whole cohort. It is reproduced on demand with
`bash research/src/run_all.sh`.

## 6. Accepted deviations from the OpenSSF baseline

Recorded here so the deviations are explicit rather than accidental:

- **Generated artifacts are tracked in version control** (model `*.json`, the
  report `*.pdf`, `figures/*.png`, `experiments/*.csv`). This is intentional:
  the demo must ship a frozen model without a training stack, and the report PDF
  is a deliverable. This is a documented exception to OSPS-QA-05.01/05.02.
- **No L2/L3 controls** (two-person review, signed releases, SBOM, VEX,
  support-duration policy). The project has a single maintainer and no
  distributed binaries, so those controls do not apply.
- **Training is not part of CI** (see §5); the demo smoke test is the automated
  gate.

## 7. Trust boundary

This is not a clinical tool. The demo's predictions are research outputs, the
platform's AI endpoints are placeholders, and neither should be used for medical
decisions. The UI states this on every screen that shows a prediction.
