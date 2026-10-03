#!/usr/bin/env python3
"""Train the final (deployable) models and export inference artifacts.

Unlike ``experiment.py`` — which only produces out-of-fold numbers — this script
fits one XGBoost per target on **all** meals and persists everything the demo
needs to make a prediction:

- ``model/xgb_<target>.json``  trained boosters (three targets)
- ``model/preprocess.json``    feature order, medians (imputation), scaler
                               params, UI defaults, the population-average
                               response shape, and the LOPO metrics shown in
                               the app for honesty.

The canonical response shape is the mean normalised 2-hour glucose rise across
all meals (5-minute grid, peak = 1). The demo scales it in amplitude to the
predicted peak rise and in time so its iAUC matches the predicted iAUC. The
reconstructed curve is **illustrative** and is labelled as such in the UI.

Artifacts are written to ``research/app/model/`` so that ``research/app/`` can be
deployed verbatim (Streamlit Community Cloud, via the ``ppgr-predictor`` repo).
"""

from __future__ import annotations

import glob
import json
import os

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

from evaluate import FEATURE_COLUMNS, SEED

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.abspath(os.path.join(HERE, "..", "data", "raw", "extracted", "CGMacros"))
MEALS_CSV = os.path.abspath(os.path.join(HERE, "..", "data", "processed", "meals.csv"))
RESULTS_CSV = os.path.abspath(os.path.join(HERE, "..", "experiments", "results.csv"))
APP_MODEL_DIR = os.path.abspath(os.path.join(HERE, "..", "app", "model"))

TARGETS = ["iauc", "auc", "peak_rise"]
SHAPE_STEP_MIN = 5
SHAPE_HORIZON_MIN = 120
GLUCOSE_COL = "Libre GL"


def _meal_rise_curves() -> np.ndarray:
    """2-hour glucose-rise curves on the 5-minute grid, one row per meal."""
    step = SHAPE_STEP_MIN
    window = SHAPE_HORIZON_MIN // step  # 24 steps -> 25 samples
    curves: list[np.ndarray] = []
    for sub_dir in sorted(glob.glob(os.path.join(RAW, "CGMacros-*"))):
        name = os.path.basename(sub_dir)
        csv_path = os.path.join(sub_dir, f"{name}.csv")
        if not os.path.exists(csv_path):
            continue
        df = pd.read_csv(csv_path, low_memory=False)
        df.columns = [str(c).strip() for c in df.columns]
        if GLUCOSE_COL not in df.columns or "Meal Type" not in df.columns:
            continue
        glucose = pd.to_numeric(df[GLUCOSE_COL], errors="coerce")
        for idx in df.index[df["Meal Type"].notna()]:
            values = glucose.iloc[idx : idx + window * step + step : step].to_numpy(dtype=float)
            if values.size != window + 1 or np.isnan(values).any():
                continue
            rise = values - values[0]
            if float(np.max(rise)) <= 0:
                continue
            curves.append(rise)
    if not curves:
        raise RuntimeError("no usable CGM windows found for shape estimation")
    return np.vstack(curves)


def population_shape() -> dict[str, float]:
    """Fit a gamma response shape to the population-average 2-hour curve.

    The postprandial response is modelled as
    ``rise(t) = A * (t/tp)**k * exp(k * (1 - t/tp))`` — it rises from 0, peaks
    at ``tp`` with amplitude ``A``, then decays. We fit ``(tp, k)`` by least
    squares to the **ensemble mean** glucose-rise curve, with ``A`` solved in
    closed form for each candidate.

    The ensemble mean is used rather than per-curve max-normalised curves
    because many traces carry late secondary bumps; normalising by the global
    2-hour max would let a single late bump dominate, whereas averaging across
    meals cancels that noise. The resulting shape is smooth, peaks inside the
    window, and correlates > 0.9 with the observed mean response.
    """
    curves = _meal_rise_curves()
    mean_rise = curves.mean(axis=0)
    n = mean_rise.size
    t = np.arange(n) * SHAPE_STEP_MIN
    tps = np.arange(15.0, 95.0 + 1e-9, 2.5)
    ks = np.arange(0.8, 4.0 + 1e-9, 0.1)

    best_tp, best_k, best_resid = None, None, np.inf
    for tp in tps:
        for k in ks:
            shape = np.where(t > 0, (t / tp) ** k * np.exp(k * (1 - t / tp)), 0.0)
            denom = float(shape @ shape)
            if denom <= 0:
                continue
            amp = float(shape @ mean_rise) / denom
            resid = float(np.sum((mean_rise - amp * shape) ** 2))
            if resid < best_resid:
                best_tp, best_k, best_resid = float(tp), float(k), resid
    return {"peak_time_min": best_tp, "shape_k": best_k}




def lopo_metrics() -> dict[str, dict[str, float]]:
    """Headline LOPO metrics for the all-meals model, shown in the app."""
    res = pd.read_csv(RESULTS_CSV)
    sub = res[(res["subset"] == "all meals (extension)")
              & (res["model"] == "xgboost (official baseline)")]
    return {
        row["target"]: {
            "pearson_r": float(row["pearson_r"]),
            "r2": float(row["r2"]),
            "n": int(row["n"]),
        }
        for _, row in sub.iterrows()
    }


def main() -> None:
    import xgboost as xgb

    df = pd.read_csv(MEALS_CSV)
    df = df[df["iauc"] > 0].copy()

    x_raw = df[FEATURE_COLUMNS]
    medians = x_raw.median(numeric_only=True)
    x_imputed = x_raw.fillna(medians)
    scaler = StandardScaler().fit(x_imputed)

    os.makedirs(APP_MODEL_DIR, exist_ok=True)

    for target in TARGETS:
        model = xgb.XGBRegressor(
            max_depth=1,
            n_estimators=80,
            learning_rate=0.2,
            reg_alpha=1.0,
            reg_lambda=0.0,
            random_state=SEED,
            n_jobs=4,
        )
        model.fit(scaler.transform(x_imputed), df[target].to_numpy())
        model.save_model(os.path.join(APP_MODEL_DIR, f"xgb_{target}.json"))
        print(f"saved xgb_{target}.json")

    # UI defaults: median of each feature, plus a few sensible slider bounds.
    defaults = {
        "medians": {c: float(medians[c]) for c in FEATURE_COLUMNS},
        "bounds": {},
    }
    for c in ["carbs_g", "protein_g", "fat_g", "fiber_g", "baseline_glucose",
              "age", "bmi", "a1c", "fasting_bg", "insulin", "tg", "cholesterol",
              "hdl", "non_hdl", "ldl", "vldl", "cho_hdl_ratio"]:
        lo = float(np.floor(np.nanpercentile(df[c], 1)))
        hi = float(np.ceil(np.nanpercentile(df[c], 99)))
        defaults["bounds"][c] = [lo, hi]

    preprocess = {
        "features": FEATURE_COLUMNS,
        "medians": {c: float(medians[c]) for c in FEATURE_COLUMNS},
        "scaler_mean": [float(v) for v in scaler.mean_],
        "scaler_scale": [float(v) for v in scaler.scale_],
        "response_shape": population_shape(),
        "shape_step_min": SHAPE_STEP_MIN,
        "shape_horizon_min": SHAPE_HORIZON_MIN,
        "glucose_unit": "mg/dL",
        "n_meals": int(len(df)),
        "n_subjects": int(df["sub"].nunique()),
        "lopo_metrics": lopo_metrics(),
        "ui": defaults,
    }
    with open(os.path.join(APP_MODEL_DIR, "preprocess.json"), "w") as fh:
        json.dump(preprocess, fh, indent=2)
    print(f"saved preprocess.json -> {APP_MODEL_DIR}")
    print("LOPO metrics:", json.dumps(preprocess["lopo_metrics"], indent=2))


if __name__ == "__main__":
    main()
