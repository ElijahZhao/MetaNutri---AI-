"""Streamlit demo — postprandial glucose-response (PPGR) prediction.

Research demo for the MetaNutri project's research module. Trained on CGMacros
(45 subjects / 1,557 meals) with leave-one-subject-out cross-validation.
Not a clinical tool.
"""

from __future__ import annotations

import os

import numpy as np
import pandas as pd
import streamlit as st

from inference import (
    FEATURE_LABELS,
    MEAL_FIELDS,
    PPGRModel,
    TARGET_LABELS,
)

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "assets")
EXTERNAL_CSV = os.path.join(ASSETS, "external_results.csv")
EXTERNAL_FIG = os.path.join(ASSETS, "fig5_external_validation.png")

st.set_page_config(page_title="PPGR Predictor — CGMacros demo", page_icon="🩸", layout="wide")

# Rows shown in the external-validation panel: (display label, cohort, model).
EXTERNAL_ROWS = [
    ("CGMacros (LOPO, internal)", "CGMacros (LOPO, internal)", "xgboost"),
    ("BIG IDEAs (LOPO, internal)", "BIG IDEAs (LOPO, internal)", "xgboost"),
    ("BIG IDEAs (external, XGBoost)", "BIG IDEAs (external transfer)", "xgboost"),
    ("BIG IDEAs (external, carb-only Ridge)", "BIG IDEAs (external transfer)", "carb-only linear"),
]

MEAL_LABELS = {
    "carbs_g": "Carbohydrates (g)",
    "protein_g": "Protein (g)",
    "fat_g": "Fat (g)",
    "fiber_g": "Fiber (g)",
    "baseline_glucose": "Meal-time glucose (mg/dL)",
}
SUBJECT_LABELS = {
    "age": "Age (years)",
    "bmi": "BMI (kg/m²)",
    "a1c": "HbA1c (%)",
    "fasting_bg": "Fasting glucose (mg/dL)",
    "insulin": "Fasting insulin (µIU/mL)",
    "tg": "Triglycerides (mg/dL)",
    "cholesterol": "Total cholesterol (mg/dL)",
    "hdl": "HDL (mg/dL)",
    "non_hdl": "Non-HDL (mg/dL)",
    "ldl": "LDL (mg/dL)",
    "vldl": "VLDL (mg/dL)",
    "cho_hdl_ratio": "Cholesterol / HDL ratio",
}


@st.cache_resource
def load_model() -> PPGRModel:
    return PPGRModel()


@st.cache_data
def load_external() -> pd.DataFrame:
    return pd.read_csv(EXTERNAL_CSV)


def _external_table(df: pd.DataFrame) -> pd.DataFrame:
    """Held-out Pearson r by protocol × target, on the five shared features."""
    core = df[df["feature_set"] == "core (5 features)"]
    data: dict[str, dict[str, float]] = {}
    for label, cohort, model in EXTERNAL_ROWS:
        sub = core[(core["cohort"] == cohort) & (core["model"] == model)]
        row: dict[str, float] = {}
        for target in ("auc", "iauc", "peak_rise"):
            vals = sub.loc[sub["target"] == target, "pearson_r"]
            row[TARGET_LABELS[target].split(" (")[0]] = (
                float(vals.iloc[0]) if len(vals) else float("nan")
            )
        data[label] = row
    return pd.DataFrame.from_dict(data, orient="index")


def render_external() -> None:
    """Read-only summary of the cross-cohort (BIG IDEAs) validation."""
    if not os.path.exists(EXTERNAL_CSV):
        st.info("External-validation results are not bundled with this build.")
        return

    st.markdown(
        "The CGMacros model above was **frozen** — no retraining — and applied to "
        "**BIG IDEAs**, an independent cohort (16 subjects, 656 meals, a different "
        "CGM device and free-living food logs). Only the five features shared by "
        "both datasets are used (carbohydrate, protein, baseline glucose, sex, HbA1c)."
    )
    st.dataframe(
        _external_table(load_external()).style.format("{:.2f}", na_rep="—"),
        width="stretch",
    )
    st.caption("Pearson r between observed and predicted values. Higher is better.")
    if os.path.exists(EXTERNAL_FIG):
        st.image(
            EXTERNAL_FIG,
            caption="Figure 5 — external validation (technical report §4.4).",
        )
    st.markdown(
        "Read it honestly: **AUC still transfers** (r ≈ 0.57), but **iAUC and peak "
        "rise drop** to r ≈ 0.22, and a carbohydrate-only Ridge regression transfers "
        "*better* on those two targets (r ≈ 0.36). The BIG IDEAs internal LOPO row "
        "(0.46) shows the drop is a shift between cohorts, not noise in the external "
        "data — exactly the kind of result only an external test can expose."
    )


def _number_input(name: str, label: str, bounds: dict, medians: dict, step: float) -> float:
    lo, hi = bounds.get(name, [0.0, 100.0])
    lo = float(np.floor(lo))
    hi = float(np.ceil(hi))
    if hi <= lo:
        hi = lo + 1.0
    default = float(np.clip(medians.get(name, lo), lo, hi))
    return st.number_input(label, min_value=lo, max_value=hi, value=default, step=step)


def main() -> None:
    model = load_model()
    meta = model.meta
    lopo = meta["lopo_metrics"]
    bounds = meta["ui"]["bounds"]
    medians = meta["medians"]

    st.title("Postprandial glucose-response prediction")
    st.caption(
        "Research demo · CGMacros cohort "
        f"({meta['n_subjects']} subjects, {meta['n_meals']} meals) · "
        "leave-one-subject-out validation"
    )

    st.warning(
        "**Not a medical device.** This is a research/portfolio demo on a small "
        "cohort. Predictions are population-level estimates, not personal "
        "medical advice, and the reconstructed curve is illustrative only — the "
        "models predict the three scalar metrics, not a glucose trace."
    )

    with st.expander("How reliable is it? (held-out-subject performance)", expanded=False):
        c1, c2, c3 = st.columns(3)
        for col, target in zip((c1, c2, c3), ("auc", "iauc", "peak_rise")):
            m = lopo[target]
            col.metric(
                TARGET_LABELS[target].split(" (")[0],
                f"r = {m['pearson_r']:.2f}",
                help=f"Pearson r on {m['n']} held-out meals (R² = {m['r2']:.2f}).",
            )
        st.markdown(
            "Every number comes from **leave-one-subject-out** cross-validation: "
            "the model is always tested on a person it has never seen. AUC is "
            "predicted much better than iAUC, because AUC is dominated by the "
            "person's overall glucose level, while iAUC isolates the meal-driven "
            "excursion."
        )

    with st.expander("Does it generalise to another cohort? (external validation)", expanded=False):
        render_external()

    with st.form("inputs"):
        st.subheader("Meal")
        meal_cols = st.columns(5)
        meal = {}
        for col, name in zip(meal_cols, MEAL_FIELDS):
            with col:
                meal[name] = _number_input(name, MEAL_LABELS[name], bounds, medians, 1.0)

        st.subheader("Subject")
        subject = {}
        s1, s2, s3 = st.columns(3)
        with s1:
            subject["age"] = _number_input("age", SUBJECT_LABELS["age"], bounds, medians, 1.0)
            sex = st.selectbox("Sex", ["Female", "Male"])
            subject["gender"] = -1.0 if sex == "Female" else 1.0
            subject["bmi"] = _number_input("bmi", SUBJECT_LABELS["bmi"], bounds, medians, 0.1)
            subject["a1c"] = _number_input("a1c", SUBJECT_LABELS["a1c"], bounds, medians, 0.1)
        with s2:
            subject["fasting_bg"] = _number_input(
                "fasting_bg", SUBJECT_LABELS["fasting_bg"], bounds, medians, 1.0
            )
            subject["insulin"] = _number_input(
                "insulin", SUBJECT_LABELS["insulin"], bounds, medians, 0.1
            )
            subject["tg"] = _number_input("tg", SUBJECT_LABELS["tg"], bounds, medians, 1.0)
            subject["cholesterol"] = _number_input(
                "cholesterol", SUBJECT_LABELS["cholesterol"], bounds, medians, 1.0
            )
        with s3:
            subject["hdl"] = _number_input("hdl", SUBJECT_LABELS["hdl"], bounds, medians, 1.0)
            subject["non_hdl"] = _number_input(
                "non_hdl", SUBJECT_LABELS["non_hdl"], bounds, medians, 1.0
            )
            subject["ldl"] = _number_input("ldl", SUBJECT_LABELS["ldl"], bounds, medians, 1.0)
            subject["vldl"] = _number_input("vldl", SUBJECT_LABELS["vldl"], bounds, medians, 0.1)
        subject["cho_hdl_ratio"] = _number_input(
            "cho_hdl_ratio", SUBJECT_LABELS["cho_hdl_ratio"], bounds, medians, 0.1
        )

        submitted = st.form_submit_button("Predict", type="primary")

    if not submitted:
        st.info("Adjust the inputs and press **Predict**.")
        return

    values = PPGRModel.build_inputs(meal, subject)
    preds = model.predict(values)

    st.divider()
    st.subheader("Prediction")
    c1, c2, c3 = st.columns(3)
    for col, target in zip((c1, c2, c3), ("auc", "iauc", "peak_rise")):
        col.metric(
            TARGET_LABELS[target].split(" (")[0],
            f"{preds[target]:,.0f}",
            help=f"Held-out-subject Pearson r = {lopo[target]['pearson_r']:.2f}.",
        )
    st.caption(f"HOMA-IR (derived) = {values['homa_ir']:.2f}")

    t, glucose, tp_eff = model.curve(
        baseline=float(meal["baseline_glucose"]),
        peak_rise=preds["peak_rise"],
        iauc=preds["iauc"],
    )
    frame = pd.DataFrame(
        {
            "Predicted glucose (mg/dL)": glucose,
            "Meal-time baseline": np.full_like(glucose, float(meal["baseline_glucose"])),
        },
        index=t.astype(int),
    )
    frame.index.name = "minutes after meal"
    st.subheader("Illustrative 2-hour response")
    st.line_chart(frame, color=["#d62728", "#9aa0a6"])
    st.caption(
        "**Illustrative reconstruction, not a model output.** The models predict "
        "the three scalars above; this curve is a population-average gamma shape "
        f"scaled to the predicted peak rise and iAUC (implied peak ≈ {tp_eff:.0f} min). "
        "Use it to read the magnitude and shape, not as a forecast."
    )

    st.subheader("Why this prediction? (TreeSHAP)")
    target = st.radio(
        "Explanation for",
        options=list(TARGET_LABELS),
        format_func=lambda t: TARGET_LABELS[t].split(" (")[0],
        horizontal=True,
    )
    contribs = model.explain(values, target)
    top = contribs[:12]
    shap_frame = pd.DataFrame(
        {"contribution": [v for _, v in top]},
        index=[n for n, _ in top],
    )
    st.bar_chart(shap_frame, horizontal=True, color="#2c6fbb")
    st.caption(
        "Exact TreeSHAP values in the target's units. Positive contributions push "
        "the prediction up; negative push it down. Ranked by absolute magnitude."
    )

    st.divider()
    st.caption(
        "Data: CGMacros (PhysioNet, DOI 10.13026/3z8q-x658), CC BY-NC-SA 4.0. "
        "Model: XGBoost (`max_depth=1`, `n_estimators=80`, `learning_rate=0.2`). "
        "Code and technical report: MetaNutri `research/` module."
    )


if __name__ == "__main__":
    main()
