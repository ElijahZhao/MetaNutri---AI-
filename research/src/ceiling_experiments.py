#!/usr/bin/env python3
"""Measurement-ceiling experiments (companion to the transfer analysis).

Connects predictive performance to the *measurement reliability* of the
outcome, following Hengist et al. 2024 (Am J Clin Nutr 121(1):74-82), who
report single-meal duplicate-meal reliability of r = 0.46 (Abbott) / 0.45
(Dexcom) for iAUC. Six experiments:

- **E2** — duplicate-meal reliability *inside CGMacros*, by meal type: pairs of
  same-type meals with near-identical macros eaten by the same subject. Gives
  the cohort's own test-retest ceiling (sqrt(rho) bounds any model that only
  sees stable information). The pooled "all meals" row also restricts each pair
  to a single meal type; a cross-type variant is retained explicitly for
  provenance, because an earlier version of this analysis pooled across types.
  Uncertainty is a subject-clustered bootstrap, since one subject can
  contribute many pairs. The main estimate uses all 1,699 meals, so it is not
  selected on the outcome; a "breakfast (both iauc>0)" scope matches the
  official prediction filter as a like-for-like check.
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
                    meal_type: str | None = None,
                    same_type: bool = True,
                    positive_only: bool = False) -> pd.DataFrame:
    """Same-subject meal pairs whose macros match within ``tol``.

    ``meal_type`` restricts to one meal type. When it is ``None`` and
    ``same_type`` is True (the default), pairs are pooled across meal types but
    both meals of a pair must still be the *same* type. ``same_type=False``
    reproduces the earlier cross-type behaviour and is kept only so the
    superseded number stays reproducible. ``positive_only`` keeps pairs in which
    both meals have iAUC > 0, matching the official prediction filter.
    """
    if meal_type is not None:
        grouped = df[df["meal_type"] == meal_type].groupby("sub")
    elif same_type:
        grouped = df.groupby(["sub", "meal_type"])
    else:
        grouped = df.groupby("sub")

    rows = []
    for key, g in grouped:
        sid = key[0] if isinstance(key, tuple) else key
        g = g.dropna(subset=["iauc"] + MACROS)
        if positive_only:
            g = g[g["iauc"] > 0]
        arr = g[MACROS].to_numpy()
        iauc = g["iauc"].to_numpy()
        for i in range(len(g)):
            for j in range(i + 1, len(g)):
                d = np.abs(arr[i] - arr[j])
                if (d <= np.array(tol)).all():
                    rows.append({"sub": sid, "iauc_1": iauc[i], "iauc_2": iauc[j]})
    return pd.DataFrame(rows, columns=["sub", "iauc_1", "iauc_2"])


def icc_one_way_one(pairs: pd.DataFrame) -> float:
    """ICC(1,1) with two measurements per pair, absolute agreement.

    One-way ANOVA form with k = 2:

    - ``MSB = 2 * var(pair means, ddof=1)``
    - ``MSW = mean((a - b)^2) / 2``

    (The previous implementation used ``n * var(pair means)`` and the mean of
    the two marginal variances, which returns 0.5 for perfectly agreeing
    duplicates; see the note in ``reports/technical_report.md`` §5.1.)
    """
    a = pairs["iauc_1"].to_numpy()
    b = pairs["iauc_2"].to_numpy()
    m = (a + b) / 2
    ms_between = 2 * np.var(m, ddof=1)
    ms_within = np.mean((a - b) ** 2) / 2
    denom = ms_between + ms_within
    return float((ms_between - ms_within) / denom) if denom > 0 else float("nan")


def _pair_pearson(pairs: pd.DataFrame) -> float:
    if len(pairs) < 3:
        return float("nan")
    a = pairs["iauc_1"].to_numpy()
    b = pairs["iauc_2"].to_numpy()
    if np.std(a) == 0 or np.std(b) == 0:
        return float("nan")
    return float(stats.pearsonr(a, b).statistic)


def cluster_bootstrap_ci(pairs: pd.DataFrame, n_boot: int = 5000,
                         seed: int = SEED) -> tuple[float, float]:
    """95% CI from resampling *subjects* with replacement.

    Pairs are not independent: a subject with many duplicate meals contributes
    several pairs. Resampling subjects keeps each subject's pairs together.
    """
    groups = {sid: g for sid, g in pairs.groupby("sub")}
    subs = np.array(list(groups))
    rng = np.random.default_rng(seed)
    draws = []
    for _ in range(n_boot):
        pick = rng.choice(subs, size=len(subs), replace=True)
        stacked = pd.concat([groups[s] for s in pick], ignore_index=True)
        r = _pair_pearson(stacked)
        if np.isfinite(r):
            draws.append(r)
    if not draws:
        return float("nan"), float("nan")
    lo, hi = np.percentile(draws, [2.5, 97.5])
    return float(lo), float(hi)


def one_pair_per_subject(pairs: pd.DataFrame, n_boot: int = 2000,
                         seed: int = SEED + 1) -> tuple[float, float, float]:
    """Subject-balanced sensitivity check: one random pair per subject per draw.

    Returns ``(mean r, 2.5th percentile, 97.5th percentile)``.
    """
    groups = {sid: g for sid, g in pairs.groupby("sub")}
    rng = np.random.default_rng(seed)
    draws = []
    for _ in range(n_boot):
        picked = [g.iloc[int(rng.integers(len(g)))] for g in groups.values()]
        r = _pair_pearson(pd.DataFrame(picked).reset_index(drop=True))
        if np.isfinite(r):
            draws.append(r)
    if not draws:
        return float("nan"), float("nan"), float("nan")
    return (float(np.mean(draws)),
            float(np.percentile(draws, 2.5)),
            float(np.percentile(draws, 97.5)))


def run_e2(cg: pd.DataFrame) -> list[dict]:
    rows = []
    meal_types = sorted(cg["meal_type"].dropna().unique())
    scopes = [(m, m, True, False) for m in meal_types]
    scopes += [("all meals", None, True, False),
               ("all meals (cross-type pairs)", None, False, False),
               ("breakfast (both iauc>0)", "breakfast", True, True)]

    for tol, label in [((2, 2, 2, 1), "±2g macros"), ((5, 5, 5, 3), "±5g macros")]:
        for name, meal_type, same_type, positive_only in scopes:
            pairs = duplicate_pairs(cg, tol, meal_type, same_type=same_type,
                                    positive_only=positive_only)
            n_subjects = int(pairs["sub"].nunique()) if len(pairs) else 0
            extra: dict = {}
            if len(pairs) < 3:
                extra.update({"spearman_r": np.nan, "icc": np.nan})
                row = _row("E2 duplicate-meal reliability", name, "—", "iauc",
                           f"duplicate pairs ({label})", len(pairs), np.nan, extra)
                row["n_subjects"] = n_subjects
            else:
                r = _pair_pearson(pairs)
                lo, hi = cluster_bootstrap_ci(pairs)
                ob_mean, ob_lo, ob_hi = one_pair_per_subject(pairs)
                extra.update({
                    "spearman_r": round(float(
                        stats.spearmanr(pairs["iauc_1"], pairs["iauc_2"]).statistic), 4),
                    "icc": round(icc_one_way_one(pairs), 4),
                    "ci_low": round(lo, 4) if np.isfinite(lo) else np.nan,
                    "ci_high": round(hi, 4) if np.isfinite(hi) else np.nan,
                })
                row = _row("E2 duplicate-meal reliability", name, "—", "iauc",
                           f"duplicate pairs ({label})", len(pairs), r, extra)
                row["n_subjects"] = n_subjects
                row["r_one_pair_mean"] = round(ob_mean, 4) if np.isfinite(ob_mean) else np.nan
                row["r_one_pair_low"] = round(ob_lo, 4) if np.isfinite(ob_lo) else np.nan
                row["r_one_pair_high"] = round(ob_hi, 4) if np.isfinite(ob_hi) else np.nan
            rows.append(row)
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
    # Keep the subject count integral; pandas would otherwise widen it to
    # float because rows from other experiments leave it empty.
    out["n_subjects"] = pd.array(out["n_subjects"], dtype="Int64")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    out.to_csv(OUT, index=False)

    for exp, block in out.groupby("experiment", sort=False):
        print(f"\n=== {exp} ===")
        cols = [c for c in block.columns if c != "experiment"]
        print(block[cols].to_string(index=False))

    print(f"\nSaved: {OUT}")


if __name__ == "__main__":
    main()
