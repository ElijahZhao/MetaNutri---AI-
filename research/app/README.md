# PPGR Predictor — CGMacros research demo

Interactive demo for the MetaNutri research module: predict the 2-hour
postprandial glucose response to a meal from its macronutrients and a set of
subject-level clinical features.

- **Model:** XGBoost (`max_depth=1`, `n_estimators=80`, `learning_rate=0.2`),
  one booster per target (2-h iAUC, 2-h AUC, peak glucose rise).
- **Validation:** leave-one-subject-out (LOPO) cross-validation — every
  prediction is made for a subject the model has never seen.
  Held-out performance on 1,557 meals: **AUC r = 0.84**, **iAUC r = 0.45**,
  **peak rise r = 0.54**.
- **Explanations:** exact TreeSHAP values (XGBoost `pred_contribs`).
- **Illustrative curve:** the models predict scalars, not a time series; the
  plotted trace is a population-average gamma shape scaled to the predicted
  peak rise and iAUC, and is labelled as such in the app.

## Not a medical device

This is a research and portfolio demo on a small cohort (45 subjects). It is
not clinical advice and must not be used for diagnosis or treatment.

## Data

[CGMacros](https://physionet.org/content/cgmacros/1.0.0/)
(PhysioNet, DOI `10.13026/3z8q-x658`), licensed
**CC BY-NC-SA 4.0**. This demo is a derivative work distributed under the same
license, with attribution to the original authors. Raw data is not
redistributed here.

## Files

```
app.py            Streamlit UI
inference.py      model loading, prediction, TreeSHAP, curve reconstruction
model/            trained boosters + preprocessing metadata
requirements.txt  pinned dependencies
```
