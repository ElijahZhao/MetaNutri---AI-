# Security Policy

MetaNutri---AI- is a research and portfolio project. It is **not** a medical
device and ships no clinical functionality — see the disclaimer in the README.
Even so, security reports are taken seriously.

## Supported Versions

Only the latest commit on `main` is supported. There are no long-term-support
branches.

## Reporting a Vulnerability

Please report suspected vulnerabilities **privately** — do not open a public
issue.

- Preferred: GitHub [private vulnerability reporting](https://github.com/ElijahZhao/MetaNutri---AI-/security/advisories/new)
  (repository **Security** tab → *Report a vulnerability*).
- Alternatively, email **yulinzhao04@gmail.com**.

Please include the affected component (`frontend/` / `backend/` / `research/` /
the deployed demo), a description, reproduction steps, and the impact you see.

## What to Expect

- Acknowledgement within **7 days**.
- An assessment, and where warranted a fix, with credit in the commit message
  unless you ask to stay anonymous.
- We aim to ship a fix within **90 days** of a confirmed report.

## Scope

**In scope:** the platform (`frontend/`, `backend/`), the research module
(`research/`), and the deployed demo.
**Out of scope:** the upstream datasets themselves (CGMacros, BIG IDEAs — report
issues to their maintainers) and findings that require a compromised client or
physical access.
