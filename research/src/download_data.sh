#!/usr/bin/env bash
# Download, verify and extract the CGMacros dataset (CC BY-NC-SA 4.0).
#
# Thin wrapper around download_data.py, which uses parallel HTTP range requests
# because a single connection to the open S3 endpoint is throttled to
# ~150 KB/s (the full 627 MB would take ~1 hour).
#
# Provenance and license: see ../data/README.md
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "$HERE/download_data.py"
