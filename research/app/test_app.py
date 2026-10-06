#!/usr/bin/env python3
"""Smoke test for the Streamlit demo (``app.py``).

The README claims the demo was "built and validated (in-process ``AppTest``)".
This file makes that claim reproducible: it boots the app headlessly with
Streamlit's own test harness, presses **Predict**, and checks that the three
scalar predictions and the TreeSHAP panel render without exceptions.

Run it either way::

    python test_app.py     # standalone, prints one line per test
    pytest test_app.py     # if pytest happens to be installed

No Streamlit server and no network access are needed; the model is the frozen
JSON weight bundle in ``model/``.
"""

from __future__ import annotations

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
# ``app.py`` does ``from inference import ...``, so its own directory must be on
# the path and be the working directory when the harness runs it.
sys.path.insert(0, HERE)
os.chdir(HERE)

from streamlit.testing.v1 import AppTest  # noqa: E402

APP = os.path.join(HERE, "app.py")
TARGETS = ("2-h AUC", "2-h iAUC", "Peak glucose rise")


def _boot() -> AppTest:
    """Run the app once without interacting; the initial state must be clean."""
    at = AppTest.from_file(APP, default_timeout=120)
    at.run()
    assert not at.exception, f"app raised on boot: {[str(e.value) for e in at.exception]}"
    return at


def _predict() -> AppTest:
    """Boot the app and press the Predict button."""
    at = _boot()
    assert at.button, "no Predict button found"
    at.button[0].click().run()
    assert not at.exception, f"app raised on predict: {[str(e.value) for e in at.exception]}"
    return at


def test_boots_without_error() -> None:
    at = _boot()
    assert any("Postprandial" in t.value for t in at.title), "title missing"
    assert any("Not a medical device" in w.value for w in at.warning), "disclaimer missing"


def test_predict_renders_three_scalar_predictions() -> None:
    at = _predict()
    # The held-out-performance metrics read "r = 0.84"; the predictions are plain
    # numbers, so filter on the prefix to isolate them.
    values = [m.value for m in at.metric if not m.value.startswith("r = ")]
    assert len(values) == 3, f"expected 3 predictions, got {values}"
    for value in values:
        assert float(value.replace(",", "")) > 0, f"non-positive prediction: {value}"


def test_treeshap_explanation_switches_target() -> None:
    at = _predict()
    assert at.radio, "no explanation radio found"
    assert len(at.radio[0].options) == 3, at.radio[0].options
    at.radio[0].set_value("iauc").run()
    assert not at.exception, f"switching target raised: {[str(e.value) for e in at.exception]}"


def _main() -> int:
    tests = (
        test_boots_without_error,
        test_predict_renders_three_scalar_predictions,
        test_treeshap_explanation_switches_target,
    )
    for test in tests:
        test()
        print(f"ok  {test.__name__}")
    print(f"\n{len(tests)} passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(_main())
