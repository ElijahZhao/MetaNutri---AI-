#!/usr/bin/env python3
"""External validation: CGMacros-trained model applied to the BIG IDEAs cohort.

Design
------
The CGMacros model is trained on **all** CGMacros meals and then frozen and
applied to BIG IDEAs meals it has never seen. This is a genuine cross-cohort
transfer test: different study, different participants, different CGM device
(Libre Pro vs Dexcom G6) and a free-living (self-reported) food log rather than
annotated meals.

Two feature sets are reported, because BIG IDEAs does not record the CGMacros
blood panel:

- ``core`` (5 features) — carbohydrate, protein, meal-time baseline glucose,
  sex and HbA1c. Complete for all 16 BIG IDEAs subjects, so no imputation.
- ``macro`` (7 features) — the above plus fat and fibre. Available for 13 of 16
  subjects (001/002 log fat and fibre sparsely; 003's food log has no fat
  column), so those subjects are dropped rather than imputed.

For reference we also report the same feature set under CGMacros LOPO, i.e. the
model's *internal* score, so the reader can see how much is lost across cohorts.

Output: experiments/external_results.csv
"""

from __future__ import annotations

import os
import warnings

import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler

from evaluate import SEED, _metrics, lopo_predict, xgb_model

HERE = os.path.dirname(os.path.abspath(__file__))
CG = os.path.abspath(os.path.join(HERE, "..", "data", "processed", "meals.csv"))
BI = os.path.abspath(os.path.join(HERE, "..", "data", "processed", "bigideas_meals.csv"))
OUT = os.path.abspath(os.path.join(HERE, "..", "experiments", "external_results.csv"))

TARGETS = ["iauc", "auc", "peak_rise"]
CORE = ["carbs_g", "protein_g", "baseline_glucose", "gender", "a1c"]
MACRO = CORE + ["fat_g", "fiber_g"]


def transfer(train: pd.DataFrame, test: pd.DataFrame, features: list[str],
             target: str) -> tuple[pd.DataFrame, np.ndarray]:
    """Fit on CGMacros (with its own scaler), predict frozen on BIG IDEAs."""
    tr = train.dropna(subset=features + [target])
    te = test.dropna(subset=features).copy()
    scaler = StandardScaler().fit(tr[features])
    x_train = scaler.transform(tr[features])
    y_train = tr[target].to_numpy()
    x_test = scaler.transform(te[features])
    model = xgb.XGBRegressor(
        max_depth=1, n_estimators=80, learning_rate=0.2, reg_alpha=1.0,
        reg_lambda=0.0, random_state=SEED, n_jobs=4,
    ).fit(x_train, y_train)
    return te, model.predict(x_test)


def main() -> None:
    warnings.filterwarnings("ignore", message="An input array is constant")
    cg = pd.read_csv(CG, low_memory=False)
    bi = pd.read_csv(BI, low_memory=False)
    rows = []

    for label, features in [("core (5 features)", CORE), ("macro (7 features)", MACRO)]:
        # Internal references: same features, LOPO inside each cohort. The
        # BIG IDEAs LOPO row separates *domain shift* (models trained on one
        # cohort, applied to the other) from the cohort's own noise ceiling.
        for cohort, frame in [("CGMacros (LOPO, internal)", cg),
                              ("BIG IDEAs (LOPO, internal)", bi)]:
            for target in TARGETS:
                preds = lopo_predict(frame, features, target, xgb_model())
                internal = _metrics(frame[target].to_numpy(), preds).as_dict(
                    "xgboost", target)
                internal["cohort"] = cohort
                internal["feature_set"] = label
                rows.append(internal)

        # External transfer to BIG IDEAs, plus the baseline trio.
        for target in TARGETS:
            tr = cg.dropna(subset=features + [target])
            te, pred = transfer(cg, bi, features, target)
            y = te[target].to_numpy()

            for name, p in [
                ("xgboost", pred),
                ("mean", np.full(len(te), float(tr[target].mean()))),
                ("carb-only linear", Ridge(alpha=1.0, random_state=SEED)
                    .fit(tr[["carbs_g"]], tr[target]).predict(te[["carbs_g"]])),
            ]:
                row = _metrics(y, np.asarray(p, dtype=float)).as_dict(name, target)
                row["cohort"] = "BIG IDEAs (external transfer)"
                row["feature_set"] = label
                rows.append(row)

    out = pd.DataFrame(rows)[
        ["cohort", "feature_set", "target", "model", "n",
         "pearson_r", "spearman_r", "r2", "rmse", "mae"]
    ]
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    out.to_csv(OUT, index=False)

    for (cohort, fs), block in out.groupby(["cohort", "feature_set"], sort=False):
        print(f"\n=== {cohort} | {fs} ===")
        print(block.drop(columns=["cohort", "feature_set"]).to_string(index=False))

    print("\n--- headline: XGBoost Pearson r ---")
    piv = (out[out["model"] == "xgboost"]
           .pivot_table(index=["feature_set", "target"], columns="cohort",
                        values="pearson_r"))
    print(piv.to_string())
    print(f"\nSaved: {OUT}")


if __name__ == "__main__":
    main()
