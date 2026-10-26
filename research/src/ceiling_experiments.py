#!/usr/bin/env python3
"""Measurement-ceiling experiments (companion to the transfer analysis).

Connects predictive performance to the *measurement reliability* of the
outcome, following Hengist et al. 2024 (Am J Clin Nutr 121(1):74-82), who
report single-meal duplicate-meal reliability of r = 0.46 (Abbott) / 0.45
(Dexcom) for iAUC. Six experiments:

- **E2** — duplicate-meal reliability *inside CGMacros*, by meal type: pairs of
  same-type meals with near-identical macros eaten by the same subject. Gives
  the cohort's own test-retest ceiling (sqrt(rho) bounds any model that only
  sees stable information).
- **E5** — LOPO with ``baseline_glucose`` removed. A model without same-day
  information is the one the ceiling bound applies to; comparing it against the
  full model separates *stable* from *same-day* signal.
- **P2** — ``baseline_glucose``-only baseline. Quantifies how much of the AUC
  signal is "who is this person today" rather than "what did they eat" (the
  structural loop behind AUC ≈ 120 · baseline + iAUC).
- **P3** — subject-level (person-mean) evaluation. Aggregating predictions and
  outcomes per subject before correlating removes within-person outcome noise;
  the leak-resistant headline view.
- **E4** — subject-aggregated external transfer (BIG IDEAs). Hengist's own
  recommendation ("aggregate repeated measurements") tested on our transfer
  predictions, with a subject-bootstrap CI.
- **E3** — reverse transfer (BIG IDEAs trained → CGMacros frozen), for
  direction symmetry of the cross-cohort claim.

Outputs: ``experiments/ceiling_results.csv`` plus a console report.
"""

from __future__ import annotations

import os
import warnings

import numpy as np
import pandas as pd
from scipy import stats

from evaluate import (
    FEATURE_COLUMNS,
    SEED,
    _metrics,
    lopo_predict,
    xgb_model,
)
from external_validate import CORE, transfer

HERE = os.path.dirname(os.path.abspath(__file__))
CG = os.path.abspath(os.path.join(HERE, "..", "data", "processed", "meals.csv"))
BI = os.path.abspath(os.path.join(HERE, "..", "data", "processed", "bigideas_meals.csv"))
OUT = os.path.abspath(os.path.join(HERE, "..", "experiments", "ceiling_results.csv"))

TARGETS = ["iauc", "auc", "peak_rise"]
MACROS = ["carbs_g", "protein_g", "fat_g", "fiber_g"]
FULL = list(FEATURE_COLUMNS)
NO_BG = [f for f in FULL if f != "baseline_glucose"]
BG_ONLY = ["baseline_glucose"]


def _row(experiment: str, subset: str, features: str, target: str,
         model: str, n: int, r: float, extra: dict | None = None) -> dict:
    row = {
        "experiment": experiment,
        "subset": subset,
        "feature_set": features,
        "target": target,
        "model": model,
        "n": n,
        "pearson_r": round(float(r), 4) if np.isfinite(r) else np.nan,
    }
    if extra:
        row.update(extra)
    return row


# --- E2: duplicate-meal reliability inside CGMacros --------------------------

def duplicate_pairs(df: pd.DataFrame, tol: tuple[float, float, float, float],
                    meal_type: str | None) -> pd.DataFrame:
    """Same-subject, same-type meal pairs whose macros match within ``tol``."""
    sub = df if meal_type is None else df[df["meal_type"] == meal_type]
    rows = []
    for _, g in sub.dropna(subset=["iauc"] + MACROS).groupby("sub"):
        arr = g[MACROS].to_numpy()
        iauc = g["iauc"].to_numpy()
        for i in range(len(g)):
            for j in range(i + 1, len(g)):
                d = np.abs(arr[i] - arr[j])
                if (d <= np.array(tol)).all():
                    rows.append({"iauc_1": iauc[i], "iauc_2": iauc[j]})
    return pd.DataFrame(rows)


def icc_one_way_one(pairs: pd.DataFrame) -> float:
    """ICC(1,1) — two measurements per subject, absolute agreement."""
    a = pairs["iauc_1"].to_numpy()
    b = pairs["iauc_2"].to_numpy()
    grand = np.concatenate([a, b])
    ms_between = len(a) * np.var(np.stack([a, b]).mean(axis=0), ddof=1)
    ms_within = (np.var(a, ddof=1) + np.var(b, ddof=1)) / 2
    denom = ms_between + ms_within
    return float((ms_between - ms_within) / denom) if denom > 0 else float("nan")


def run_e2(cg: pd.DataFrame) -> list[dict]:
    rows = []
    for tol, label in [((2, 2, 2, 1), "±2g macros"), ((5, 5, 5, 3), "±5g macros")]:
        scopes = {None: "all meals"} | {m: m for m in cg["meal_type"].dropna().unique()}
        for meal_type, name in scopes.items():
            pairs = duplicate_pairs(cg, tol, meal_type)
            if len(pairs) < 3:
                rows.append(_row("E2 duplicate-meal reliability", name, "—", "iauc",
                                 f"duplicate pairs ({label})", len(pairs), np.nan,
                                 {"spearman_r": np.nan, "icc": np.nan}))
                continue
            r = stats.pearsonr(pairs["iauc_1"], pairs["iauc_2"]).statistic
            rows.append(_row("E2 duplicate-meal reliability", name, "—", "iauc",
                             f"duplicate pairs ({label})", len(pairs), r,
                             {"spearman_r": round(float(
                                 stats.spearmanr(pairs["iauc_1"], pairs["iauc_2"])
                                 .statistic), 4),
                             "icc": round(icc_one_way_one(pairs), 4)}))
    return rows


# --- E5 / P2 / P3: feature ablation, baseline-only, subject-level ------------

def run_e5_p2_p3(cg: pd.DataFrame) -> list[dict]:
    rows = []
    subsets = {
        "all meals (unfiltered)": cg,
        "all meals (iauc>0)": cg[cg["iauc"] > 0],
        "breakfast (iauc>0)": cg[(cg["iauc"] > 0) & (cg["meal_type"] == "breakfast")],
    }
    feature_sets = {"full (19)": FULL, "no-baseline (18)": NO_BG,
                    "baseline-only (1)": BG_ONLY}

    for sub_label, frame in subsets.items():
        for target in TARGETS:
            for fs_label, feats in feature_sets.items():
                preds = lopo_predict(frame, feats, target, xgb_model())
                pooled = _metrics(frame[target].to_numpy(), preds)
                rows.append(_row("E5/P2 pooled LOPO (xgboost)", sub_label,
                                 fs_label, target, "xgboost", pooled.n,
                                 pooled.pearson_r,
                                 {"spearman_r": round(pooled.spearman_r, 4),
                                  "r2": round(pooled.r2, 4)}))

                # P3: aggregate per subject, then correlate the person means.
                view = pd.DataFrame({"sub": frame["sub"].to_numpy(),
                                     "y": frame[target].to_numpy(),
                                     "p": preds}).dropna()
                by_sub = view.groupby("sub")[["y", "p"]].mean()
                if len(by_sub) > 2 and by_sub["y"].std() > 0 and by_sub["p"].std() > 0:
                    r_sub = float(stats.pearsonr(by_sub["y"], by_sub["p"]).statistic)
                else:
                    r_sub = float("nan")
                rows.append(_row("P3 subject-mean LOPO (xgboost)", sub_label,
                                 fs_label, target, "xgboost person-means",
                                 len(by_sub), r_sub))
    return rows


# --- E3 / E4: transfer direction symmetry and subject aggregation ------------

def run_e3_e4(cg: pd.DataFrame, bi: pd.DataFrame) -> list[dict]:
    rows = []
    for target in TARGETS:
        # E3: reverse transfer — frozen on BIG IDEAs, applied to CGMacros.
        tr = bi.dropna(subset=CORE + [target])
        te, pred = transfer(bi, cg, CORE, target)
        y = te[target].to_numpy()
        m = _metrics(y, np.asarray(pred, dtype=float))
        rows.append(_row("E3 reverse transfer (BI->CG)", "CGMacros (external)",
                         "core (5 features)", target, "xgboost", m.n, m.pearson_r,
                         {"spearman_r": round(m.spearman_r, 4),
                          "r2": round(m.r2, 4)}))

        # E4: forward transfer predictions aggregated per BIG IDEAs subject.
        te_fwd, pred_fwd = transfer(cg, bi, CORE, target)
        view = pd.DataFrame({"sub": te_fwd["sub"].to_numpy(),
                             "y": te_fwd[target].to_numpy(),
                             "p": np.asarray(pred_fwd, dtype=float)})
        by_sub = view.groupby("sub")[["y", "p"]].mean()
        r = stats.pearsonr(by_sub["y"], by_sub["p"]).statistic
        rng = np.random.default_rng(SEED)
        subs = by_sub.index.to_numpy()
        boot = []
        for _ in range(2000):
            pick = rng.choice(subs, size=len(subs), replace=True)
            sample = by_sub.loc[pick]
            if sample["y"].std() > 0 and sample["p"].std() > 0:
                boot.append(stats.pearsonr(sample["y"], sample["p"]).statistic)
        lo, hi = np.percentile(boot, [2.5, 97.5]) if boot else (np.nan, np.nan)
        rows.append(_row("E4 subject-aggregated transfer", "BIG IDEAs (external)",
                         "core (5 features)", target, "xgboost person-means",
                         len(by_sub), r,
                         {"ci_low": round(float(lo), 4),
                          "ci_high": round(float(hi), 4)}))

        # Forward meal-level reference for an honest side-by-side with E4.
        m_fwd = _metrics(te_fwd[target].to_numpy(), np.asarray(pred_fwd, dtype=float))
        rows.append(_row("E4 meal-level reference", "BIG IDEAs (external)",
                         "core (5 features)", target, "xgboost", m_fwd.n,
                         m_fwd.pearson_r))
    return rows


def main() -> None:
    warnings.filterwarnings("ignore", message="An input array is constant")
    cg = pd.read_csv(CG, low_memory=False)
    bi_exists = os.path.exists(BI)
    bi = pd.read_csv(BI, low_memory=False) if bi_exists else None

    rows = run_e2(cg) + run_e5_p2_p3(cg)
    if bi is not None:
        rows += run_e3_e4(cg, bi)

    out = pd.DataFrame(rows)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    out.to_csv(OUT, index=False)

    for exp, block in out.groupby("experiment", sort=False):
        print(f"\n=== {exp} ===")
        cols = [c for c in block.columns if c != "experiment"]
        print(block[cols].to_string(index=False))

    print(f"\nSaved: {OUT}")


if __name__ == "__main__":
    main()
