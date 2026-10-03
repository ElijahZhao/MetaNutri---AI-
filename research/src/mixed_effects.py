#!/usr/bin/env python3
"""Mixed-effects check on repeated meals (subject random intercept).

``evaluate.py`` reports a *predictive* view (LOPO) and §4.5 splits it into
within- and between-subject skill. This script adds the complementary
*inferential* view the plan asked for (docs/ROADMAP.md §3.3): a linear
mixed-effects model with a **subject random intercept** on the full cohort,
using the **Mundlak / within-between** specification.

For every meal-level predictor we enter two terms:

- ``cw_<x>`` — the value centred on that subject's own mean → the
  **within-subject** effect ("if this person eats more carbs than usual, ...");
- ``cm_<x>`` — the subject's mean value → the **between-subject** effect
  ("do people who habitually eat more carbs respond differently?").

The random intercept absorbs the repeated-measures structure, so the
within-subject coefficient is not contaminated by stable between-person
differences. The random-intercept variance also gives an **ICC** per target,
which quantifies how much of the response variance is between people — a direct
cross-check on the §4.5 decomposition.

This is descriptive inference on the observed cohort, not a predictive claim;
it never touches the LOPO protocol. Predictors are standardised so the
within- and between-subject coefficients are comparable.

Outputs: ``experiments/mixed_effects_variance.csv``,
``experiments/mixed_effects_coefficients.csv`` and
``reports/figures/fig8_mixed_effects.png``.
"""

from __future__ import annotations

import os
import warnings

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import statsmodels.api as sm

HERE = os.path.dirname(os.path.abspath(__file__))
MEALS_CSV = os.path.abspath(os.path.join(HERE, "..", "data", "processed", "meals.csv"))
OUT_DIR = os.path.abspath(os.path.join(HERE, "..", "experiments"))
FIG_DIR = os.path.abspath(os.path.join(HERE, "..", "reports", "figures"))

TARGETS = ["auc", "iauc", "peak_rise"]
PREDICTORS = ["carbs_g", "protein_g", "fat_g", "fiber_g"]
PREDICTOR_LABELS = {
    "carbs_g": "carbs",
    "protein_g": "protein",
    "fat_g": "fat",
    "fiber_g": "fiber",
}
TARGET_LABELS = {"iauc": "2-h iAUC", "auc": "2-h AUC", "peak_rise": "peak rise"}

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


def build_design(df: pd.DataFrame) -> pd.DataFrame:
    """Add standardised within-subject (``cw_``) and between-subject (``cm_``) columns."""
    out = df.copy()
    for col in PREDICTORS:
        z = (out[col] - out[col].mean()) / out[col].std()
        subject_mean = z.groupby(out["sub"]).transform("mean")
        out[f"cw_{col}"] = z - subject_mean
        out[f"cm_{col}"] = subject_mean
    return out


def fit_one(design: pd.DataFrame, target: str):
    """Fit the Mundlak mixed model for one target; return (result, variance row)."""
    within = [f"cw_{c}" for c in PREDICTORS]
    between = [f"cm_{c}" for c in PREDICTORS]
    formula = f"{target} ~ " + " + ".join(within + between)

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        model = sm.MixedLM.from_formula(formula, groups=design["sub"], data=design)
        result = model.fit()

    sigma_u2 = float(result.cov_re.iloc[0, 0])
    sigma_e2 = float(result.scale)
    icc = sigma_u2 / (sigma_u2 + sigma_e2)
    variance = {
        "target": target,
        "sigma_subject": round(np.sqrt(sigma_u2), 2),
        "sigma_residual": round(np.sqrt(sigma_e2), 2),
        "icc": round(icc, 4),
        "n_meals": int(len(design)),
        "n_subjects": int(design["sub"].nunique()),
    }
    return result, variance


def coefficient_rows(result, target: str) -> list[dict]:
    rows = []
    for term, coef in result.params.items():
        if term == "Intercept" or term == "Group Var":
            continue
        component = "within-subject" if term.startswith("cw_") else "between-subject"
        predictor = PREDICTOR_LABELS.get(term[3:], term[3:])
        rows.append(
            {
                "target": target,
                "predictor": predictor,
                "component": component,
                "coef": round(float(coef), 3),
                "se": round(float(result.bse[term]), 3),
                "pvalue": round(float(result.pvalues[term]), 4),
            }
        )
    return rows


def fig8_mixed_effects(coefs: pd.DataFrame, variance: pd.DataFrame) -> None:
    """Within- vs between-subject standardised effects, one panel per target.

    Each panel keeps its own x-scale: the targets differ by orders of magnitude,
    and a shared axis would flatten peak rise to nothing.
    """
    fig, axes = plt.subplots(1, 3, figsize=(13.5, 4.4))
    order = list(PREDICTOR_LABELS.values())
    y = np.arange(len(order))
    colours = {"within-subject": "#2c6fbb", "between-subject": "#66a182"}

    for ax, target in zip(axes, TARGETS):
        sub = coefs[coefs["target"] == target]
        for component, offset in (("within-subject", 0.16), ("between-subject", -0.16)):
            part = sub[sub["component"] == component].set_index("predictor").reindex(order)
            ax.errorbar(
                part["coef"],
                y + offset,
                xerr=1.96 * part["se"],
                fmt="o",
                ms=4,
                capsize=3,
                color=colours[component],
                label=component,
            )
        ax.axvline(0, color="#333", linewidth=0.8)
        icc = variance[variance["target"] == target]["icc"].iloc[0]
        ax.set_yticks(y)
        ax.set_yticklabels(order)
        ax.set_title(f"{TARGET_LABELS[target]}  (ICC = {icc:.2f})")
        ax.set_xlabel("standardised coefficient")

    axes[0].legend(fontsize=8, loc="best")
    fig.suptitle("Mixed model (subject random intercept): within vs between-subject effects",
                 fontsize=11)
    fig.tight_layout(rect=(0, 0, 1, 0.94))
    path = os.path.join(FIG_DIR, "fig8_mixed_effects.png")
    fig.savefig(path)
    plt.close(fig)
    print(f"Saved: {path}")


def main() -> None:
    df = pd.read_csv(MEALS_CSV)
    df = df[df["iauc"] > 0].copy()
    # One meal is missing a fibre value; the mixed model cannot take NaN, so we
    # drop it (1556 of 1557 meals remain) rather than impute.
    df = df.dropna(subset=PREDICTORS).copy()
    design = build_design(df)

    variance_rows, coef_rows = [], []
    for target in TARGETS:
        result, variance = fit_one(design, target)
        variance_rows.append(variance)
        coef_rows.extend(coefficient_rows(result, target))
        print(
            f"{target:9s} ICC={variance['icc']:.3f} "
            f"(sigma_subject={variance['sigma_subject']}, "
            f"sigma_residual={variance['sigma_residual']})"
        )

    os.makedirs(OUT_DIR, exist_ok=True)
    variance_df = pd.DataFrame(variance_rows)
    coefs_df = pd.DataFrame(coef_rows)
    variance_df.to_csv(os.path.join(OUT_DIR, "mixed_effects_variance.csv"), index=False)
    coefs_df.to_csv(os.path.join(OUT_DIR, "mixed_effects_coefficients.csv"), index=False)
    print(f"Saved: {os.path.join(OUT_DIR, 'mixed_effects_variance.csv')}")
    print(f"Saved: {os.path.join(OUT_DIR, 'mixed_effects_coefficients.csv')}")

    os.makedirs(FIG_DIR, exist_ok=True)
    fig8_mixed_effects(coefs_df, variance_df)

    print("\nWithin-subject macronutrient effects (p < 0.05):")
    sig = coefs_df[(coefs_df["component"] == "within-subject") & (coefs_df["pvalue"] < 0.05)]
    print(sig.to_string(index=False) if len(sig) else "  (none)")


if __name__ == "__main__":
    main()
