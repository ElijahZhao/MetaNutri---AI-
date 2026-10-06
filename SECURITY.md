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

## Hardening Notes

- **Password reset.** `/api/auth/forgot-password` returns an identical response
  whether or not the email is registered, and does **not** include the reset
  token unless `PASSWORD_RESET_RETURN_TOKEN` is explicitly enabled — a
  local-development convenience that must never be set in production. In
  production the token has to be delivered out of band (email); knowing an email
  address alone cannot reset an account.
- **CSRF.** Auth cookies are `SameSite=Lax` and the frontend proxies `/api` on
  its own origin, so cross-site writes do not carry credentials. The backend
  refuses to start with `COOKIE_SAMESITE=none` unless
  `ALLOW_INSECURE_SAMESITE_NONE=1` is set, because the project has no CSRF token
  or Origin/Referer check as a fallback (see `docs/AUDITS.md` §3).

## Scope

**In scope:** the platform (`frontend/`, `backend/`), the research module
(`research/`), and the deployed demo.
**Out of scope:** the upstream datasets themselves (CGMacros, BIG IDEAs — report
issues to their maintainers) and findings that require a compromised client or
physical access.
