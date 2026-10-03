"""Inference for the PPGR demo.

Self-contained: this file and ``model/`` are everything the Space needs. It loads
the three trained XGBoost boosters plus the preprocessing metadata produced by
``research/src/train_final.py``, and exposes three things:

- ``predict``  — the three scalar targets (2-h iAUC, 2-h AUC, peak glucose rise)
- ``explain``  — exact TreeSHAP contributions via XGBoost's ``pred_contribs``
- ``curve``    — an *illustrative* 2-hour glucose trace reconstructed from the
  predicted scalars (see the caveat below)

Caveat on the curve: the models predict aggregate scalars, **not** a full time
series. The curve is a gamma-shaped template whose amplitude is the predicted
peak rise and whose peak time is chosen so that its incremental area matches the
predicted iAUC. It is a visual aid, not a model output, and the UI says so.
"""

from __future__ import annotations

import json
import os

import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model")
TARGETS = ["iauc", "auc", "peak_rise"]

# Inputs the UI collects, in the order the user sees them.
MEAL_FIELDS = ["carbs_g", "protein_g", "fat_g", "fiber_g", "baseline_glucose"]
SUBJECT_FIELDS = [
    "age", "gender", "bmi", "a1c", "fasting_bg", "insulin",
    "tg", "cholesterol", "hdl", "non_hdl", "ldl", "vldl", "cho_hdl_ratio",
]
# Derived, never typed by the user.
DERIVED_FIELDS = ["homa_ir"]

TARGET_LABELS = {
    "iauc": "2-h iAUC (mg/dL·min)",
    "auc": "2-h AUC (mg/dL·min)",
    "peak_rise": "Peak glucose rise (mg/dL)",
}
FEATURE_LABELS = {
    "carbs_g": "Carbohydrates (g)",
    "protein_g": "Protein (g)",
    "fat_g": "Fat (g)",
    "fiber_g": "Fiber (g)",
    "baseline_glucose": "Meal-time glucose (mg/dL)",
    "age": "Age",
    "gender": "Sex (M=1/F=−1)",
    "bmi": "BMI",
    "a1c": "HbA1c (%)",
    "homa_ir": "HOMA-IR",
    "insulin": "Fasting insulin (µIU/mL)",
    "tg": "Triglycerides",
    "cholesterol": "Total cholesterol",
    "hdl": "HDL",
    "non_hdl": "Non-HDL",
    "ldl": "LDL",
    "vldl": "VLDL",
    "cho_hdl_ratio": "Chol/HDL ratio",
    "fasting_bg": "Fasting glucose",
}


def _incremental_auc(values: np.ndarray, dt: float) -> float:
    """Positive incremental area above ``values[0]`` (matches research/src/iauc.py)."""
    v = np.asarray(values, dtype=float)
    if v.size < 2:
        return float("nan")
    d = v - v[0]
    area = 0.0
    for i in range(d.size - 1):
        y0, y1 = d[i], d[i + 1]
        if y0 >= 0.0 and y1 >= 0.0:
            area += 0.5 * (y0 + y1) * dt
        elif y0 >= 0.0 > y1:
            area += 0.5 * y0 * (y0 / (y0 - y1)) * dt
        elif y0 < 0.0 <= y1:
            area += 0.5 * y1 * (y1 / (y1 - y0)) * dt
    return float(area)


def _gamma_shape(t: np.ndarray, tp: float, k: float) -> np.ndarray:
    tt = np.asarray(t, dtype=float)
    out = np.zeros_like(tt)
    mask = tt > 0
    out[mask] = (tt[mask] / tp) ** k * np.exp(k * (1 - tt[mask] / tp))
    return out


class PPGRModel:
    def __init__(self, model_dir: str = MODEL_DIR):
        import xgboost as xgb

        self._xgb = xgb
        with open(os.path.join(model_dir, "preprocess.json")) as fh:
            self.meta = json.load(fh)
        self.features = list(self.meta["features"])
        self.medians = self.meta["medians"]
        self.mean = np.asarray(self.meta["scaler_mean"], dtype=float)
        self.scale = np.asarray(self.meta["scaler_scale"], dtype=float)
        self.shape = self.meta["response_shape"]
        self.lopo = self.meta["lopo_metrics"]
        self.boosters = {
            t: xgb.Booster(model_file=os.path.join(model_dir, f"xgb_{t}.json"))
            for t in TARGETS
        }

    # -- feature assembly ---------------------------------------------------
    def _vector(self, values: dict) -> np.ndarray:
        """Impute → order → standardise, mirroring the training pipeline."""
        row = []
        for name in self.features:
            v = values.get(name, np.nan)
            if v is None or (isinstance(v, float) and np.isnan(v)):
                v = self.medians[name]
            row.append(float(v))
        raw = np.asarray(row, dtype=float)
        return (raw - self.mean) / self.scale

    @staticmethod
    def build_inputs(meal: dict, subject: dict) -> dict:
        """Combine meal + subject inputs and derive HOMA-IR."""
        values = dict(meal)
        values.update(subject)
        insulin = float(values.get("insulin", np.nan) or np.nan)
        fasting_bg = float(values.get("fasting_bg", np.nan) or np.nan)
        values["homa_ir"] = (
            insulin * fasting_bg / 405.0
            if np.isfinite(insulin) and np.isfinite(fasting_bg)
            else np.nan
        )
        return values

    # -- prediction ---------------------------------------------------------
    def predict(self, values: dict) -> dict:
        x = self._vector(values).reshape(1, -1)
        dm = self._xgb.DMatrix(x, feature_names=self.features)
        return {t: float(self.boosters[t].predict(dm)[0]) for t in TARGETS}

    def explain(self, values: dict, target: str) -> list[tuple[str, float]]:
        """Exact TreeSHAP contributions, sorted by descending |contribution|."""
        x = self._vector(values).reshape(1, -1)
        dm = self._xgb.DMatrix(x, feature_names=self.features)
        contribs = self.boosters[target].predict(dm, pred_contribs=True)[0]
        pairs = list(zip(self.features, contribs[:-1]))  # last entry is the bias
        pairs.sort(key=lambda kv: abs(kv[1]), reverse=True)
        return [(FEATURE_LABELS.get(name, name), float(val)) for name, val in pairs]

    # -- illustrative curve -------------------------------------------------
    def curve(self, baseline: float, peak_rise: float, iauc: float, step: int = 1):
        """Reconstruct a 2-hour trace consistent with the three predicted scalars.

        Amplitude = ``peak_rise``; peak time is solved so the incremental area
        matches ``iauc`` within the horizon.
        """
        horizon = int(self.meta["shape_horizon_min"])
        k = float(self.shape["shape_k"])
        tp0 = float(self.shape["peak_time_min"])
        t = np.arange(0, horizon + 1, step, dtype=float)

        amplitude = max(float(peak_rise), 0.0)
        target_area = max(float(iauc), 0.0)

        def area_for(tp: float) -> float:
            return _incremental_auc(baseline + amplitude * _gamma_shape(t, tp, k), float(step))

        lo, hi = 10.0, float(horizon - 5)
        # Widen the search if the target area lies outside the default range.
        if target_area <= area_for(lo):
            tp_eff = lo
        elif target_area >= area_for(hi):
            tp_eff = hi
        else:
            for _ in range(40):
                mid = 0.5 * (lo + hi)
                if area_for(mid) < target_area:
                    lo = mid
                else:
                    hi = mid
            tp_eff = 0.5 * (lo + hi)

        glucose = baseline + amplitude * _gamma_shape(t, tp_eff, k)
        return t, glucose, tp_eff
