#!/usr/bin/env python3
"""Download the 33 key BIG IDEAs files used for external validation.

BIG IDEAs Lab Glycemic Variability and Wearable Device Data (PhysioNet,
``10.13026/zthx-5212``), version **1.1.2**, licensed ODC-By 1.0.

This is the *version* DOI for 1.1.2, matching the ``1.1.2/`` prefix fetched
below. ``10.13026/w591-tp72`` is PhysioNet's "latest version" DOI and currently
resolves to 1.1.3, so it would not describe what this script actually pulls.

Why 1.1.2 and not 1.1.3
-----------------------
Release notes for 1.1.3 state *"Updated misaligned food log dates"*, i.e. 1.1.3
fixes exactly the defect described in ``build_external.py``. However the 1.1.3
``/files/`` tree returns HTTP 403 for anonymous clients and the official open
mirror (``physionet-open``) only carries up to 1.1.2. We therefore use 1.1.2 and
repair the food-log dates ourselves with an explicit, validated procedure
(see ``build_external.py``).

Only the 33 small files needed for this analysis are fetched (2.4 MB):
16 x ``Dexcom_0XX.csv``, 16 x ``Food_Log_0XX.csv`` and ``Demographics.csv``.
The rest of the release (Empatica wristband streams, ~34 GB unpacked) is not
used.

Usage::

    python src/download_bigideas.py [--dest DIR]
"""

from __future__ import annotations

import argparse
import os
import re
import sys

import requests

ROOT = "https://physionet-open.s3.amazonaws.com"
PREFIX = "big-ideas-glycemic-wearable/1.1.2/"
HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DEST = os.path.abspath(os.path.join(HERE, "..", "data", "raw", "bigideas"))

NEEDED = re.compile(r"/(Dexcom|Food_Log)_\d+\.csv$|/Demographics\.csv$")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dest", default=DEFAULT_DEST)
    args = ap.parse_args()
    os.makedirs(args.dest, exist_ok=True)

    listing = requests.get(
        f"{ROOT}/",
        params={"list-type": "2", "max-keys": "3000", "prefix": PREFIX},
        timeout=120,
    )
    listing.raise_for_status()
    keys = [
        re.search(r"<Key>(.*?)</Key>", item).group(1)
        for item in re.findall(r"<Contents>(.*?)</Contents>", listing.text, re.S)
    ]
    wanted = sorted(k for k in keys if NEEDED.search(k))
    if not wanted:
        sys.exit(f"No matching objects under {PREFIX}")

    for key in wanted:
        out = os.path.join(args.dest, key.split("/")[-1])
        if os.path.exists(out) and os.path.getsize(out) > 0:
            continue
        resp = requests.get(f"{ROOT}/{key}", timeout=120)
        resp.raise_for_status()
        with open(out, "wb") as fh:
            fh.write(resp.content)

    files = sorted(os.listdir(args.dest))
    total = sum(os.path.getsize(os.path.join(args.dest, f)) for f in files)
    print(f"{len(files)} files, {total / 1e6:.2f} MB -> {args.dest}")


if __name__ == "__main__":
    main()
