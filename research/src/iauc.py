"""Glucose-curve area metrics for postprandial response (PPGR).

All functions operate on a short postprandial glucose series sampled on a
regular grid and are independent of any particular dataset.

Terminology
-----------
- **Baseline**: the glucose value at the meal time point, i.e. ``values[0]``.
- **iAUC** (incremental AUC): area between the curve and the baseline, counting
  only the region *above* baseline. This is the standard summary used in
  nutrition / PPGR studies (Wolever's positive incremental area).
- **AUC** (total AUC): the trapezoidal area under the whole curve.
"""

from __future__ import annotations

import numpy as np


def incremental_auc(values, dt_minutes: float) -> float:
    """Positive incremental area under the curve above ``values[0]``.

    Trapezoidal integration on a uniform grid of spacing ``dt_minutes``.
    Segments crossing the baseline are split at the crossing so that only the
    portion above baseline contributes.
    """
    v = np.asarray(values, dtype=float)
    if v.size < 2:
        return float("nan")
    base = v[0]
    d = v - base
    area = 0.0
    for i in range(d.size - 1):
        y0, y1 = d[i], d[i + 1]
        if y0 >= 0.0 and y1 >= 0.0:
            area += 0.5 * (y0 + y1) * dt_minutes
        elif y0 >= 0.0 > y1:
            # Descends through the baseline: keep only the triangle above it.
            area += 0.5 * y0 * (y0 / (y0 - y1)) * dt_minutes
        elif y0 < 0.0 <= y1:
            area += 0.5 * y1 * (y1 / (y1 - y0)) * dt_minutes
        # Both below baseline: nothing contributes.
    return float(area)


def total_auc(values, dt_minutes: float) -> float:
    """Trapezoidal area under the entire curve."""
    v = np.asarray(values, dtype=float)
    if v.size < 2:
        return float("nan")
    return float(np.trapezoid(v, dx=dt_minutes))


def peak_rise(values) -> float:
    """Maximum increase above the baseline value."""
    v = np.asarray(values, dtype=float)
    if v.size == 0:
        return float("nan")
    return float(np.max(v) - v[0])
