# License notice for the research module

This module contains three kinds of content under different licenses:

| Content | License | Why |
|---|---|---|
| Source code (`src/`, `app/`, `prototypes/`) | MIT (root [LICENSE](../LICENSE)) | Original work; kept reusable |
| Dataset-derived artifacts (`experiments/` tables, `reports/figures/`) | CC BY-NC-SA 4.0 | Derived from CGMacros, which is CC BY-NC-SA 4.0 (PhysioNet) |
| Technical report (`reports/technical_report.*`) | CC BY-NC-SA 4.0 | Declared in §9 of the report |

Notes:

- The root MIT license covers the code; it does **not** grant any rights to the
  CGMacros or BIG IDEAs datasets themselves. Obtain them directly from
  PhysioNet (see `data/README.md` for DOIs and terms).
- BIG IDEAs is licensed ODC-By 1.0; only artifacts derived from CGMacros carry
  the NC-SA clause.
- Nothing in this module redistributes subject-level data. The `experiments/`
  tables contain only aggregated model results; processed per-meal tables stay
  out of version control (see the root `.gitignore`).
