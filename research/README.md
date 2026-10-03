# research/ — real-AI research module

Independent of the MetaNutri platform (`backend/`, `frontend/`): its own
dependencies and its own deployment. See [`docs/ROADMAP.md`](../docs/ROADMAP.md)
for the full plan.

## Task

Postprandial glucose-response prediction (PPGR) on **CGMacros**: given a meal's
macronutrients plus subject features, predict the 2-hour incremental area under
the glucose curve (iAUC) and peak glucose rise.

## Status

- [x] P0 — honesty pass (platform docs)
- [x] P1 — pipeline: download → clean → EDA → LOPO split → baselines → XGBoost → evaluation
- [x] P2 — technical report ([`reports/technical_report.md`](reports/technical_report.md))
- [ ] P3 — Streamlit demo (Hugging Face Spaces)

## Quick start

```bash
# 1. get data (627 MB, ~10–40 min via the open S3 endpoint)
bash src/download_data.sh

# 2. set up the environment
python -m venv .venv && .venv/bin/pip install -r requirements.txt
```

## Layout

```
research/
├── data/          datasets (never committed; see data/README.md)
├── src/           pipeline: download / clean / features / models / evaluate
├── experiments/   reproducible runs (fixed seeds)
├── reports/       technical report (writing sample)
└── app/           Streamlit demo
```

## License

CGMacros is **CC BY-NC-SA 4.0** — non-commercial research/portfolio use only;
attribute the source. See [`data/README.md`](data/README.md).
