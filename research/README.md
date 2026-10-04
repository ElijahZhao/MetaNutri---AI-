# research/ — real-AI research module

Independent of the MetaNutri platform (`backend/`, `frontend/`): its own
dependencies and its own deployment. See [`docs/ROADMAP.md`](../docs/ROADMAP.md)
for the full plan.

## Task

Postprandial glucose-response prediction (PPGR) on **CGMacros**: given a meal's
macronutrients plus subject features, predict the 2-hour incremental area under
the glucose curve (iAUC), the total AUC and peak glucose rise. The frozen model
is then tested for cross-cohort generalisation on **BIG IDEAs**.

## Status

- [x] P1 — pipeline: download → clean → EDA → LOPO split → baselines → XGBoost → evaluation
- [x] P2 — technical report ([Markdown](reports/technical_report.md) ·
      [PDF](reports/technical_report.pdf), regenerate with `src/export_report_pdf.py`)
- [x] P3 — Streamlit demo: built and validated (in-process `AppTest`; the check
      is committed as [`app/test_app.py`](app/test_app.py) and runs with
      `python app/test_app.py`), pushed to
      [`ElijahZhao/ppgr-predictor`](https://github.com/ElijahZhao/ppgr-predictor)
  - deployed on **Streamlit Community Cloud** — Hugging Face's free tier no longer
    offers a Streamlit SDK (Gradio/Docker require PRO)
  - live: <https://metanutri-ai-ppgr-predictor.streamlit.app/>
  - includes a read-only **external-validation panel** (frozen-model results)
- [x] External validation (stretch goal) on **BIG IDEAs** (16 subjects, 656
      meals): `download_bigideas.py` → `build_external.py` → `external_validate.py`,
      reported in §4.4 of the technical report.
- [x] Evaluation hardening: within-/between-subject variance decomposition and a
      median-split ROC-AUC (`evaluate.py`, report §4.5), distribution-free
      conformal prediction intervals (`uncertainty.py`, report §4.6), and a
      mixed-effects check of repeated meals with a subject random intercept
      (`mixed_effects.py`, report §4.7).
- [ ] P4 — connect the model back to the platform: **decided against** (violates
      the "freeze the backend" constraint, and the 512 MB host cannot carry it).

## Quick start

```bash
# 1. set up the environment
python -m venv .venv && .venv/bin/pip install -r requirements.txt

# 2. reproduce everything with one command (data → results → figures → PDF)
bash src/run_all.sh                  # downloads CGMacros + BIG IDEAs first
bash src/run_all.sh --skip-download  # reuse already-downloaded archives
```

Downloads are idempotent, so re-running is safe. `run_all.sh` is a thin wrapper
around the individual scripts listed in `reports/technical_report.md` §8.

## Layout

```
research/
├── data/          datasets (never committed; see data/README.md)
├── src/           pipeline: download / clean / features / models / evaluate
├── experiments/   reproducible runs (fixed seeds)
├── reports/       technical report (writing sample)
├── app/           Streamlit demo
└── prototypes/    archived PyTorch prototypes (unused; not part of the pipeline)
```

## License

CGMacros is **CC BY-NC-SA 4.0** — non-commercial research/portfolio use only;
attribute the source. BIG IDEAs is **ODC-By 1.0** (attribution). See
[`data/README.md`](data/README.md).
