"""Unit tests for the demo's inference layer (``app/inference.py``).

These run against the frozen model bundle in ``app/model/`` — no training stack,
no network. They complement ``app/test_app.py`` (which drives the whole Streamlit
UI headlessly) by pinning the behaviour of the prediction math itself.
"""

from __future__ import annotations

import inference
import numpy as np
import pytest
from inference import TARGETS, PPGRModel

MEAL = {
    "carbs_g": 45.0,
    "protein_g": 20.0,
    "fat_g": 15.0,
    "fiber_g": 5.0,
    "baseline_glucose": 110.0,
}
SUBJECT = {
    "age": 40.0,
    "gender": -1.0,
    "bmi": 24.0,
    "a1c": 5.4,
    "fasting_bg": 95.0,
    "insulin": 8.0,
    "tg": 100.0,
    "cholesterol": 180.0,
    "hdl": 60.0,
    "non_hdl": 120.0,
    "ldl": 100.0,
    "vldl": 20.0,
    "cho_hdl_ratio": 3.0,
}


@pytest.fixture(scope="module")
def model() -> PPGRModel:
    return PPGRModel()


@pytest.fixture(scope="module")
def values() -> dict:
    return PPGRModel.build_inputs(MEAL, SUBJECT)


def test_build_inputs_derives_homa_ir() -> None:
    out = PPGRModel.build_inputs(MEAL, SUBJECT)
    assert out["homa_ir"] == pytest.approx(8.0 * 95.0 / 405.0)


def test_build_inputs_leaves_homa_ir_nan_when_inputs_missing() -> None:
    out = PPGRModel.build_inputs(MEAL, {"insulin": 8.0})
    assert np.isnan(out["homa_ir"])


def test_predict_returns_three_positive_scalars(model: PPGRModel, values: dict) -> None:
    preds = model.predict(values)
    assert set(preds) == set(TARGETS)
    for target, value in preds.items():
        assert np.isfinite(value), f"{target} is not finite: {value}"
        assert value > 0.0, f"{target} is not positive: {value}"


def test_predict_is_deterministic(model: PPGRModel, values: dict) -> None:
    assert model.predict(values) == model.predict(values)


def test_missing_features_are_imputed_not_rejected(model: PPGRModel) -> None:
    partial = PPGRModel.build_inputs({"carbs_g": 45.0}, {})
    preds = model.predict(partial)
    assert all(np.isfinite(v) and v > 0.0 for v in preds.values())


def test_explain_covers_every_feature_and_sorts_by_magnitude(
    model: PPGRModel, values: dict
) -> None:
    pairs = model.explain(values, "iauc")
    assert len(pairs) == len(model.features)
    magnitudes = [abs(contribution) for _, contribution in pairs]
    assert magnitudes == sorted(magnitudes, reverse=True)


def test_explain_contributions_sum_to_the_raw_prediction(
    model: PPGRModel, values: dict
) -> None:
    """TreeSHAP is additive: bias + contributions must equal the prediction."""
    model.explain(values, "auc")
    row = model._vector(values).reshape(1, -1)
    dm = model._xgb.DMatrix(row, feature_names=model.features)
    contribs = model.boosters["auc"].predict(dm, pred_contribs=True)[0]
    assert contribs.sum() == pytest.approx(model.predict(values)["auc"], rel=1e-4)


def test_curve_is_consistent_with_the_predicted_scalars(model: PPGRModel, values: dict) -> None:
    preds = model.predict(values)
    t, glucose, _ = model.curve(
        baseline=MEAL["baseline_glucose"],
        peak_rise=preds["peak_rise"],
        iauc=preds["iauc"],
    )
    assert len(t) == len(glucose)
    assert glucose[0] == pytest.approx(MEAL["baseline_glucose"])
    assert glucose.max() - MEAL["baseline_glucose"] == pytest.approx(preds["peak_rise"], rel=0.02)
    area = inference._incremental_auc(glucose, 1.0)
    assert area == pytest.approx(preds["iauc"], rel=0.10)
