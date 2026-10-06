# app/assets

Files the Streamlit UI loads at runtime (see `ASSETS` in `../app.py`):

- `external_results.csv`
- `fig5_external_validation.png`

Both are **byte-identical copies** of the experiment / report outputs:

| File here | Source of truth |
|---|---|
| `external_results.csv` | [`../../experiments/external_results.csv`](../../experiments/external_results.csv) |
| `fig5_external_validation.png` | [`../../reports/figures/fig5_external_validation.png`](../../reports/figures/fig5_external_validation.png) |

The copies exist so the `app/` directory is self-contained for the Streamlit
deployment. **Edit the originals** under `experiments/` and `reports/figures/`,
then copy them back here — do not edit these two in place.
