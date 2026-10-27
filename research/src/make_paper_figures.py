#!/usr/bin/env python3
"""Figures for the manuscript, drawn at print width.

The technical report's figures (``fig1``-``fig8``) are landscape assets sized for
that report. The manuscript needs figures at roughly 7 in so that 8-9 pt labels
survive the reduction to a 6.5 in text column, so the four figures used in the
paper are produced here:

===== =============================== =============================
Paper  File                            Content
===== =============================== =============================
1      ``fig9_regime_ladder.png``      duplicate-meal reliability, and
                                       model r against its own regime's rho
2      ``fig10_transfer_bidirectional.png`` internal LOPO vs frozen transfer,
                                       both directions
3      ``fig11_skill_decomposition.png``  pooled vs within- vs between-subject r
4      ``fig12_mixed_effects.png``     within- vs between-subject coefficients
===== =============================== =============================

Every value that exists in a committed CSV is read from it. The only
hard-coded numbers are published literature estimates, which are not in any
CSV; each carries its source and matches Table 1 of the manuscript. All
plotted numbers are printed so a run log can be checked against the tables.

PNG bytes depend on the matplotlib version and are not guaranteed to be
reproducible; the plotted quantities are.

Outputs land in ``research/reports/figures/``.
"""

from __future__ import annotations

import os
from decimal import ROUND_HALF_UP, Decimal

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
EXPERIMENTS = os.path.abspath(os.path.join(HERE, "..", "experiments"))
FIG_DIR = os.path.abspath(os.path.join(HERE, "..", "reports", "figures"))

RESULTS_CSV = os.path.join(EXPERIMENTS, "results.csv")
CEILING_CSV = os.path.join(EXPERIMENTS, "ceiling_results.csv")
EXTERNAL_CSV = os.path.join(EXPERIMENTS, "external_results.csv")
COEFS_CSV = os.path.join(EXPERIMENTS, "mixed_effects_coefficients.csv")
VARIANCE_CSV = os.path.join(EXPERIMENTS, "mixed_effects_variance.csv")

# --- Published estimates (paper Table 1). Not present in any committed CSV. ---
# Zeevi et al. 2015, Cell 163(5):1079-1094 — four standardized meals, iPro2.
ZEEVI_RHO = (0.71, 0.77)
# Mendes-Soares et al. 2019, AJCN 110(1):63-75 — bagel duplicate, n = 111 (rho),
# and the Israeli -> Midwestern transfer on the same device (r).
MENDES_RHO = 0.66
MENDES_TRANSFER_R = 0.596
# Hengist et al. 2025, AJCN 121(1):74-82 — inpatient duplicate meals, ~1 wk
# apart, 30 adults without diabetes. (r, 95% CI low, 95% CI high).
HENGIST_DEXCOM = (0.45, 0.39, 0.50)
HENGIST_LIBRE = (0.46, 0.38, 0.54)

TARGET_LABELS = {"iauc": "2-h iAUC", "auc": "2-h AUC", "peak_rise": "peak rise"}
PREDICTORS = ["carbs", "protein", "fat", "fiber"]

plt.rcParams.update(
    {
        "figure.dpi": 150,
        "savefig.dpi": 300,
        "font.size": 9,
        "axes.titlesize": 9.5,
        "axes.labelsize": 9,
        "xtick.labelsize": 8.5,
        "ytick.labelsize": 8.5,
        "legend.fontsize": 7.5,
        "axes.grid": True,
        "grid.alpha": 0.25,
        "axes.spines.top": False,
        "axes.spines.right": False,
    }
)

BLUE = "#2c6fbb"
RED = "#d1495b"
GREEN = "#66a182"
AMBER = "#f2b134"
GREY = "#8a8f98"


def fmt(x: float, n: int) -> str:
    """Half-up rounding, so figure labels match the manuscript tables.

    Python's ``f"{x:.3f}"`` rounds half to even on the binary value (0.6545
    prints as 0.654); the tables use half-up (0.655).
    """
    return str(Decimal(str(float(x))).quantize(Decimal("1." + "0" * n),
                                               rounding=ROUND_HALF_UP))


def _e2_row(subset: str, model: str = "duplicate pairs (±2g macros)") -> pd.Series:
    df = pd.read_csv(CEILING_CSV)
    hit = df[(df["experiment"] == "E2 duplicate-meal reliability")
             & (df["subset"] == subset) & (df["model"] == model)]
    assert len(hit) == 1, f"expected one E2 row for {subset!r}, got {len(hit)}"
    return hit.iloc[0]


def _r(df: pd.DataFrame, **query) -> float:
    mask = pd.Series(True, index=df.index)
    for col, val in query.items():
        mask &= df[col] == val
    hit = df[mask]
    assert len(hit) == 1, f"expected one row for {query}, got {len(hit)}"
    return float(hit["pearson_r"].iloc[0])


def fig1_regime_ladder() -> None:
    """Panel A: the ladder. Panel B: model r against its own regime's rho."""
    res = pd.read_csv(RESULTS_CSV)
    ext = pd.read_csv(EXTERNAL_CSV)

    bf = _e2_row("breakfast")
    allm = _e2_row("all meals")
    dinner = _e2_row("dinner")
    snack = _e2_row("snack")

    rows = [
        ("CGMacros: dinner, free-choice", float(dinner["pearson_r"]),
         float(dinner["ci_low"]), float(dinner["ci_high"]), BLUE),
        ("CGMacros: snack, free-choice", float(snack["pearson_r"]),
         float(snack["ci_low"]), float(snack["ci_high"]), BLUE),
        ("Hengist 2025: Dexcom G4, inpatient", HENGIST_DEXCOM[0],
         HENGIST_DEXCOM[1], HENGIST_DEXCOM[2], AMBER),
        ("Hengist 2025: Libre Pro, inpatient", HENGIST_LIBRE[0],
         HENGIST_LIBRE[1], HENGIST_LIBRE[2], AMBER),
        ("Mendes-Soares 2019: iPro2, bagel", MENDES_RHO, None, None, GREY),
        ("Zeevi 2015: iPro2, standard meals", sum(ZEEVI_RHO) / 2,
         ZEEVI_RHO[0], ZEEVI_RHO[1], GREY),
        ("CGMacros: all meals, same type", float(allm["pearson_r"]),
         float(allm["ci_low"]), float(allm["ci_high"]), BLUE),
        ("CGMacros: breakfast, reference meal", float(bf["pearson_r"]),
         float(bf["ci_low"]), float(bf["ci_high"]), BLUE),
    ]
    rows.sort(key=lambda r: r[1])

    fig, (ax0, ax1) = plt.subplots(
        2, 1, figsize=(7.4, 7.9), gridspec_kw={"height_ratios": [1.5, 1.0]}
    )

    # --- panel A: the ladder ---
    for yi, (_label, rho, lo, hi, colour) in zip(range(len(rows)), rows, strict=False):
        if lo is None:
            ax0.plot([rho], [yi], "o", ms=6, color=colour)
            continue
        ax0.errorbar([rho], [yi], xerr=np.array([[rho - lo], [hi - rho]]), fmt="o",
                     ms=6, capsize=3, elinewidth=1.1, color=colour)
        if hi - lo < 0.07:  # Zeevi reports a range, not a CI
            ax0.plot([lo, hi], [yi, yi], color=colour, linewidth=4, alpha=0.45,
                     solid_capstyle="butt", zorder=1)
    ax0.set_yticks(range(len(rows)))
    ax0.set_yticklabels(
        [
            f"{lab}\n" + ("no reported interval" if lo is None else
                          (f"ρ = {fmt(lo, 2)}–{fmt(hi, 2)} (range)" if hi - lo < 0.07 else
                           f"ρ = {fmt(rho, 3)}  [{fmt(lo, 2)}, {fmt(hi, 2)}]"))
            for lab, rho, lo, hi, _c in rows
        ],
        fontsize=8,
    )
    ax0.set_xlim(0, 1.0)
    ax0.set_ylim(-0.7, len(rows) - 0.3)
    ax0.set_xlabel("duplicate-meal reliability  ρ")
    ax0.set_title("A · The reliability ladder", loc="left")
    handles = [
        plt.Line2D([], [], marker="o", linestyle="", color=BLUE, label="CGMacros (this study)"),
        plt.Line2D([], [], marker="o", linestyle="", color=AMBER,
                   label="Hengist et al. 2025 (device-level proxy)"),
        plt.Line2D([], [], marker="o", linestyle="", color=GREY, label="other published cohorts"),
    ]
    ax0.legend(handles=handles, loc="upper left", framealpha=0.95)

    # --- panel B: model r against its own regime's rho ---
    r_within = _r(res, subset="breakfast (official replication)",
                  model="xgboost (official baseline)", target="iauc")
    r_forward = _r(ext, cohort="BIG IDEAs (external transfer)",
                   feature_set="core (5 features)", model="xgboost", target="iauc")

    b_rows = [
        ("CGMacros breakfast, within cohort\n(this study)", r_within,
         float(bf["pearson_r"]), BLUE),
        ("Same device, cross-population †\n(Mendes-Soares et al.)", MENDES_TRANSFER_R,
         MENDES_RHO, GREEN),
        ("Cross-device, cross-cohort ‡\n(CGMacros → BIG IDEAs)", r_forward,
         HENGIST_DEXCOM[0], RED),
    ]
    for yi, (_label, r, rho, colour) in zip([2, 1, 0], b_rows, strict=False):
        ax1.barh([yi], [r], height=0.40, color=colour, alpha=0.9)
        ax1.plot([rho, rho], [yi - 0.27, yi + 0.27], color="#222", linewidth=1.8)
        ax1.plot([np.sqrt(rho), np.sqrt(rho)], [yi - 0.27, yi + 0.27], "--",
                 color="#222", linewidth=1.3)
        ax1.text(r + 0.02, yi + 0.29, f"r = {fmt(r, 3)}", ha="left", fontsize=8.5)
        ax1.text(rho, yi - 0.31, f"ρ = {fmt(rho, 2)}", ha="center", va="center",
                 fontsize=7.5)
        ax1.text(0.99, yi, f"R²/ρ = {fmt(r ** 2 / rho, 2)}", va="center", ha="right",
                 fontsize=8.5, fontweight="bold",
                 bbox=dict(facecolor="white", edgecolor="none", pad=1.0))
    ax1.set_yticks([0, 1, 2])
    ax1.set_yticklabels([b[0] for b in reversed(b_rows)], fontsize=8)
    ax1.text(np.sqrt(b_rows[0][2]) + 0.012, 2.42, "√ρ", fontsize=8.5, style="italic",
             va="center")
    ax1.set_xlim(0, 1.0)
    ax1.set_ylim(-0.6, 2.6)
    ax1.set_xlabel("correlation / reliability")
    ax1.set_title("B · Model r against its own regime's ρ", loc="left")

    fig.tight_layout()
    path = os.path.join(FIG_DIR, "fig9_regime_ladder.png")
    fig.savefig(path)
    plt.close(fig)
    print(f"Saved: {path}")

    print("\nFigure 1 — panel A (ρ):")
    for label, rho, lo, hi, _c in rows:
        span = "no CI" if lo is None else f"[{lo:.4f}, {hi:.4f}]"
        print(f"  {label:<40s} rho={rho:.4f}  CI {span}")
    print("Figure 1 — panel B (model r vs its regime's rho):")
    for label, r, rho, _c in b_rows:
        print(f"  {label.splitlines()[0]:<40s} r={r:.4f}  rho={rho:.4f}  "
              f"sqrt(rho)={np.sqrt(rho):.4f}  R2/rho={r ** 2 / rho:.4f}")


def fig2_transfer_bidirectional() -> None:
    """Internal LOPO versus frozen-model transfer, in both directions."""
    ext = pd.read_csv(EXTERNAL_CSV)
    ceil = pd.read_csv(CEILING_CSV)
    e3 = ceil[ceil["experiment"] == "E3 reverse transfer (BI->CG)"]
    assert len(e3) == 3, f"expected three E3 rows, got {len(e3)}"

    targets = ["auc", "iauc", "peak_rise"]
    forward_internal = [_r(ext, cohort="BIG IDEAs (LOPO, internal)",
                           feature_set="core (5 features)", model="xgboost", target=t)
                        for t in targets]
    forward_external = [_r(ext, cohort="BIG IDEAs (external transfer)",
                           feature_set="core (5 features)", model="xgboost", target=t)
                        for t in targets]
    reverse_internal = [_r(ext, cohort="CGMacros (LOPO, internal)",
                           feature_set="core (5 features)", model="xgboost", target=t)
                        for t in targets]
    reverse_external = [float(e3[e3["target"] == t]["pearson_r"].iloc[0]) for t in targets]

    panels = [
        ("A · Trained on CGMacros → BIG IDEAs", forward_internal, forward_external,
         "656 BIG IDEAs meals"),
        ("B · Trained on BIG IDEAs → CGMacros", reverse_internal, reverse_external,
         "1,699 CGMacros meals"),
    ]

    fig, axes = plt.subplots(1, 2, figsize=(7.2, 3.3), sharey=True)
    width = 0.34
    x = np.arange(len(targets))
    for ax, (title, internal, external, n_label) in zip(axes, panels, strict=False):
        ax.bar(x - width / 2, internal, width, label="internal LOPO", color=GREY, alpha=0.8)
        ax.bar(x + width / 2, external, width, label="frozen transfer", color=RED, alpha=0.9)
        for xi, vi, ve in zip(x, internal, external, strict=False):
            ax.text(xi - width / 2, vi + 0.015, fmt(vi, 2), ha="center", fontsize=7)
            ax.text(xi + width / 2, ve + 0.015, fmt(ve, 2), ha="center", fontsize=7)
        ax.set_xticks(x)
        ax.set_xticklabels([TARGET_LABELS[t] for t in targets], fontsize=8)
        ax.set_title(f"{title}\n({n_label})", loc="left", fontsize=8.5)
        ax.set_ylim(0, 0.95)
        ax.axhline(0, color="#333", linewidth=0.8)
    axes[0].set_ylabel("Pearson r")
    axes[0].legend(loc="upper right", framealpha=0.95)

    fig.tight_layout()
    path = os.path.join(FIG_DIR, "fig10_transfer_bidirectional.png")
    fig.savefig(path)
    plt.close(fig)
    print(f"Saved: {path}")

    print("\nFigure 2 — internal LOPO vs frozen transfer (core five features):")
    for t, vi, ve in zip(targets, forward_internal, forward_external, strict=False):
        print(f"  forward  {t:<10s} BIG IDEAs internal={vi:.4f}  transfer={ve:.4f}")
    for t, vi, ve in zip(targets, reverse_internal, reverse_external, strict=False):
        print(f"  reverse  {t:<10s} CGMacros internal={vi:.4f}  transfer={ve:.4f}")


def fig3_skill_decomposition() -> None:
    """Pooled, within-subject and between-subject r for the LOPO model."""
    res = pd.read_csv(RESULTS_CSV)
    subsets = [
        ("breakfast (official replication)", "A · Breakfast only (official replication)"),
        ("all meals (extension)", "B · All meals (extension)"),
    ]
    targets = ["auc", "iauc", "peak_rise"]
    series = [("pooled r", "pearson_r", GREY),
              ("within-subject r", "within_r", BLUE),
              ("between-subject r", "between_r", GREEN)]

    fig, axes = plt.subplots(2, 1, figsize=(7.2, 5.6), sharey=True)
    width = 0.26
    x = np.arange(len(targets))
    for ax, (subset, title) in zip(axes, subsets, strict=False):
        sub = res[(res["subset"] == subset) & (res["model"] == "xgboost (official baseline)")]
        for i, (label, col, colour) in enumerate(series):
            vals = [float(sub[sub["target"] == t][col].iloc[0]) for t in targets]
            ax.bar(x + (i - 1) * width, vals, width, label=label, color=colour)
            for xi, vi in zip(x, vals, strict=False):
                ax.text(xi + (i - 1) * width, vi + 0.015, fmt(vi, 2), ha="center",
                        fontsize=6.8)
        ax.axhline(0, color="#333", linewidth=0.8)
        ax.set_xticks(x)
        ax.set_xticklabels([TARGET_LABELS[t] for t in targets])
        ax.set_ylim(0, 1.0)
        ax.set_ylabel("Pearson r (LOPO)")
        ax.set_title(title, loc="left")
    axes[0].legend(loc="upper right", ncol=3, framealpha=0.95)

    fig.tight_layout()
    path = os.path.join(FIG_DIR, "fig11_skill_decomposition.png")
    fig.savefig(path)
    plt.close(fig)
    print(f"Saved: {path}")

    print("\nFigure 3 — decomposition (xgboost, official baseline):")
    for subset, _title in subsets:
        sub = res[(res["subset"] == subset) & (res["model"] == "xgboost (official baseline)")]
        for t in targets:
            row = sub[sub["target"] == t].iloc[0]
            print(f"  {subset:<34s} {t:<10s} pooled={row['pearson_r']:.4f}  "
                  f"within={row['within_r']:.4f}  between={row['between_r']:.4f}")


def fig4_mixed_effects() -> None:
    """Within- versus between-subject coefficients, one panel per target."""
    coefs = pd.read_csv(COEFS_CSV)
    var = pd.read_csv(VARIANCE_CSV)
    unit = {"auc": "mg/dL·min", "iauc": "mg/dL·min", "peak_rise": "mg/dL"}

    fig, axes = plt.subplots(3, 1, figsize=(7.2, 7.0))
    y = np.arange(len(PREDICTORS))
    for ax, target in zip(axes, ["auc", "iauc", "peak_rise"], strict=False):
        sub = coefs[coefs["target"] == target]
        for component, offset, colour in (("within-subject", 0.15, BLUE),
                                          ("between-subject", -0.15, GREEN)):
            part = (sub[sub["component"] == component].set_index("predictor")
                    .reindex(PREDICTORS))
            ax.errorbar(part["coef"], y + offset, xerr=1.96 * part["se"], fmt="o",
                        ms=4, capsize=2.5, elinewidth=1.0, color=colour, label=component)
        ax.axvline(0, color="#333", linewidth=0.8)
        icc = float(var[var["target"] == target]["icc"].iloc[0])
        ax.set_yticks(y)
        ax.set_yticklabels(PREDICTORS)
        ax.set_ylim(-0.6, len(PREDICTORS) - 0.4)
        ax.set_xlabel(f"coefficient ({unit[target]} per 1 SD predictor)")
        ax.set_title(f"{TARGET_LABELS[target]}   (ICC = {fmt(icc, 2)})", loc="left")
    axes[0].legend(loc="upper left", framealpha=0.95)

    fig.tight_layout()
    path = os.path.join(FIG_DIR, "fig12_mixed_effects.png")
    fig.savefig(path)
    plt.close(fig)
    print(f"Saved: {path}")

    print("\nFigure 4 — mixed-model coefficients (±1.96 SE):")
    for target in ["auc", "iauc", "peak_rise"]:
        sub = coefs[coefs["target"] == target]
        for component in ["within-subject", "between-subject"]:
            part = sub[sub["component"] == component].set_index("predictor").reindex(PREDICTORS)
            vals = ", ".join(f"{p}={part.loc[p, 'coef']:.1f}±{part.loc[p, 'se']:.1f}"
                             for p in PREDICTORS)
            print(f"  {target:<10s} {component:<16s} {vals}")


def main() -> None:
    os.makedirs(FIG_DIR, exist_ok=True)
    fig1_regime_ladder()
    fig2_transfer_bidirectional()
    fig3_skill_decomposition()
    fig4_mixed_effects()
    print("\nFigures written to", FIG_DIR)


if __name__ == "__main__":
    main()
