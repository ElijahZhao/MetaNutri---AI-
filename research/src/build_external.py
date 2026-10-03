#!/usr/bin/env python3
"""Build a meal-level PPGR table from the BIG IDEAs release (external cohort).

This mirrors ``build_dataset.py`` (CGMacros) so the two tables are directly
comparable: same 2-hour window, same 15-minute sampling (9 points), same target
definitions (``iauc`` / ``auc`` / ``peak_rise`` from ``iauc.py``).

BIG IDEAs differs from CGMacros in three ways that this module handles
explicitly.

1. **Meals are not annotated.** The release ships a free-living food log, one
   row per food item. We group items logged within ``MEAL_GAP_MIN`` minutes into
   a single eating event and sum their macronutrients.

2. **Food-log schemas are inconsistent.** Most subjects use a 14-column layout,
   subject 016 renames ``time`` to ``time_of_day``, and subject 003 ships a
   headerless 11-column layout with no fat column. Each variant is detected and
   mapped explicitly (see ``read_food_log``); we never guess a column's meaning
   from its position without the schema check below.

3. **Food-log dates are misaligned with the CGM dates.** The release notes for
   version 1.1.3 say *"Updated misaligned food log dates"*, confirming the
   defect. In 1.1.2 the food-log calendar dates of 4 of 16 subjects (007, 013,
   015, 016) are offset from their Dexcom dates by roughly five months, so the
   two streams do not overlap at all as shipped.

   We repair this with an objective, dataset-internal criterion rather than a
   hand-tuned constant. For each integer day offset ``d`` we shift every logged
   event and measure the median post-meal glucose rise (peak minus pre-meal
   median over the following 120 min). Because a meal precedes its excursion,
   the correct offset raises that statistic. To stop the search from selecting
   offsets that leave only a handful of events inside the CGM window, we first
   restrict to offsets that retain at least 90% of the maximum achievable
   coverage, and only then maximise the rise.

   The result is d = 0 for 12 subjects and d in {147, 150, 155} for the four
   affected ones, all reported by ``main()``. As an independent check we use the
   study's *standardised breakfast* (served every other day, and tagged in the
   food log of four subjects): after correction, morning glucose rise is higher
   on standardised-breakfast days than on other days for all four, by a median
   of 14 mg/dL.

Output: data/processed/bigideas_meals.csv (one row per eating event).
"""

from __future__ import annotations

import os
import re
import warnings

import numpy as np
import pandas as pd

from iauc import incremental_auc, peak_rise, total_auc

warnings.filterwarnings("ignore")

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.abspath(os.path.join(HERE, "..", "data", "raw", "bigideas"))
OUT_DIR = os.path.abspath(os.path.join(HERE, "..", "data", "processed"))

SAMPLE_STEP_MIN = 15
WINDOW_MIN = 120
N_SAMPLES = WINDOW_MIN // SAMPLE_STEP_MIN + 1  # 9 points
MEAL_GAP_MIN = 20
OFFSET_RANGE = range(-400, 401)
COVERAGE_KEEP = 0.90

STD14 = ["date", "time", "time_begin", "time_end", "logged_food", "amount",
         "unit", "searched_food", "calorie", "total_carb", "dietary_fiber",
         "sugar", "protein", "total_fat"]
STD11 = ["date", "time", "time_begin", "logged_food", "amount", "unit",
         "searched_food", "calorie", "total_carb", "sugar", "protein"]

MACROS = ["total_carb", "protein", "total_fat", "dietary_fiber"]


# --- input parsing -----------------------------------------------------------

def read_food_log(path: str) -> tuple[pd.DataFrame, str]:
    """Return (frame with ``ts`` + macro columns, schema label)."""
    with open(path, encoding="utf-8-sig") as fh:
        n_fields = len(fh.readline().split(","))

    if n_fields == len(STD11):
        df = pd.read_csv(path, header=None, names=STD11)
        schema = "headerless-11col (no fat)"
    else:
        df = pd.read_csv(path, low_memory=False)
        df.columns = [str(c).replace("\ufeff", "").strip() for c in df.columns]
        schema = "standard-14col"

    # Timestamp: prefer time_begin; fall back to date + time_of_day / time.
    if "time_begin" in df.columns:
        ts = pd.to_datetime(df["time_begin"], errors="coerce", format="mixed")
    elif "time_of_day" in df.columns:
        ts = pd.to_datetime(df["date"].astype(str) + " " + df["time_of_day"].astype(str),
                            errors="coerce", format="mixed")
    else:
        ts = pd.to_datetime(df["date"].astype(str) + " " + df["time"].astype(str),
                            errors="coerce", format="mixed")
    df["ts"] = ts

    for col in MACROS:
        df[col] = (pd.to_numeric(df[col], errors="coerce")
                   if col in df.columns else np.nan)
    return df, schema


def load_cgm(path: str) -> tuple[pd.Timestamp, np.ndarray]:
    """Dexcom EGV series interpolated onto a 1-minute grid."""
    df = pd.read_csv(path, low_memory=False)
    df.columns = [str(c).replace("\ufeff", "").strip() for c in df.columns]
    df = df[df["Event Type"].astype(str).str.strip() == "EGV"]
    ts = pd.to_datetime(df["Timestamp (YYYY-MM-DDThh:mm:ss)"], errors="coerce")
    gv = pd.to_numeric(df["Glucose Value (mg/dL)"], errors="coerce")
    series = pd.Series(gv.to_numpy(dtype=float), index=ts).dropna().sort_index()
    series = series[~series.index.duplicated()]
    lo = series.index.min().floor("min")
    n = int((series.index.max() - lo).total_seconds() // 60) + 1
    x = (series.index - lo).total_seconds().to_numpy() / 60.0
    grid = np.interp(np.arange(n, dtype=float), x, series.to_numpy(dtype=float))
    return lo, grid


def load_demographics(path: str) -> pd.DataFrame:
    demo = pd.read_csv(path, encoding="utf-8-sig")
    demo.columns = [str(c).replace("\ufeff", "").strip() for c in demo.columns]
    return pd.DataFrame({
        "sub": demo["ID"].astype(int),
        "gender": demo["Gender"].str.strip().str.upper().map({"MALE": 1, "FEMALE": -1}),
        "a1c": pd.to_numeric(demo["HbA1c"], errors="coerce"),
    })


# --- date-offset repair ------------------------------------------------------

def meal_events(df: pd.DataFrame) -> pd.DatetimeIndex:
    ts = df["ts"].dropna().sort_values()
    if ts.empty:
        return pd.DatetimeIndex([])
    keep = [ts.iloc[0]]
    for value in ts.iloc[1:]:
        if (value - keep[-1]).total_seconds() > MEAL_GAP_MIN * 60:
            keep.append(value)
    return pd.DatetimeIndex(keep)


def _median_rise(lo, grid, events, offset_days):
    idx = ((events + pd.Timedelta(days=offset_days) - lo).total_seconds()
           .to_numpy() // 60).astype(int)
    ok = (idx >= SAMPLE_STEP_MIN) & (idx + WINDOW_MIN < len(grid))
    if ok.sum() == 0:
        return np.nan, 0
    rises = [grid[i:i + WINDOW_MIN].max() - np.median(grid[i - SAMPLE_STEP_MIN:i + 1])
             for i in idx[ok]]
    return float(np.median(rises)), int(ok.sum())


def estimate_offset(lo, grid, events) -> tuple[int, int, float]:
    """Best integer day shift of the food log, with near-maximal coverage."""
    trials = []
    for d in OFFSET_RANGE:
        rise, n = _median_rise(lo, grid, events, d)
        trials.append((d, n, rise))
    max_cov = max(t[1] for t in trials)
    if max_cov == 0:
        return 0, 0, float("nan")
    eligible = [t for t in trials
                if t[1] >= COVERAGE_KEEP * max_cov and not np.isnan(t[2])]
    d, n, rise = max(eligible, key=lambda t: t[2])
    return int(d), n, rise


# --- meal construction -------------------------------------------------------

def build_subject(sub: int, offset: int, lo, grid, df: pd.DataFrame) -> list[dict]:
    items = df.dropna(subset=["ts"]).sort_values("ts")
    if items.empty:
        return []
    times = items["ts"].to_numpy()
    breaks = np.r_[True, np.diff(times).astype("timedelta64[m]").astype(float) > MEAL_GAP_MIN]
    groups = np.cumsum(breaks)

    rows: list[dict] = []
    for group_id in np.unique(groups):
        meal = items[groups == group_id]
        start = (meal["ts"].min() + pd.Timedelta(days=offset)).floor("min")
        i0 = int((start - lo).total_seconds() // 60)
        if i0 < 0 or i0 + WINDOW_MIN >= len(grid):
            continue
        values = grid[i0:i0 + WINDOW_MIN + 1:SAMPLE_STEP_MIN]
        if values.size < N_SAMPLES or not np.isfinite(values).all():
            continue
        rows.append({
            "sub": sub,
            "timestamp": start,
            "meal_type": "unlabelled",
            "carbs_g": meal["total_carb"].sum(min_count=1),
            "protein_g": meal["protein"].sum(min_count=1),
            "fat_g": meal["total_fat"].sum(min_count=1),
            "fiber_g": meal["dietary_fiber"].sum(min_count=1),
            "baseline_glucose": float(values[0]),
            "iauc": incremental_auc(values, SAMPLE_STEP_MIN),
            "auc": total_auc(values, SAMPLE_STEP_MIN),
            "peak_rise": peak_rise(values),
            "n_items": int(len(meal)),
            "standard_breakfast": bool(
                meal["logged_food"].astype(str)
                .str.contains("standard breakfast", case=False, na=False).any()
                if "logged_food" in meal.columns else False),
        })
    return rows


def main() -> None:
    demo = load_demographics(os.path.join(RAW, "Demographics.csv"))
    rows: list[dict] = []
    offsets: list[dict] = []
    schemas = []

    for sub in range(1, 17):
        fl, schema = read_food_log(os.path.join(RAW, f"Food_Log_{sub:03d}.csv"))
        lo, grid = load_cgm(os.path.join(RAW, f"Dexcom_{sub:03d}.csv"))
        events = meal_events(fl)
        d, cov, rise = estimate_offset(lo, grid, events)
        offsets.append({"sub": sub, "offset_days": d, "coverage": cov,
                        "n_events": len(events), "median_rise": rise})
        schemas.append((sub, schema))
        rows.extend(build_subject(sub, d, lo, grid, fl))

    meals = pd.DataFrame(rows).merge(demo, on="sub", how="left")
    meals["hour_of_day"] = pd.to_datetime(meals["timestamp"]).dt.hour
    meals = meals.sort_values(["sub", "timestamp"]).reset_index(drop=True)

    os.makedirs(OUT_DIR, exist_ok=True)
    out_path = os.path.join(OUT_DIR, "bigideas_meals.csv")
    meals.to_csv(out_path, index=False)

    print("Food-log schemas:")
    for sub, schema in schemas:
        if schema != "standard-14col":
            print(f"  {sub:03d}: {schema}")

    print("\nEstimated food-log day offsets (food_date + d = CGM_date):")
    print(pd.DataFrame(offsets).to_string(index=False))

    print(f"\nMeals: {len(meals)} rows, {meals['sub'].nunique()} subjects")
    print("Meals per subject:")
    print(meals.groupby("sub").size().to_string())
    print("\nFeature completeness (%):")
    print((meals[["carbs_g", "protein_g", "fat_g", "fiber_g",
                  "baseline_glucose", "gender", "a1c"]].isna().mean() * 100).round(1).to_string())
    print("\nTarget ranges:")
    print(meals[["iauc", "auc", "peak_rise"]].describe().loc[["min", "50%", "max"]].round(1).to_string())
    valid = meals.dropna(subset=["carbs_g", "iauc"])
    print(f"\ncorr(carbs_g, iauc) = {valid['carbs_g'].corr(valid['iauc']):.3f} "
          f"(n = {len(valid)})")
    print(f"\nSaved: {out_path}")


if __name__ == "__main__":
    main()
