#!/usr/bin/env python3
"""Generate the figures used by the technical report.

All prediction figures reuse the exact LOPO protocol from ``evaluate.py`` so the
plots and ``experiments/results.csv`` describe the same predictions. Nothing here
is used for model selection; it is descriptive reporting only.

Outputs land in ``research/reports/figures/``.
"""

from __future__ import annotations

import os

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy import stats

from evaluate import FEATURE_COLUMNS, lopo_predict, xgb_model

HERE = os.path.dirname(os.path.abspath(__file__))
MEALS_CSV = os.path.abspath(os.path.join(HERE, "..", "data", "processed", "meals.csv"))
BIGIDEAS_CSV = os.path.abspath(os.path.join(HERE, "..", "data", "processed", "bigideas_meals.csv"))
RESULTS_CSV = os.path.abspath(os.path.join(HERE, "..", "experiments", "results.csv"))
EXTERNAL_CSV = os.path.abspath(os.path.join(HERE, "..", "experiments", "external_results.csv"))
FIG_DIR = os.path.abspath(os.path.join(HERE, "..", "reports", "figures"))

TARGET_LABELS = {"iauc": "2-h iAUC", "auc": "2-h AUC", "peak_rise": "peak glucose rise"}
MODEL_ORDER = ["mean", "carb-only linear", "energy-only linear", "xgboost (official baseline)"]

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


def load_meals() -> pd.DataFrame:
    df = pd.read_csv(MEALS_CSV)
    return df[df["iauc"] > 0].copy()


def lopo_xgb(df: pd.DataFrame, target: str) -> np.ndarray:
    return lopo_predict(df, FEATURE_COLUMNS, target, xgb_model())


def fig1_pred_vs_actual(df: pd.DataFrame) -> None:
    subsets = {
        "breakfast (official replication)": df[df["meal_type"] == "breakfast"],
        "all meals (extension)": df,
    }
    targets = ["auc", "iauc"]
    col_titles = ["Breakfast only", "All meals"]
    fig, axes = plt.subplots(2, 2, figsize=(8, 8))
    for col, ((label, subset), col_title) in enumerate(zip(subsets.items(), col_titles)):
        for row, target in enumerate(targets):
            ax = axes[row, col]
            pred = lopo_xgb(subset, target)
            obs = subset[target].to_numpy()
            r = stats.pearsonr(obs, pred).statistic
            ax.scatter(obs, pred, s=8, alpha=0.35, edgecolors="none", color="#2c6fbb")
            lo = float(min(obs.min(), pred.min()))
            hi = float(max(obs.max(), pred.max()))
            ax.plot([lo, hi], [lo, hi], "--", color="#888", linewidth=1)
            title = f"{TARGET_LABELS[target]} — r = {r:.3f}"
            ax.set_title(f"{col_title}\n{title}" if row == 0 else title, fontsize=10)
            ax.set_xlabel("observed")
            ax.set_ylabel("predicted")
    fig.suptitle("XGBoost LOPO predictions (each point = one held-out meal)", fontsize=11)
    fig.tight_layout(rect=(0.02, 0, 1, 0.97))
    fig.savefig(os.path.join(FIG_DIR, "fig1_pred_vs_actual.png"))
    plt.close(fig)


def fig2_model_comparison() -> None:
    res = pd.read_csv(RESULTS_CSV)
    subsets = list(dict.fromkeys(res["subset"]))
    targets = ["auc", "iauc", "peak_rise"]
    colors = ["#9aa0a6", "#f2b134", "#e8853c", "#2c6fbb"]
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.2), sharey=True)
    width = 0.25
    x = np.arange(len(targets))
    for ax, subset in zip(axes, subsets):
        sub = res[res["subset"] == subset]
        for i, model in enumerate(MODEL_ORDER):
            vals = [
                sub[(sub["model"] == model) & (sub["target"] == t)]["pearson_r"].iloc[0]
                for t in targets
            ]
            ax.bar(x + (i - 1.5) * width, vals, width, label=model, color=colors[i])
        ax.axhline(0, color="#333", linewidth=0.8)
        ax.set_xticks(x)
        ax.set_xticklabels([TARGET_LABELS[t] for t in targets])
        ax.set_title(subset)
        ax.set_ylabel("Pearson r (LOPO)" if ax is axes[0] else "")
    axes[0].legend(fontsize=8, loc="lower left")
    fig.suptitle("Out-of-fold correlation by model, target and subset", fontsize=11)
    fig.tight_layout(rect=(0, 0, 1, 0.95))
    fig.savefig(os.path.join(FIG_DIR, "fig2_model_comparison.png"))
    plt.close(fig)


def fig3_data_overview(df: pd.DataFrame) -> None:
    fig, axes = plt.subplots(1, 3, figsize=(12, 3.8))

    order = ["breakfast", "lunch", "dinner", "snack"]
    data = [df.loc[df["meal_type"] == m, "iauc"].to_numpy() for m in order]
    axes[0].boxplot(data, tick_labels=order, showfliers=False)
    axes[0].set_ylabel("2-h iAUC")
    axes[0].set_title("iAUC by meal type")

    axes[1].scatter(df["carbs_g"], df["iauc"], s=8, alpha=0.3, color="#2c6fbb", edgecolors="none")
    r = stats.pearsonr(df["carbs_g"], df["iauc"]).statistic
    axes[1].set_xlabel("carbohydrates (g)")
    axes[1].set_ylabel("2-h iAUC")
    axes[1].set_title(f"Carbs vs iAUC (r = {r:.2f})")

    counts = df["meal_type"].value_counts().reindex(order)
    axes[2].bar(order, counts.to_numpy(), color="#66a182")
    axes[2].set_ylabel("meals")
    axes[2].set_title(f"Meals per type (n = {len(df)})")

    fig.tight_layout()
    fig.savefig(os.path.join(FIG_DIR, "fig3_data_overview.png"))
    plt.close(fig)


def fig4_feature_importance(df: pd.DataFrame) -> None:
    import xgboost as xgb

    subsets = {
        "breakfast": df[df["meal_type"] == "breakfast"],
        "all meals": df,
    }
    fig, axes = plt.subplots(1, 2, figsize=(11, 5.4))
    for ax, (label, subset) in zip(axes, subsets.items()):
        y = subset["iauc"].to_numpy()
        x = subset[FEATURE_COLUMNS].fillna(subset[FEATURE_COLUMNS].median()).to_numpy(dtype=float)
        model = xgb.XGBRegressor(
            max_depth=1, n_estimators=80, learning_rate=0.2, reg_alpha=1.0, random_state=42
        )
        model.fit(x, y)
        imp = model.feature_importances_
        order = np.argsort(imp)[-10:]
        ax.barh([FEATURE_COLUMNS[i] for i in order], imp[order], color="#2c6fbb")
        ax.set_title(f"{label} (descriptive fit, not LOPO)")
        ax.set_xlabel("XGBoost gain importance")
    fig.suptitle("Which features drive iAUC predictions", fontsize=11)
    fig.tight_layout(rect=(0, 0, 1, 0.95))
    fig.savefig(os.path.join(FIG_DIR, "fig4_feature_importance.png"))
    plt.close(fig)


def fig5_external_validation() -> None:
    """Cross-cohort transfer: CGMacros-trained model applied to BIG IDEAs."""
    from external_validate import CORE, transfer

    res = pd.read_csv(EXTERNAL_CSV)
    cg = pd.read_csv(MEALS_CSV, low_memory=False)
    bi = pd.read_csv(BIGIDEAS_CSV, low_memory=False)
    cohorts = ["CGMacros (LOPO, internal)", "BIG IDEAs (LOPO, internal)",
               "BIG IDEAs (external transfer)"]
    colors = ["#2c6fbb", "#66a182", "#d1495b"]
    targets = ["iauc", "auc", "peak_rise"]

    fig, (ax0, ax1) = plt.subplots(1, 2, figsize=(11.5, 4.4))

    core = res[(res["model"] == "xgboost") & (res["feature_set"] == "core (5 features)")]
    x = np.arange(len(targets))
    width = 0.26
    for i, (cohort, colour) in enumerate(zip(cohorts, colors)):
        vals = [core[(core["cohort"] == cohort) & (core["target"] == t)]["pearson_r"].iloc[0]
                for t in targets]
        ax0.bar(x + (i - 1) * width, vals, width, label=cohort, color=colour)
    ax0.set_xticks(x)
    ax0.set_xticklabels([TARGET_LABELS[t] for t in targets])
    ax0.set_ylabel("Pearson r")
    ax0.set_title("XGBoost r by cohort (5 shared features)")
    ax0.legend(fontsize=7.5, loc="upper right")
    ax0.set_ylim(0, 0.95)

    for target, colour in zip(targets, colors):
        te, pred = transfer(cg, bi, CORE, target)
        obs = te[target].to_numpy()
        r = stats.pearsonr(obs, pred).statistic
        ax1.scatter(obs, pred, s=7, alpha=0.3, color=colour, edgecolors="none",
                    label=f"{TARGET_LABELS[target]} (r = {r:.2f})")
    ax1.set_xlabel("observed (BIG IDEAs)")
    ax1.set_ylabel("predicted (CGMacros-trained)")
    ax1.set_title("External transfer, frozen model")
    ax1.legend(fontsize=7.5, loc="upper left")

    fig.suptitle("External validation on BIG IDEAs", fontsize=11)
    fig.tight_layout(rect=(0, 0, 1, 0.94))
    fig.savefig(os.path.join(FIG_DIR, "fig5_external_validation.png"))
    plt.close(fig)


def fig6_within_between() -> None:
    """Split the headline correlation into within- and between-subject parts.

    A pooled Pearson r can be high simply because the model knows *who* tends to
    respond more, without ranking a person's own meals well. This figure shows
    both components next to the pooled number for the LOPO XGBoost model.
    """
    res = pd.read_csv(RESULTS_CSV)
    subsets = {
        "breakfast (official replication)": "Breakfast only (replication)",
        "all meals (extension)": "All meals (extension)",
    }
    targets = ["auc", "iauc", "peak_rise"]
    series = [("pooled r", "pearson_r", "#9aa0a6"),
              ("within-subject r", "within_r", "#2c6fbb"),
              ("between-subject r", "between_r", "#66a182")]

    fig, axes = plt.subplots(1, 2, figsize=(11, 4.2), sharey=True)
    width = 0.26
    x = np.arange(len(targets))
    for ax, (subset, title) in zip(axes, subsets.items()):
        sub = res[(res["subset"] == subset)
                  & (res["model"] == "xgboost (official baseline)")]
        for i, (label, col, colour) in enumerate(series):
            vals = [
                sub[sub["target"] == t][col].iloc[0] for t in targets
            ]
            ax.bar(x + (i - 1) * width, vals, width, label=label, color=colour)
        ax.axhline(0, color="#333", linewidth=0.8)
        ax.set_xticks(x)
        ax.set_xticklabels([TARGET_LABELS[t] for t in targets])
        ax.set_title(title)
        ax.set_ylabel("Pearson r (LOPO)" if ax is axes[0] else "")
    axes[0].legend(fontsize=8, loc="upper right")
    fig.suptitle("Pooled skill vs. within- and between-subject skill (XGBoost)",
                 fontsize=11)
    fig.tight_layout(rect=(0, 0, 1, 0.95))
    fig.savefig(os.path.join(FIG_DIR, "fig6_within_between.png"))
    plt.close(fig)


def main() -> None:
    os.makedirs(FIG_DIR, exist_ok=True)
    df = load_meals()
    print(f"meals={len(df)} subjects={df['sub'].nunique()}")
    fig1_pred_vs_actual(df)
    fig2_model_comparison()
    fig3_data_overview(df)
    fig4_feature_importance(df)
    if os.path.exists(EXTERNAL_CSV) and os.path.exists(BIGIDEAS_CSV):
        fig5_external_validation()
    fig6_within_between()
    print("Figures written to", FIG_DIR)


if __name__ == "__main__":
    main()
