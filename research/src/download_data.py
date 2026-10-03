#!/usr/bin/env python3
"""Download CGMacros via parallel HTTP range requests, verify, and extract.

Why parallel: the site's own mirror (`physionet.org/files/`) is rate-limited to
~68 KB/s and the open S3 endpoint throttles a single connection to ~150 KB/s.
Splitting the 627 MB file into many range requests raises the aggregate
throughput by ~15x (measured 2.3 MB/s with 64 chunks in this environment).

The script is resumable: completed parts are kept in `.parts/` and skipped on
re-run. Provenance and license: see ../data/README.md
"""

from __future__ import annotations

import hashlib
import math
import os
import shutil
import sys
import time
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import Request, urlopen

URL = "https://physionet-open.s3.amazonaws.com/cgmacros/1.0.0/CGMacros_dateshifted365.zip"
FILENAME = "CGMacros_dateshifted365.zip"
SHA256 = "05c8b0e6f1a2757050aced55ce4bf6ab2ac9b30f2fd8ca193056812d9c621d4d"
TOTAL_SIZE = 657_187_340
N_CHUNKS = 64

HERE = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.abspath(os.path.join(HERE, "..", "data", "raw"))
PARTS_DIR = os.path.join(RAW_DIR, ".parts")
ZIP_PATH = os.path.join(RAW_DIR, FILENAME)
EXTRACT_DIR = os.path.join(RAW_DIR, "extracted")


def _log(msg: str) -> None:
    print(msg, flush=True)


def fetch_chunk(idx: int, start: int, end: int, attempts: int = 4) -> int:
    """Download bytes [start, end] into .parts/<idx>. Returns idx on success."""
    part_path = os.path.join(PARTS_DIR, f"{idx:04d}.part")
    expected = end - start + 1
    if os.path.exists(part_path) and os.path.getsize(part_path) == expected:
        return idx

    last_err: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            req = Request(URL, headers={"Range": f"bytes={start}-{end}"})
            with urlopen(req, timeout=180) as resp, open(part_path, "wb") as fh:
                while True:
                    buf = resp.read(1 << 20)
                    if not buf:
                        break
                    fh.write(buf)
            if os.path.getsize(part_path) != expected:
                raise OSError(
                    f"chunk {idx}: got {os.path.getsize(part_path)} bytes, "
                    f"expected {expected}"
                )
            return idx
        except Exception as exc:  # noqa: BLE001 - retry any transport error
            last_err = exc
            _log(f"  chunk {idx}: attempt {attempt}/{attempts} failed ({exc})")
            time.sleep(2 * attempt)
    raise RuntimeError(f"chunk {idx} failed after {attempts} attempts: {last_err}")


def sha256_of(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for block in iter(lambda: fh.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def download() -> str:
    os.makedirs(PARTS_DIR, exist_ok=True)

    if os.path.exists(ZIP_PATH) and sha256_of(ZIP_PATH) == SHA256:
        _log(f"Already downloaded and verified: {ZIP_PATH}")
        return ZIP_PATH

    chunk_size = math.ceil(TOTAL_SIZE / N_CHUNKS)
    ranges = [
        (i, i * chunk_size, min((i + 1) * chunk_size - 1, TOTAL_SIZE - 1))
        for i in range(N_CHUNKS)
    ]

    _log(f"Downloading {FILENAME} ({TOTAL_SIZE / 1048576:.1f} MB) "
         f"in {N_CHUNKS} parallel chunks...")
    done = 0
    with ThreadPoolExecutor(max_workers=N_CHUNKS) as pool:
        futures = [pool.submit(fetch_chunk, i, s, e) for i, s, e in ranges]
        for fut in as_completed(futures):
            fut.result()
            done += 1
            if done % 8 == 0 or done == N_CHUNKS:
                _log(f"  {done}/{N_CHUNKS} chunks done")

    # Assemble the parts in order.
    tmp_zip = ZIP_PATH + ".assembling"
    with open(tmp_zip, "wb") as out:
        for idx in range(N_CHUNKS):
            with open(os.path.join(PARTS_DIR, f"{idx:04d}.part"), "rb") as part:
                shutil.copyfileobj(part, out, length=1 << 20)
    got_size = os.path.getsize(tmp_zip)
    if got_size != TOTAL_SIZE:
        raise RuntimeError(f"assembled size {got_size} != expected {TOTAL_SIZE}")

    _log("Verifying SHA256...")
    digest = sha256_of(tmp_zip)
    if digest != SHA256:
        raise RuntimeError(f"SHA256 mismatch: {digest} != {SHA256}")
    os.replace(tmp_zip, ZIP_PATH)
    shutil.rmtree(PARTS_DIR, ignore_errors=True)
    _log("Checksum OK.")
    return ZIP_PATH


def extract(zip_path: str) -> str:
    if os.path.isdir(EXTRACT_DIR):
        _log(f"Already extracted: {EXTRACT_DIR}")
        return EXTRACT_DIR
    _log("Extracting (includes ~3,545 meal photos; this can take a minute)...")
    with zipfile.ZipFile(zip_path) as zf:
        zf.extractall(EXTRACT_DIR)
    _log(f"Extracted to {EXTRACT_DIR}")
    return EXTRACT_DIR


def main() -> int:
    os.makedirs(RAW_DIR, exist_ok=True)
    zip_path = download()
    extract(zip_path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
