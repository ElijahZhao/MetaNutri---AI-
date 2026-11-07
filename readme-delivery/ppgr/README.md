<div align="center">

<p align="right">
  <strong>English</strong> | <a href="README.zh-CN.md">简体中文</a>
</p>

# 🩸 PPGR Predictor

**Postprandial glucose-response prediction — XGBoost with leave-one-subject-out validation.**

[![Live demo](https://img.shields.io/badge/Live_demo-Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](https://metanutri-ai-ppgr-predictor.streamlit.app/)
[![CI](https://github.com/ElijahZhao/MetaNutri-Ai-ppgr-predictor/actions/workflows/ci.yml/badge.svg)](https://github.com/ElijahZhao/MetaNutri-Ai-ppgr-predictor/actions/workflows/ci.yml)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-3.4.1-EB6E4B?style=for-the-badge)](https://xgboost.readthedocs.io/)
[![License: MIT (code)](https://img.shields.io/badge/License-MIT_(code)-yellow?style=for-the-badge)](LICENSE)
[![License: CC BY-NC-SA 4.0 (derived data)](https://img.shields.io/badge/License-CC_BY--NC--SA_4.0_(derived_data)-lightgrey?style=for-the-badge)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Parent repo](https://img.shields.io/badge/Parent-MetaNutri--AI--10b981?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ElijahZhao/MetaNutri---AI-)
[![Preprint](https://img.shields.io/badge/DOI-10.21203%2Frs.3.rs--11558064%2Fv1-0ea5e9?style=for-the-badge)](https://doi.org/10.21203/rs.3.rs-11558064/v1)

**A frozen XGBoost bundle · TreeSHAP explanations · 45 subjects · 1,557 meals · leave-one-subject-out**

</div>

Predicting the **2-hour postprandial glucose response (PPGR)** to a meal from its macronutrient composition plus a handful of subject-level clinical features.

Trained on [CGMacros](https://physionet.org/content/cgmacros/1.0.0/) (45 subjects, 1,557 meals) and validated **leave-one-subject-out (LOPO)** — every prediction is made for a person the model has never seen.

> **Headline:** LOPO breakfast — **AUC r = 0.890**, **iAUC r = 0.655**, reproducing the published CGMacros baseline. The same frozen model transferred to another cohort gives **iAUC r = 0.23**; why it drops is the subject of the [measurement-reliability preprint](https://doi.org/10.21203/rs.3.rs-11558064/v1).

**Live demo:** <https://metanutri-ai-ppgr-predictor.streamlit.app/> · **Parent platform:** <https://meta-nutri-ai.vercel.app/>

## ✨ Highlights

- **Real predictive performance.** Breakfast LOPO AUC *r* = 0.890 and iAUC *r* = 0.655; across all meal types AUC *r* = 0.838 and iAUC *r* = 0.451.
- **No subject leakage.** Strict leave-one-subject-out; missing values are imputed and standardised with training-fold statistics only.
- **Cross-cohort honesty.** AUC transfers partially to BIG IDEAs (*r* = 0.569), while iAUC and peak rise collapse to ≈ 0.22 — reported rather than hidden.
- **Exact explanations.** Per-meal TreeSHAP contributions via XGBoost `pred_contribs`.
- **One-way provenance.** The 32 curated files are copied from the parent `research/` module and checked byte-for-byte in CI.

## 📸 Preview

| Model comparison | Within- and between-subject skill |
|---|---|
| ![Model comparison](reports/figures/fig2_model_comparison.png) | ![Within- and between-subject skill](reports/figures/fig6_within_between.png) |

| External validation (BIG IDEAs) | Conformal prediction intervals |
|---|---|
| ![External validation](reports/figures/fig5_external_validation.png) | ![Conformal intervals](reports/figures/fig7_conformal.png) |

Live demo: <https://metanutri-ai-ppgr-predictor.streamlit.app/>

## 🚀 Quick start

```bash
git clone https://github.com/ElijahZhao/MetaNutri-Ai-ppgr-predictor.git
cd MetaNutri-Ai-ppgr-predictor
pip install -r requirements.txt
streamlit run app.py
```

The app predicts the three scalar metrics, draws an *illustrative* 2-hour curve, and shows per-feature TreeSHAP contributions.

> The models predict **scalars, not a time series**. The plotted curve is a population-average gamma shape scaled to the predicted peak rise and iAUC, and the UI labels it as a reconstruction rather than a model output.

Run the headless smoke test:

```bash
python test_app.py
```

It boots `app.py` with Streamlit's `AppTest` harness, presses **Predict**, and asserts that the three predictions and the TreeSHAP panel render — no server and no network required.

## 📁 Project structure

```
app.py                Streamlit demo
test_app.py           headless AppTest smoke test
inference.py          model loading, prediction, TreeSHAP, curve reconstruction
model/                frozen boosters + preprocessing metadata
assets/               bundled results for the external-validation panel
requirements.txt      pinned demo dependencies
src/                  provenance copy of the parent's research/src/
reports/              provenance copy of the parent's research/reports/
experiments/          provenance copy of the parent's research/experiments/
data/README.md        data provenance and download instructions
```

## 🛠️ Tech stack

| Component | Choice |
|---|---|
| Language | Python 3.12 |
| Demo UI | Streamlit 1.65.0 |
| Model | XGBoost 3.4.1, one booster per target |
| Data | NumPy 2.5.3 · pandas 3.0.6 · SciPy 1.18.1 |
| Explanations | TreeSHAP (`pred_contribs`) |
| Test | Streamlit `AppTest` |

## ❓ FAQ

<details>
<summary><strong>Is this a medical device?</strong></summary>

No. Research and portfolio use only; nothing here is medical advice.
</details>

<details>
<summary><strong>Why is iAUC harder to predict than AUC?</strong></summary>

AUC is dominated by a person's overall glucose level; iAUC isolates the meal-driven excursion above baseline, which is a smaller and noisier signal.
</details>

<details>
<summary><strong>Why does external validation drop so much?</strong></summary>

The BIG IDEAs cohort uses a different CGM device (Dexcom G6), free-living food logs and only five shared features. The [preprint](https://doi.org/10.21203/rs.3.rs-11558064/v1) argues that measurement reliability confounds the comparison.
</details>

<details>
<summary><strong>Where is the model trained?</strong></summary>

In the parent repository's `research/` module. This repo ships the frozen JSON boosters so the demo needs no training stack; if the two ever disagree, the parent wins.
</details>

<details>
<summary><strong>Does the demo need network access?</strong></summary>

No. It loads the frozen boosters locally; only the Streamlit page itself is served over the network.
</details>

## 📝 Changelog

This repository is a regenerated deployment copy and does **not** maintain a separate changelog. Its contents track the parent `research/` module and are pinned at tag [`v1.0.0`](https://github.com/ElijahZhao/MetaNutri-Ai-ppgr-predictor/tree/v1.0.0); the parent's release notes are in [`MetaNutri---AI-/CHANGELOG.md`](https://github.com/ElijahZhao/MetaNutri---AI-/blob/main/CHANGELOG.md).

## 🔗 The MetaNutri ecosystem

| Repository | Role | Live |
|---|---|---|
| [`MetaNutri---AI-`](https://github.com/ElijahZhao/MetaNutri---AI-) | Parent — full-stack platform plus the `research/` module that trained and evaluated these models; hosts preprint ① | <https://meta-nutri-ai.vercel.app> |
| **This repository** | Deployment shell — Streamlit demo, regenerated one-way from the parent | <https://metanutri-ai-ppgr-predictor.streamlit.app> |
| [`MetaNutri-Ai-RAG`](https://github.com/ElijahZhao/MetaNutri-Ai-RAG) | Independent research repo — NutriQA benchmark over Chinese nutrition data; hosts preprint ② ([DOI `10.21203/rs.3.rs-11565315/v1`](https://doi.org/10.21203/rs.3.rs-11565315/v1)) | <https://metanutri-ai-rag-question-answering.streamlit.app> |

**Flow is one way:** the parent → this repository. Nothing flows back, and the two do not interact at runtime: no API calls, no shared package, no data exchange.

**Why not a submodule:** Streamlit Community Cloud builds the repository root and expects `app.py` there; a submodule would add a checkout step and a failure mode without removing the need for this curated subset.

**Drift check.** CI runs [`scripts/check_sync.py`](scripts/check_sync.py), which resolves the parent tree through the GitHub API and compares git blob SHAs for the 32 curated files.

## 📊 Results (LOPO, Pearson r)

| Target | Breakfast only (n=423) | All meals (n=1,557) |
|---|---|---|
| XGBoost — 2-h AUC | **0.890** | **0.838** |
| XGBoost — 2-h iAUC | **0.655** | **0.451** |
| XGBoost — peak glucose rise | **0.632** | **0.542** |
| Energy-only linear — iAUC | 0.255 | 0.143 |
| Carb-only linear — iAUC | 0.107 | 0.147 |

The breakfast column reproduces the CGMacros paper's own baseline (AUC *r* ≈ 0.89, iAUC *r* ≈ 0.64); the all-meals column extends it to lunch, dinner and snacks. The baselines underperforming by a wide margin is the point: a carbohydrate count alone explains almost none of the subject-specific response.

Splitting the pooled correlation shows that AUC's high *r* is driven mainly by the between-subject component, whereas iAUC's within- and between-subject components are nearly equal — making iAUC the more genuinely meal-level signal. Median-split ROC-AUC ranges 0.74–0.96 across targets. Details in §4.5 of the [technical report](reports/technical_report.pdf).

Conformal intervals reach marginal coverage close to nominal (0.800 / 0.898), but are wide and under-cover a minority of individuals (§4.6). A subject-random-intercept mixed-effects check gives ICC = 0.69 for AUC and 0.33 for iAUC (§4.7).

## 🌍 External validation (BIG IDEAs)

The frozen CGMacros model is applied, with **no retraining**, to [BIG IDEAs](https://physionet.org/content/big-ideas-glycemic-wearable/1.1.2/) — 16 subjects, 656 meals, a different CGM device (Dexcom G6), free-living food logs — using only the five features shared by both datasets.

| Protocol (5 shared features) | 2-h iAUC r | 2-h AUC r | Peak r |
|---|---|---|---|
| CGMacros (LOPO, internal) | 0.49 | 0.82 | 0.51 |
| BIG IDEAs (LOPO, internal) | 0.46 | 0.63 | 0.48 |
| **BIG IDEAs (external transfer)** | **0.23** | **0.57** | **0.22** |
| BIG IDEAs (external, carb-only Ridge) | 0.36 | 0.29 | 0.36 |

AUC transfers partially; iAUC and peak rise collapse, and a carb-only Ridge regression transfers *better* on those two targets. The internal LOPO row shows this is a shift between cohorts, not noise in the external data. The demo exposes the panel under "Does it generalise to another cohort?".

## ⚙️ How it works

- **Features** — meal: carbohydrate / protein / fat / fiber (g), meal-time glucose. Subject: age, sex, BMI, HbA1c, fasting glucose, fasting insulin, HOMA-IR (derived), triglycerides, total cholesterol, HDL, non-HDL, LDL, VLDL, Chol/HDL.
- **Targets** — 2-h incremental AUC above baseline, 2-h total AUC, peak glucose rise.
- **Model** — XGBoost, one booster per target, `max_depth=1`, `n_estimators=80`, `learning_rate=0.2`.
- **Protocol** — leave-one-subject-out. Missing features are imputed with training-fold medians and standardised with training-fold statistics, so no information leaks from the held-out subject.
- **Explanations** — exact TreeSHAP values.

## 🔁 Retraining and reproduction

The `src/`, `reports/` and `experiments/` trees are a provenance copy of the parent's [`research/`](https://github.com/ElijahZhao/MetaNutri---AI-/tree/main/research) module. Retraining always runs **in the parent**, from its `research/` directory:

```bash
bash src/run_all.sh --skip-download   # data → results → figures → PDF
```

Or step by step:

```bash
python src/download_data.py      # fetch CGMacros (~627 MB)
python src/build_dataset.py      # build the meal-level dataset
python src/experiment.py         # run the LOPO suite
python src/train_final.py        # export the deployable models
```

## 📌 How to cite

Preprint (Research Square, v1, 2 November 2026, **CC BY 4.0**):
[`10.21203/rs.3.rs-11558064/v1`](https://doi.org/10.21203/rs.3.rs-11558064/v1) · [PDF in the parent repository](https://github.com/ElijahZhao/MetaNutri---AI-/blob/main/preprint/2026-11-02_measurement-reliability-ppgr_preprint_v1.pdf)

This repository ships a [`CITATION.cff`](CITATION.cff), so GitHub's *Cite this repository* button offers the preprint directly.

```bibtex
@misc{zhao2026ppgr,
  author       = {Yulin Zhao},
  title        = {Measurement Reliability Confounds Cross-Regime Comparisons of Postprandial Glucose Prediction: Evidence from Bidirectional Cross-Cohort Transfer},
  year         = {2026},
  publisher    = {Research Square},
  doi          = {10.21203/rs.3.rs-11558064/v1},
  url          = {https://doi.org/10.21203/rs.3.rs-11558064/v1},
  note         = {Preprint, CC BY 4.0}
}
```

## 📄 Data and license

**Licensing is layered — see [NOTICE.md](NOTICE.md).** Code (`app.py`, `inference.py`, `src/`, `test_app.py`) is **MIT**. Everything computed from the datasets (`model/*.json`, `experiments/*.csv`, `assets/*`, `reports/*`) is **CC BY-NC-SA 4.0**. The repository-level [LICENSE](LICENSE) file is the MIT text and covers the code layer only.

[CGMacros](https://physionet.org/content/cgmacros/1.0.0/) — PhysioNet, DOI [10.13026/3z8q-x658](https://doi.org/10.13026/3z8q-x658), **CC BY-NC-SA 4.0**. Raw data is not redistributed here; `src/download_data.py` fetches it. Models derived from it are distributed under the same license, with attribution.

External validation uses [BIG IDEAs](https://physionet.org/content/big-ideas-glycemic-wearable/1.1.2/) — PhysioNet, DOI [10.13026/zthx-5212](https://doi.org/10.13026/zthx-5212), **ODC-By 1.0**.

## ⚠️ Limitations

- Small cohort (45 subjects) with a narrow demographic range; held-out performance on unseen subjects is much lower than within-subject performance.
- iAUC is substantially harder to predict than AUC.
- **External validation is modest:** AUC transfers (*r* ≈ 0.57), but iAUC and peak rise do not (*r* ≈ 0.22), and a carb-only baseline transfers better on those targets.
- The illustrative curve is a visual aid, not a validated forecast of the response shape.
- **Not a medical device.** Research and portfolio use only.

**Development note.** AI coding tools assisted with scaffolding, refactoring and documentation. Research design, experiments, evaluation and final review are the author's own; generated output was reviewed and adapted before merging.
