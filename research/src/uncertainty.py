#!/usr/bin/env python3
"""Conformal prediction intervals for the LOPO PPGR model.

The point model in ``evaluate.py`` reports a single number per meal. For a
health-adjacent use that is not enough: a prediction should come with an honest
interval. We add **split / cross-conformal** intervals (Vovk et al.; Barber et
al., 2021) on top of the existing out-of-fold predictions — no new model, and no
change to the point predictions.

Protocol
--------
Every prediction in the LOPO suite is already out-of-sample: the value for
subject *s* comes from a model that never saw *s*. For a held-out subject *s* we
therefore take the absolute residuals ``|y - ŷ|`` of all **other** subjects as a
calibration set, compute the finite-sample conformal quantile
``ceil((n+1)(1-alpha))``-th smallest score, and build the symmetric interval
``ŷ ± q``. Calibration and test scores come from different folds of the same
LOPO procedure, which is the standard cross-conformal construction.

Assumption and its check
------------------------
Conformal validity needs exchangeability. Meals *within* a subject are not
exchangeable (a person's responses are correlated), so nominal coverage is not
guaranteed. Rather than assert it, we **measure** empirical meal-level coverage
and also report per-subject coverage, so any shortfall is visible.

Outputs: ``experiments/uncertainty.csv`` and ``reports/figures/fig7_conformal.png``.
"""

from __future__ import annotations

import os

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from evaluate import FEATURE_COLUMNS, lopo_predict, xgb_model

HERE = os.path.dirname(os.path.abspath(__file__))
MEALS_CSV = os.path.abspath(os.path.join(HERE, "..", "data", "processed", "meals.csv"))
OUT_DIR = os.path.abspath(os.path.join(HERE, "..", "experiments"))
FIG_DIR = os.path.abspath(os.path.join(HERE, "..", "reports", "figures"))

TARGETS = ["auc", "iauc"]
ALPHAS = [0.20, 0.10]  # nominal 80% and 90% coverage
TARGET_LABELS = {"iauc": "2-h iAUC", "auc": "2-h AUC"}

plt.rcParams.update(
    {
        "figure.dpi": 150,
        "savefig.dpi": 150,
        "font.size": 10,
        "axes.grid": True,
        "grid.alpha": 0.25,
        "axes.spines.top": False,
        "axes.spines.right": False,
    }
)


def conformal_quantile(scores: np.ndarray, alpha: float) -> float:
    """Finite-sample conformal quantile: the ceil((n+1)(1-alpha)) order statistic."""
    n = len(scores)
    k = int(np.ceil((n + 1) * (1 - alpha)))
    if k > n:
        return float("inf")
    return float(np.sort(scores)[k - 1])


def cross_conformal(
    df: pd.DataFrame,
    target: str,
    preds: np.ndarray,
    alpha: float,
    subject_col: str = "sub",
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Per-subject cross-conformal intervals around the LOPO point predictions.

    Returns ``(lower, upper, halfwidth)``. Calibration for each held-out subject
    uses the residuals of all other subjects, so nothing about the test subject's
    own responses is used to set its interval width.
    """
    y = df[target].to_numpy(dtype=float)
    subs = df[subject_col].to_numpy()
    scores = np.abs(y - preds)
    lower = np.empty(len(df))
    upper = np.empty(len(df))
    halfwidth = np.empty(len(df))
    for s in np.unique(subs):
        mask = subs == s
        q = conformal_quantile(scores[~mask], alpha)
        lower[mask] = preds[mask] - q
        upper[mask] = preds[mask] + q
        halfwidth[mask] = q
    return lower, upper, halfwidth


def fig7_conformal(details: dict) -> None:
    """Three honest views: calibration, width, and per-subject coverage."""
    fig, axes = plt.subplots(1, 3, figsize=(13.5, 4.2))

    # Panel A — nominal vs. empirical coverage.
    ax = axes[0]
    x = np.arange(len(ALPHAS))
    width = 0.36
    colours = {"auc": "#2c6fbb", "iauc": "#d1495b"}
    for i, target in enumerate(TARGETS):
        vals = [details[("all meals (extension)", target, a)]["coverage"] for a in ALPHAS]
        ax.bar(x + (i - 0.5) * width, vals, width,
               label=TARGET_LABELS[target], color=colours[target])
    ax.plot(x, [1 - a for a in ALPHAS], "k--", marker="o", linewidth=1,
            label="nominal")
    ax.set_xticks(x)
    ax.set_xticklabels([f"{int((1 - a) * 100)}%" for a in ALPHAS])
    ax.set_ylim(0, 1.05)
    ax.set_xlabel("nominal coverage")
    ax.set_ylabel("empirical coverage (meals)")
    ax.set_title("A · Calibration")
    ax.legend(fontsize=8, loc="lower right")

    # Panel B — interval width; AUC intervals are wide because most of the
    # residual is between-subject.
    ax = axes[1]
    for i, target in enumerate(TARGETS):
        vals = [details[("all meals (extension)", target, a)]["mean_width"] for a in ALPHAS]
        ax.bar(x + (i - 0.5) * width, vals, width,
               label=TARGET_LABELS[target], color=colours[target])
    ax.set_xticks(x)
    ax.set_xticklabels([f"{int((1 - a) * 100)}%" for a in ALPHAS])
    ax.set_xlabel("nominal coverage")
    ax.set_ylabel("mean interval width (mg/dL)")
    ax.set_title("B · Width")
    ax.legend(fontsize=8)

    # Panel C — per-subject coverage at 90% for iAUC: the exchangeability check.
    ax = axes[2]
    per_sub = details[("all meals (extension)", "iauc", 0.10)]["per_subject_coverage"]
    ax.scatter(np.arange(len(per_sub)), np.sort(per_sub), s=18, color="#d1495b")
    ax.axhline(0.90, color="k", linestyle="--", linewidth=1)
    ax.set_xlabel("subject (sorted)")
    ax.set_ylabel("per-subject coverage")
    ax.set_ylim(0, 1.05)
    ax.set_title("C · Per-subject coverage, iAUC @90%")

    fig.suptitle("Conformal prediction intervals for the LOPO model", fontsize=12)
    fig.tight_layout(rect=(0, 0, 1, 0.94))
    path = os.path.join(FIG_DIR, "fig7_conformal.png")
    fig.savefig(path)
    plt.close(fig)
    print(f"Saved: {path}")


def main() -> None:
    df = pd.read_csv(MEALS_CSV)
    df = df[df["iauc"] > 0].copy()

    subsets = {
        "breakfast (official replication)": df[df["meal_type"] == "breakfast"],
        "all meals (extension)": df,
    }

    rows = []
    details: dict = {}
    for label, subset in subsets.items():
        for target in TARGETS:
            preds = lopo_predict(subset, FEATURE_COLUMNS, target, xgb_model())
            y = subset[target].to_numpy(dtype=float)
            subs = subset["sub"].to_numpy()
            for alpha in ALPHAS:
                lower, upper, halfwidth = cross_conformal(subset, target, preds, alpha)
                covered = (y >= lower) & (y <= upper)
                per_subject_coverage = pd.Series(covered).groupby(subs).mean().to_numpy()
                width = upper - lower
                rows.append(
                    {
                        "subset": label,
                        "target": target,
                        "nominal": 1 - alpha,
                        "coverage": round(float(covered.mean()), 4),
                        "mean_width": round(float(width.mean()), 2),
                        "median_width": round(float(np.median(width)), 2),
                        "min_subject_coverage": round(float(per_subject_coverage.min()), 4),
                        "n": int(len(subset)),
                    }
                )
                details[(label, target, alpha)] = {
                    "coverage": float(covered.mean()),
                    "mean_width": float(width.mean()),
                    "per_subject_coverage": per_subject_coverage,
                }
                print(
                    f"{label:34s} {target:5s} nominal={1 - alpha:.0%} "
                    f"coverage={covered.mean():.3f} width={width.mean():.1f} mg/dL"
                )

    os.makedirs(OUT_DIR, exist_ok=True)
    out = pd.DataFrame(rows)
    out_path = os.path.join(OUT_DIR, "uncertainty.csv")
    out.to_csv(out_path, index=False)
    print(f"Saved: {out_path}")

    os.makedirs(FIG_DIR, exist_ok=True)
    fig7_conformal(details)


if __name__ == "__main__":
    main()
