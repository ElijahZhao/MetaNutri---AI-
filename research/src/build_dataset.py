#!/usr/bin/env python3
"""Build the meal-level PPGR dataset from the raw CGMacros release.

For every meal annotation in ``CGMacros-0XX/CGMacros-0XX.csv`` we take the
postprandial glucose series on the 1-minute grid, sample it every 15 minutes
over the 2-hour window (9 points, 0...120 min), and compute:

- ``iauc``      : positive incremental area above the meal-time baseline
- ``auc``       : total trapezoidal area
- ``peak_rise`` : max glucose rise above baseline
- ``baseline_glucose`` : the meal-time glucose value

Subject-level features are joined from ``bio.csv`` **on the subject id** (the
official notebook joins positionally, which is fragile).

Glucose channel: ``Libre GL`` (matches the official baseline, whose feature is
named ``Baseline_Libre``).

Output: data/processed/meals.csv (one row per meal).
"""

from __future__ import annotations

import glob
import os
import re

import numpy as np
import pandas as pd

from iauc import incremental_auc, peak_rise, total_auc

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.abspath(os.path.join(HERE, "..", "data", "raw", "extracted", "CGMacros"))
OUT_DIR = os.path.abspath(os.path.join(HERE, "..", "data", "processed"))

GLUCOSE_COL = "Libre GL"
SAMPLE_STEP_MIN = 15
WINDOW_MIN = 120
N_SAMPLES = WINDOW_MIN // SAMPLE_STEP_MIN + 1  # 9 points


def _normalise_meal_type(value) -> str:
    """Collapse the raw labels ('Snacks', 'snack 1', ...) to a small set."""
    text = str(value).strip().lower()
    if text.startswith("snack"):
        return "snack"
    if text.startswith("breakfast"):
        return "breakfast"
    if text.startswith("lunch"):
        return "lunch"
    if text.startswith("dinner"):
        return "dinner"
    return text


def _clean_insulin(value) -> float:
    """bio.csv stores insulin as e.g. '2.5' or '2.5 (low)'."""
    if pd.isna(value):
        return np.nan
    m = re.match(r"\s*([0-9.]+)", str(value))
    return float(m.group(1)) if m else np.nan


def load_subject_features() -> pd.DataFrame:
    bio = pd.read_csv(os.path.join(RAW, "bio.csv"))
    bio["insulin"] = bio["Insulin "].map(_clean_insulin)
    bio["fasting_bg"] = pd.to_numeric(bio["Fasting GLU - PDL (Lab)"], errors="coerce")
    out = pd.DataFrame(
        {
            "sub": bio["subject"].astype(int),
            "age": pd.to_numeric(bio["Age"], errors="coerce"),
            "gender": bio["Gender"].map({"M": 1, "F": -1}),
            "bmi": pd.to_numeric(bio["BMI"], errors="coerce"),
            "a1c": pd.to_numeric(bio["A1c PDL (Lab)"], errors="coerce"),
            "insulin": bio["insulin"],
            "fasting_bg": bio["fasting_bg"],
            "tg": pd.to_numeric(bio["Triglycerides"], errors="coerce"),
            "cholesterol": pd.to_numeric(bio["Cholesterol"], errors="coerce"),
            "hdl": pd.to_numeric(bio["HDL"], errors="coerce"),
            "non_hdl": pd.to_numeric(bio["Non HDL "], errors="coerce"),
            "ldl": pd.to_numeric(bio["LDL (Cal)"], errors="coerce"),
            "vldl": pd.to_numeric(bio["VLDL (Cal)"], errors="coerce"),
            "cho_hdl_ratio": pd.to_numeric(bio["Cho/HDL Ratio"], errors="coerce"),
        }
    )
    out["homa_ir"] = out["insulin"] * out["fasting_bg"] / 405.0

    # Glycemic status by A1c (same thresholds as the official notebook).
    def _status(a1c: float) -> str:
        if pd.isna(a1c):
            return "unknown"
        if a1c < 5.7:
            return "healthy"
        if a1c <= 6.4:
            return "prediabetes"
        return "t2d"

    out["glycemic_status"] = out["a1c"].map(_status)
    return out


def extract_meals() -> pd.DataFrame:
    rows: list[dict] = []
    subject_dirs = sorted(glob.glob(os.path.join(RAW, "CGMacros-*")))
    for sub_dir in subject_dirs:
        name = os.path.basename(sub_dir)
        sub_id = int(name.split("-")[-1])
        csv_path = os.path.join(sub_dir, f"{name}.csv")
        if not os.path.exists(csv_path):
            continue
        df = pd.read_csv(csv_path, low_memory=False)
        # Column names are inconsistent across subjects (trailing spaces, and a
        # few files swap glucose columns or drop ``Amount Consumed`` entirely),
        # so normalise names and access optional columns defensively.
        df.columns = [str(c).strip() for c in df.columns]
        if GLUCOSE_COL not in df.columns:
            continue
        glucose = pd.to_numeric(df[GLUCOSE_COL], errors="coerce")
        has_amount = "Amount Consumed" in df.columns

        for idx in df.index[df["Meal Type"].notna()]:
            window = glucose.iloc[idx : idx + N_SAMPLES * SAMPLE_STEP_MIN : SAMPLE_STEP_MIN]
            values = window.to_numpy(dtype=float)
            if values.size < N_SAMPLES or np.isnan(values).any():
                continue
            rows.append(
                {
                    "sub": sub_id,
                    "meal_type": _normalise_meal_type(df.at[idx, "Meal Type"]),
                    "timestamp": df.at[idx, "Timestamp"],
                    "carbs_g": pd.to_numeric(df.at[idx, "Carbs"], errors="coerce"),
                    "protein_g": pd.to_numeric(df.at[idx, "Protein"], errors="coerce"),
                    "fat_g": pd.to_numeric(df.at[idx, "Fat"], errors="coerce"),
                    "fiber_g": pd.to_numeric(df.at[idx, "Fiber"], errors="coerce"),
                    "calories": pd.to_numeric(df.at[idx, "Calories"], errors="coerce"),
                    "amount_consumed": (
                        pd.to_numeric(df.at[idx, "Amount Consumed"], errors="coerce")
                        if has_amount
                        else np.nan
                    ),
                    "baseline_glucose": float(values[0]),
                    "iauc": incremental_auc(values, SAMPLE_STEP_MIN),
                    "auc": total_auc(values, SAMPLE_STEP_MIN),
                    "peak_rise": peak_rise(values),
                }
            )
    return pd.DataFrame(rows)


def main() -> None:
    meals = extract_meals()
    subjects = load_subject_features()
    data = meals.merge(subjects, on="sub", how="left")

    os.makedirs(OUT_DIR, exist_ok=True)
    out_path = os.path.join(OUT_DIR, "meals.csv")
    data.to_csv(out_path, index=False)

    print(f"Meals extracted: {len(data)} rows, {data['sub'].nunique()} subjects")
    print("By meal type:")
    print(data["meal_type"].str.lower().value_counts().to_string())
    print("By glycemic status:")
    print(data["glycemic_status"].value_counts().to_string())
    print("iAUC > 0:", int((data["iauc"] > 0).sum()))
    print("Missing subject features:",
          int(data["age"].isna().sum()), "rows")
    print(f"Saved: {out_path}")


if __name__ == "__main__":
    main()
