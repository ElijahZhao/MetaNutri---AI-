#!/usr/bin/env python3
"""Run the LOPO evaluation suite on the CGMacros meal table.

Produces two views, both with leave-one-subject-out cross-validation:

1. **breakfast** — replicates the official CGMacros baseline (which uses
   breakfast only), so our numbers can be compared against the published
   r≈0.89 (AUC) / r≈0.64 (iAUC).
2. **all meals** — the extension: breakfast + lunch + dinner + snacks, using
   the same features, to test cross-meal-type generalisation.

Results are printed and written to research/experiments/results.csv.
"""

from __future__ import annotations

import os

import pandas as pd

from evaluate import run_suite

HERE = os.path.dirname(os.path.abspath(__file__))
MEALS_CSV = os.path.abspath(os.path.join(HERE, "..", "data", "processed", "meals.csv"))
OUT_DIR = os.path.abspath(os.path.join(HERE, "..", "experiments"))
TARGETS = ["iauc", "auc", "peak_rise"]


def main() -> None:
    df = pd.read_csv(MEALS_CSV)
    # Official notebook keeps only meals with a positive response.
    df = df[df["iauc"] > 0].copy()

    subsets = {
        "breakfast (official replication)": df[df["meal_type"] == "breakfast"],
        "all meals (extension)": df,
    }

    all_results = []
    for label, subset in subsets.items():
        print(f"\n=== {label} — n={len(subset)}, subjects={subset['sub'].nunique()} ===")
        for target in TARGETS:
            res = run_suite(subset, target)
            res.insert(0, "subset", label)
            all_results.append(res)
            print(res.to_string(index=False, columns=["model", "n", "pearson_r", "r2", "rmse"]))
            print()

    out = pd.concat(all_results, ignore_index=True)
    os.makedirs(OUT_DIR, exist_ok=True)
    out_path = os.path.join(OUT_DIR, "results.csv")
    out.to_csv(out_path, index=False)
    print(f"Saved: {out_path}")


if __name__ == "__main__":
    main()
