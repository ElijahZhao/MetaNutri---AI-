"""Leave-one-subject-out (LOPO) evaluation and baselines.

Rationale (see docs/ROADMAP.md §3.3): meals from the **same subject** must never
be split across train and test, otherwise performance is severely overestimated
(random splits have been reported to roughly halve the error vs. subject-wise
splits). Every model here is therefore evaluated with LOPO cross-validation:
train on all meals of 44 subjects, predict the held-out subject, repeat.

Preprocessing (standardisation) is fit on the training fold only.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Sequence

import numpy as np
import pandas as pd
from scipy import stats
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler

# Feature columns expected in the meal-level table (see build_dataset.py).
FEATURE_COLUMNS = [
    "carbs_g",
    "protein_g",
    "fat_g",
    "fiber_g",
    "baseline_glucose",
    "age",
    "gender",
    "bmi",
    "a1c",
    "homa_ir",
    "insulin",
    "tg",
    "cholesterol",
    "hdl",
    "non_hdl",
    "ldl",
    "vldl",
    "cho_hdl_ratio",
    "fasting_bg",
]

SEED = 42


@dataclass
class Metrics:
    n: int
    pearson_r: float
    pearson_p: float
    spearman_r: float
    r2: float
    rmse: float
    mae: float

    def as_dict(self, name: str, target: str) -> dict:
        return {
            "model": name,
            "target": target,
            "n": self.n,
            "pearson_r": round(self.pearson_r, 4),
            "p_value": float(f"{self.pearson_p:.3g}"),
            "spearman_r": round(self.spearman_r, 4),
            "r2": round(self.r2, 4),
            "rmse": round(self.rmse, 3),
            "mae": round(self.mae, 3),
        }


def _metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Metrics:
    mask = np.isfinite(y_true) & np.isfinite(y_pred)
    yt, yp = y_true[mask], y_pred[mask]
    r, p = stats.pearsonr(yt, yp)
    rho = stats.spearmanr(yt, yp).statistic
    resid = yt - yp
    ss_res = float(np.sum(resid**2))
    ss_tot = float(np.sum((yt - yt.mean()) ** 2))
    return Metrics(
        n=int(yt.size),
        pearson_r=float(r),
        pearson_p=float(p),
        spearman_r=float(rho),
        r2=1.0 - ss_res / ss_tot if ss_tot > 0 else float("nan"),
        rmse=float(np.sqrt(np.mean(resid**2))),
        mae=float(np.mean(np.abs(resid))),
    )


def lopo_predict(
    df: pd.DataFrame,
    features: Sequence[str],
    target: str,
    fit_predict: Callable[[np.ndarray, np.ndarray, np.ndarray], np.ndarray],
    subject_col: str = "sub",
) -> np.ndarray:
    """Return out-of-fold predictions with one subject held out at a time.

    ``fit_predict(X_train, y_train, X_test)`` must return predictions for
    ``X_test``. Standardisation is handled here (fit on train only) unless the
    caller's ``fit_predict`` does its own preprocessing.
    """
    preds = np.full(len(df), np.nan)
    cols = list(features)
    for sub in df[subject_col].unique():
        test_mask = (df[subject_col] == sub).to_numpy()
        train_mask = ~test_mask

        # Impute with the training-fold median (fit on train only) so that a
        # handful of missing blood-panel values never leak across the split.
        train_frame = df.loc[train_mask, cols]
        medians = train_frame.median(numeric_only=True)
        x_train_raw = train_frame.fillna(medians).to_numpy(dtype=float)
        x_test_raw = df.loc[test_mask, cols].fillna(medians).to_numpy(dtype=float)

        scaler = StandardScaler().fit(x_train_raw)
        x_train = scaler.transform(x_train_raw)
        x_test = scaler.transform(x_test_raw)
        y_train = df.loc[train_mask, target].to_numpy()

        preds[test_mask] = fit_predict(x_train, y_train, x_test)
    return preds


# --- model factories ---------------------------------------------------------

def mean_model() -> Callable[[np.ndarray, np.ndarray, np.ndarray], np.ndarray]:
    def _fit_predict(_x_train, y_train, x_test):
        return np.full(x_test.shape[0], float(np.mean(y_train)))

    return _fit_predict


def linear_model(alpha: float = 1.0) -> Callable[[np.ndarray, np.ndarray, np.ndarray], np.ndarray]:
    """Ridge regression.

    Ridge rather than OLS: the 19 blood/macro features are strongly collinear
    and subjects carry extreme values, so unregularised OLS extrapolates
    catastrophically on held-out subjects (observed R² < -1000).
    """

    def _fit_predict(x_train, y_train, x_test):
        model = Ridge(alpha=alpha, random_state=SEED).fit(x_train, y_train)
        return model.predict(x_test)

    return _fit_predict


def xgb_model(
    max_depth: int = 1,
    n_estimators: int = 80,
    learning_rate: float = 0.2,
    reg_alpha: float = 1.0,
    reg_lambda: float = 0.0,
) -> Callable[[np.ndarray, np.ndarray, np.ndarray], np.ndarray]:
    """Official CGMacros baseline hyper-parameters (XGBRegressor)."""
    import xgboost as xgb

    def _fit_predict(x_train, y_train, x_test):
        model = xgb.XGBRegressor(
            max_depth=max_depth,
            n_estimators=n_estimators,
            learning_rate=learning_rate,
            reg_alpha=reg_alpha,
            reg_lambda=reg_lambda,
            random_state=SEED,
            n_jobs=4,
        )
        model.fit(x_train, y_train)
        return model.predict(x_test)

    return _fit_predict


def run_suite(df: pd.DataFrame, target: str) -> pd.DataFrame:
    """Evaluate the baseline trio plus XGBoost on one target."""
    carb_only = ["carbs_g"]
    energy_only = ["carbs_g", "protein_g", "fat_g"]
    rows = []

    # The baseline trio required by the plan (docs/ROADMAP.md §3.3):
    # a mean predictor and two "hand-crafted heuristic" operationalisations,
    # plus the official-style XGBoost model.
    specs = [
        ("mean", FEATURE_COLUMNS, mean_model()),
        ("carb-only linear", carb_only, linear_model()),
        ("energy-only linear", energy_only, linear_model()),
        ("xgboost (official baseline)", FEATURE_COLUMNS, xgb_model()),
    ]
    for name, feats, fp in specs:
        preds = lopo_predict(df, feats, target, fp)
        rows.append(_metrics(df[target].to_numpy(), preds).as_dict(name, target))

    return pd.DataFrame(rows)
