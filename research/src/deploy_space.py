#!/usr/bin/env python3
"""Publish ``research/app/`` to a Hugging Face Space (Streamlit SDK).

Credentials are read from the ``HF_TOKEN`` environment variable and are never
written to disk or printed.

Usage::

    HF_TOKEN=hf_xxx python deploy_space.py <hf-username>/<space-name> [--private]

The Space repo is created if it does not exist, then the contents of
``research/app/`` are uploaded (model weights included, caches excluded).
"""

from __future__ import annotations

import argparse
import os
import sys

from huggingface_hub import HfApi

APP_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "app"))
IGNORE = ["__pycache__/*", "*.pyc", ".ipynb_checkpoints/*", ".DS_Store"]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("repo_id", help="e.g. yourname/ppgr-predictor")
    parser.add_argument("--private", action="store_true", help="create a private Space")
    args = parser.parse_args()

    token = os.environ.get("HF_TOKEN")
    if not token:
        sys.exit("HF_TOKEN is not set. Export a write token and retry.")

    api = HfApi(token=token)
    user = api.whoami()["name"]
    if "/" not in args.repo_id:
        args.repo_id = f"{user}/{args.repo_id}"

    url = api.create_repo(
        repo_id=args.repo_id,
        repo_type="space",
        space_sdk="streamlit",
        private=args.private,
        exist_ok=True,
    )
    print(f"Space ready: {url}")

    api.upload_folder(
        repo_id=args.repo_id,
        repo_type="space",
        folder_path=APP_DIR,
        ignore_patterns=IGNORE,
        commit_message="Deploy PPGR Streamlit demo",
    )
    print(f"Uploaded {APP_DIR}")
    print(f"Live at: https://huggingface.co/spaces/{args.repo_id}")


if __name__ == "__main__":
    main()
