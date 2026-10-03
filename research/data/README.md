# Data provenance — CGMacros

- **Dataset:** CGMacros (continuous glucose monitoring + macronutrient intake)
- **Source:** PhysioNet — https://physionet.org/content/cgmacros/1.0.0/
- **DOI:** `10.13026/3z8q-x658`
- **Paper:** Das et al., *Scientific Data* 12, 1557 (2025) — https://www.nature.com/articles/s41597-025-05851-7
- **License:** **CC BY-NC-SA 4.0** (non-commercial, share-alike).
  ⚠️ The `LICENSE.txt` *inside* the ZIP is an **empty (0-byte) file** (verified:
  `SHA256 = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`);
  the license is declared on the web page only. Any derivative work must
  attribute the source and carry the same license.

## Files (v1.0.0)

| File | Bytes | SHA256 |
|---|---|---|
| `CGMacros_dateshifted365.zip` | 657,187,340 | `05c8b0e6f1a2757050aced55ce4bf6ab2ac9b30f2fd8ca193056812d9c621d4d` |

## How to obtain

```bash
bash research/src/download_data.sh
```

The script downloads from the **open S3 endpoint**
(`physionet-open.s3.amazonaws.com`), verifies the SHA256, and extracts into
`raw/extracted/`. This is the only practical channel — `physionet.org/files/`
is rate-limited to ~68 KB/s, which makes the 627 MB download impractical.

## Layout (never committed — see root `.gitignore`)

```
data/raw/        # downloaded ZIP + extracted files
data/interim/    # intermediate artifacts
data/processed/  # analysis-ready tables
```

## Why not committed

The ZIP is 627 MB and contains ~3,545 meal photos. Datasets must never be
pushed to the repository.

---

# Data provenance — BIG IDEAs (external validation)

- **Dataset:** BIG IDEAs Lab Glycemic Variability and Wearable Device Data
- **Source:** PhysioNet — https://physionet.org/content/big-ideas-glycemic-wearable/1.1.2/
- **DOI (version 1.1.2, used here):** `10.13026/zthx-5212`
- **Reference:** Cho, P., Kim, J., Bent, B., & Dunn, J., PhysioNet.
- **License:** **ODC-By 1.0** (attribution).

## Why version 1.1.2

Release notes for 1.1.3 state *"Updated misaligned food log dates"*, i.e. 1.1.3
fixes a defect in 1.1.2. However the 1.1.3 `/files/` tree returns HTTP 403 for
anonymous clients and the open mirror carries only up to 1.1.2, so we use 1.1.2
and repair the food-log dates ourselves (`src/build_external.py`).

## How to obtain

```bash
python research/src/download_bigideas.py
```

Only the 33 small files needed for this analysis are fetched (2.4 MB):
16 × `Dexcom_0XX.csv`, 16 × `Food_Log_0XX.csv` and `Demographics.csv`. The rest
of the release (Empatica wristband streams, ~34 GB unpacked) is not used.

## Notes

- 16 subjects with Dexcom G6 CGM (5-minute) and a free-living food log.
- Meals are not annotated; items logged within 20 minutes are grouped into one
  eating event.
- BIG IDEAs lacks the CGMacros blood panel, so external validation uses the five
  shared features (carbohydrate, protein, baseline glucose, sex, HbA1c).
