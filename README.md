<div align="center">

<p align="right">
  <strong>English</strong> | <a href="README.zh-CN.md">简体中文</a>
</p>

![MetaNutri Banner](docs/assets/banner.jpg)

# 🧬 MetaNutri

**Precision Nutrition Metabolic Digital Twin Platform**

[![GitHub Stars](https://img.shields.io/github/stars/ElijahZhao/MetaNutri---AI-?style=for-the-badge&logo=github&color=10b981)](https://github.com/ElijahZhao/MetaNutri---AI-/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/ElijahZhao/MetaNutri---AI-?style=for-the-badge&logo=github&color=3b82f6)](https://github.com/ElijahZhao/MetaNutri---AI-/network/members)
[![License](https://img.shields.io/github/license/ElijahZhao/MetaNutri---AI-?style=for-the-badge&color=8b5cf6)](LICENSE)
[![CI](https://github.com/ElijahZhao/MetaNutri---AI-/actions/workflows/ci.yml/badge.svg)](https://github.com/ElijahZhao/MetaNutri---AI-/actions/workflows/ci.yml)
[![Issues](https://img.shields.io/github/issues/ElijahZhao/MetaNutri---AI-?style=for-the-badge&color=f59e0b)](https://github.com/ElijahZhao/MetaNutri---AI-/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-10b981?style=for-the-badge)](CONTRIBUTING.md)
[![Latest tag](https://img.shields.io/github/v/tag/ElijahZhao/MetaNutri---AI-?style=for-the-badge&color=10b981&label=v)](https://github.com/ElijahZhao/MetaNutri---AI-/tags)
[![Last commit](https://img.shields.io/github/last-commit/ElijahZhao/MetaNutri---AI-?style=for-the-badge&color=64748b)](https://github.com/ElijahZhao/MetaNutri---AI-/commits/main)

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)

**[🌐 Platform Live Demo](https://meta-nutri-ai.vercel.app/) · [🧪 PPGR Research Demo (real AI)](https://metanutri-ai-ppgr-predictor.streamlit.app/) · [📖 Documentation](docs/) · [🐛 Report Bug](https://github.com/ElijahZhao/MetaNutri---AI-/issues) · [✨ Request Feature](https://github.com/ElijahZhao/MetaNutri---AI-/issues)**

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://meta-nutri-ai.vercel.app/)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://metanutri-backend.onrender.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

**🔬 Real, data-trained ML in `research/` · 🧪 43 REST endpoints · 🍎 8 curated datasets · 🌐 Full EN / 中文 · 📄 16-page technical report**

</div>

---

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [📌 Project Status](#-project-status)
- [🔬 Research Highlights](#-research-highlights)
- [🧩 Related Repositories](#-related-repositories)
- [📸 Screenshots](#-screenshots)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [🔌 API & AI/ML](#-api--aiml)
- [🧪 Testing & CI](#-testing--ci)
- [☁️ Cloud Deployment](#️-cloud-deployment)
- [📁 Project Structure](#-project-structure)
- [⚠️ Limitations & Scope](#️-limitations--scope)
- [📚 Documentation](#-documentation)
- [❓ FAQ](#-faq)
- [📝 Changelog](#-changelog)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📮 Contact](#-contact)

---

## 🌟 About the Project

**MetaNutri** is a precision nutrition metabolic digital twin platform that integrates **genomics**, **microbiome**, and **metabolomics** data to deliver personalized nutritional recommendations and health management solutions.

This repository is primarily a **full-stack engineering project**: a production-style Next.js frontend, a FastAPI backend and a managed PostgreSQL database, wired end to end and deployed to Vercel / Render / Supabase. The live API serves **transparent, deterministic rule-based analytics**; the PyTorch model code under `research/prototypes/` is research scaffolding and is **not wired into the live API**. Real, data-trained models are developed in a separate research module.

### 📌 Project Status

> **This repository is an engineering demo with a separate research track.**
>
> - **What runs live:** authentication, database CRUD, food search, import/export — plus **deterministic, rule-based heuristics** for glucose, nutrient-absorption and risk estimates. All of them are illustrative only.
> - **Research scaffolding (not live):** the PyTorch model code in `research/prototypes/` is **not trained on real data** and is **never loaded at runtime**.
> - **Where the real AI is:** a self-contained research module — postprandial glucose-response prediction on **real open data**, with rigorous subject-wise evaluation — developed and deployed **independently** of this platform. See [docs/ROADMAP.md](docs/ROADMAP.md).
> - **Not a medical device.** Nothing here is medical advice; never use it to make clinical decisions.

### 🎯 Why MetaNutri?

| Problem | Solution |
|---------|----------|
| 🍎 Generic diet advice ignores individual biology | Personalized recommendations based on YOUR omics profile |
| 🧬 Genomics data is hard to interpret | AI translates complex data into actionable insights |
| 📊 Scattered health data across apps | Unified dashboard for genomics, microbiome, metabolomics |
| 🤖 "Black box" AI recommendations | Transparent rule-based scoring shows *which* factors drive each suggestion |
| ⚠️ Reactive healthcare | Early nutritional deficiency detection and risk alerts |

---

## 🔬 Research Highlights

The AI endpoints on the platform are deliberately honest heuristics (see [Limitations & Scope](#️-limitations--scope)). The **genuine machine learning** lives in the self-contained [`research/`](research/) module: a reproducible pipeline that predicts the **2-hour postprandial glucose response (PPGR)** on **real open data**, evaluated subject-wise so that no person is ever in both train and test.

| Stage | Headline result |
|-------|-----------------|
| **Reproduces the published baseline** — CGMacros, breakfast, leave-one-subject-out | **AUC r = 0.890 · iAUC r = 0.655** (paper ≈ 0.89 / ≈ 0.64) |
| **Extends it to every meal** — 1,557 meals, 45 subjects | **AUC r = 0.838 · iAUC r = 0.451** |
| **Transfers the frozen model to an independent cohort** — BIG IDEAs, 16 subjects, 656 meals, a different CGM device | **AUC r = 0.569** (partial; iAUC/peak-rise drop to ≈ 0.22 → domain shift) |
| **Goes beyond a point estimate** | Conformal prediction intervals · within/between-subject decomposition · subject-random-intercept mixed-effects model |

- **Method:** strict leave-one-subject-out cross-validation; XGBoost benchmarked against a mean predictor and two macronutrient-only Ridge baselines.
- **Artifacts:** [16-page technical report (PDF)](research/reports/technical_report.pdf) · [reproducible pipeline](research/src/) · [result CSVs](research/experiments/) · [figures](research/reports/figures/).
- **Live demo (runs the real trained model):** <https://metanutri-ai-ppgr-predictor.streamlit.app>
- **One-command reproduction:** `cd research && bash src/run_all.sh`

> Every number above is regenerated from [`research/experiments/*.csv`](research/experiments/) and must match the technical report.

**Figures (straight from the [technical report](research/reports/technical_report.pdf) pipeline):**

| Predictions vs actual | Model comparison |
|:---:|:---:|
| ![Predictions vs actual](research/reports/figures/fig1_pred_vs_actual.png) | ![Model comparison](research/reports/figures/fig2_model_comparison.png) |

| External validation (BIG IDEAs) | Conformal prediction intervals |
|:---:|:---:|
| ![External validation](research/reports/figures/fig5_external_validation.png) | ![Conformal prediction intervals](research/reports/figures/fig7_conformal.png) |

---

## 🧩 Related Repositories

This project spans **two independent GitHub repositories**. They are deliberately **not** linked by git — no submodule, no subtree, no `.gitmodules`. The coupling is by **provenance**, not by tooling.

| | **This repository** | **[`ppgr-predictor`](https://github.com/ElijahZhao/ppgr-predictor)** |
|---|---|---|
| **What it is** | The whole project: the full-stack platform (`backend/`, `frontend/`) **and** the research module (`research/`) | The **deployment** of the research module's demo — a self-contained Streamlit app |
| **Live** | <https://meta-nutri-ai.vercel.app> | <https://metanutri-ai-ppgr-predictor.streamlit.app> |
| **Size** | ~17 MB | ~690 KB |
| **Role** | Source of truth | Curated, read-only copy |

**Flow is one way: this repository → `ppgr-predictor`.** Nothing flows back. The demo repo holds a *curated subset* — `app.py`, `inference.py`, `model/*.json`, `assets/`, `src/`, `reports/`, `experiments/` — and imports nothing from the platform.

**The rule that keeps them consistent.** `research/` here is the source of truth. Every number in the demo repo (and in its README) is generated from `research/experiments/*.csv` and must match the [technical report](research/reports/technical_report.md). The demo repo is **never edited independently**; if the two ever disagree, this repository wins and the demo is regenerated.

**Why not link them as a submodule.** Streamlit Community Cloud builds the **repository root** of whichever repo you point it at and expects `app.py` + `requirements.txt` there. Pointing it at this repository would mean either dragging the whole platform into that build, or relying on a subdirectory entrypoint the free tier does not let you choose. A submodule would add a second checkout step and a new failure mode to that build without removing the need for the curated subset anyway. Different consumers, different runtimes, different size budgets — two repositories is the correct design.

**Do they interact at runtime? No.** There is no API call, no shared package and no data exchange between them. The demo is standalone: it loads exported JSON boosters and predicts locally.

> `ppgr-predictor`'s working copy can be kept locally at `.deploy/ppgr-predictor/` as an **untracked** mirror (see `.gitignore`). That mirror is a convenience for pushing; it is not part of this repository, and cloning this repository does not require it.

---

## 📸 Screenshots

| Landing page | Dashboard |
|:---:|:---:|
| ![Landing page](docs/assets/screenshots/01-landing.png) | ![Nutrition dashboard](docs/assets/screenshots/02-dashboard.png) |

| Dataset management | Sign in |
|:---:|:---:|
| ![Dataset management](docs/assets/screenshots/03-datasets.png) | ![Sign in page](docs/assets/screenshots/04-login.png) |

---

## ✨ Key Features

<div align="center">

| | Feature | Description |
|---|---------|-------------|
| 🧬 | **Tri-Omics Integration** | Genomics + Microbiome + Metabolomics data analysis in a unified pipeline |
| 🤖 | **Metabolic Analytics** | Deterministic, rule-based glucose and nutrient estimates — transparent by construction. PyTorch model code is research scaffolding and is not wired into the live API |
| 🔍 | **Transparent Scoring** | Every recommendation exposes its contributing factors (heuristic contribution weights, not SHAP) |
| 📊 | **Interactive Dashboards** | Health score, body-metrics and risk-radar cards backed by ECharts visualizations |
| 🚨 | **Health Alerts** | Real-time nutritional deficiency detection and health risk assessment |
| 🍎 | **Food & Nutrition Explorer** | Searchable food database with per-user food scoring |
| 🍽️ | **Rule-Based Meal Planning** | Personalized meal plans assembled from transparent, rule-based food scores |
| 📁 | **Dataset Browser** | Explore the curated reference datasets shipped with the platform |
| 📥 | **Import / Export** | Bring your own omics and food data in, and take your results out |
| 🔐 | **Session Security** | httpOnly-cookie sessions, bcrypt hashing and request rate limiting |
| 🌐 | **Bilingual UI** | Full English / Chinese interface on a lightweight custom i18n layer |
| 📱 | **Responsive Layout** | DNA / particle animations and layouts that adapt to desktop, tablet and mobile |

</div>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Users (Browser / Mobile)                      │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │  HTTPS
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Vercel (Frontend)                            │
│    Next.js 16 App Router — statically prerendered pages             │
│  ┌───────────────┐┌────────────────┐┌───────────────────────────┐   │
│  │ Static Pages  ││ Edge Middleware││ ECharts + custom i18n      │   │
│  │ (App Router)  ││  (proxy.ts)    ││ (charts, EN / ZH)          │   │
│  └───────────────┘└────────────────┘└───────────────────────────┘   │
│    rewrites  /api/*  →  same-origin proxy (keeps cookies 1st-party) │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │  HTTPS / REST
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Render (Backend)                            │
│                       FastAPI (Python 3.11)                         │
│  ┌────────┐┌────────┐┌────────┐┌────────┐┌──────────┐              │
│  │  Auth  ││ Users  ││ Foods  ││ Omics  ││ Predict  │              │
│  └────────┘└────────┘└────────┘└────────┘└──────────┘              │
│  ┌────────┐┌──────────┐┌────────┐┌──────────────┐                  │
│  │ Alerts ││ Datasets ││ Import ││ Analytics    │                  │
│  └────────┘└──────────┘└────────┘└──────────────┘                  │
│   SQLAlchemy 2.0 async ORM · rule-based · optional Redis cache      │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Supabase (Managed PostgreSQL)                     │
│   Stores user, profile, food, omics and dataset tables.             │
│   Auth is handled by the FastAPI API via httpOnly cookies;          │
│   Supabase Auth and Storage are NOT used.                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### 🎨 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16 | React framework with SSR & SEO |
| [React](https://react.dev/) | 19 | UI component library |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 3 | Utility-first CSS |
| [ECharts](https://echarts.apache.org/) | 6 | Data visualization |
| [TanStack Query](https://tanstack.com/query) | 5 | Server state & caching |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5 | Client state management |
| [React Hook Form](https://react-hook-form.com/) | 7 | Form validation |
| [Zod](https://zod.dev/) | 4 | Schema validation |
| Custom i18n | - | Lightweight EN/ZH translations (`src/lib/i18n.tsx`; no i18next dependency) |

### ⚙️ Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| [FastAPI](https://fastapi.tiangolo.com/) | 0.115 | High-performance async API |
| [Python](https://www.python.org/) | 3.11 | Runtime |
| [SQLAlchemy](https://www.sqlalchemy.org/) | 2.0 | Async ORM |
| [PostgreSQL](https://www.postgresql.org/) | - | Primary database |
| [Redis](https://redis.io/) | 5 | Caching & rate limiting (optional, in-memory fallback) |
| [Pydantic](https://docs.pydantic.dev/) | 2 | Data validation |
| [python-jose](https://github.com/mpdavis/python-jose) | 3.5 | JWT (issued into httpOnly cookies) |
| [Passlib](https://passlib.readthedocs.io/) | 1.7 | Password hashing (bcrypt) |

### 🧠 AI / ML

| Technology | Version | Purpose |
|------------|---------|---------|
| [PyTorch](https://pytorch.org/) | 2.x | Research scaffolding for model prototypes (not loaded by the live API) |
| [NumPy](https://numpy.org/) | 1.26 | Numerical computing (glucose-response curve) |
| [Pandas](https://pandas.pydata.org/) | 2.2 | Data processing (import / export) |
| [requests](https://docs.python-requests.org/) | 2.33 | HTTP client (bundled reference data is generated locally, not downloaded) |

### 🔬 Research (real ML — `research/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| [XGBoost](https://xgboost.readthedocs.io/) | 3.4 | Gradient-boosted PPGR model |
| [scikit-learn](https://scikit-learn.org/) | 1.9 | Baselines, metrics & preprocessing |
| [SciPy](https://scipy.org/) | 1.18 | Statistics |
| [statsmodels](https://www.statsmodels.org/) | 0.15 | Mixed-effects model |
| [NumPy](https://numpy.org/) | 2.5 | Numerical computing |
| [pandas](https://pandas.pydata.org/) | 3.0 | Tabular data |
| [Matplotlib](https://matplotlib.org/) | 3.11 | Report figures |
| [Streamlit](https://streamlit.io/) | 1.65 | Interactive PPGR demo |
| [WeasyPrint](https://weasyprint.org/) | 70 | Technical-report PDF |

---

## 🚀 Getting Started

### Prerequisites

- **Python** ≥ 3.11
- **Node.js** ≥ 20.19
- **npm** ≥ 9 or **pnpm** ≥ 8
- **PostgreSQL** ≥ 14 (or use [Supabase](https://supabase.com/) for cloud)

### 📦 Installation

```bash
# 1. Clone the repository
git clone https://github.com/ElijahZhao/MetaNutri---AI-.git
cd MetaNutri---AI-

# 2. Set up backend
cd backend
cp .env.example .env          # Edit with your credentials
pip install -r requirements.txt
cd ..

# 3. Set up frontend
cd frontend
cp .env.example .env.local     # Edit with your API URL
npm install
cd ..

# 4. Start services (use separate terminals)
cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
cd frontend && npm run dev
```

### 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js web app |
| Backend API | http://localhost:8000 | FastAPI server |
| API Docs (Swagger) | http://localhost:8000/docs | Interactive API documentation |
| API Docs (ReDoc) | http://localhost:8000/redoc | Alternative API docs |

### 🐳 Docker (Alternative)

```bash
# Start everything with one command
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 🔬 Research module

The research pipeline is **independent** of the platform — its own dependencies and its own deployment:

```bash
cd research
python -m venv .venv && source .venv/bin/activate   # requires Python ≥ 3.12
pip install -r requirements.txt
bash src/run_all.sh      # downloads CGMacros (~627 MB), builds the dataset, runs LOPO evaluation, writes experiments/ + reports/

# …or just launch the interactive demo (runs the frozen model — no training stack needed)
pip install -r app/requirements.txt
python -m streamlit run app/app.py
```

The CGMacros dataset is ~627 MB and is **never committed** (see [`research/data/README.md`](research/data/README.md)).

---

## 🔌 API & AI/ML

The full endpoint list lives in the [📘 API Reference](docs/API.md). The backend also exposes interactive docs at `<BASE>/docs` (Swagger) and `<BASE>/redoc`.

### Authentication (httpOnly cookies)

Tokens are delivered as httpOnly cookies at login; the frontend never has to attach an `Authorization` header manually:

```http
POST /api/auth/login          # {username, password}
Set-Cookie: metanutri_access=...; HttpOnly; SameSite=Lax
Set-Cookie: metanutri_refresh=...; HttpOnly; SameSite=Lax
```

### A complete AI call path

1. **Log in** to obtain a session — later requests carry the cookie automatically.
2. **Upload omics data**: `POST /api/genomic/upload`, `/api/microbiome/upload`, `/api/metabolomics/upload`.
3. **Run predictions**: `POST /api/predict/glucose-response` or `GET /api/predict/risk-assessment`.
4. **Get recommendations / meal plans**: `POST /api/recommendations/meal-plan`.
5. **Read the explanation**: prediction responses include a nutritional interpretation and `feature_contributions` — heuristic contribution weights, **not** SHAP values.

```bash
BASE=https://metanutri-backend.onrender.com

# Log in and persist the cookies
curl -c cookies.txt -X POST "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"username":"you","password":"secret123"}'

# Generate a meal plan (auth required)
curl -b cookies.txt -X POST "$BASE/api/recommendations/meal-plan" \
  -H 'Content-Type: application/json' \
  -d '{"calorie_target":2000}'
```

### AI/ML modules

Only the explainer stays wired into the live API under `backend/app/ml/`; the PyTorch prototypes were moved to the independent research module under `research/prototypes/`.

| Module | Capability |
|--------|------------|
| `research/prototypes/metabolic_response_model.py` | Research prototype: glucose response / nutrient absorption predictor (not wired to the live API) |
| `research/prototypes/gene_nutrition_model.py` | Research prototype: gene–nutrition association (GNN) |
| `research/prototypes/microbiome_vae.py` | Research prototype: microbiome health (VAE) |
| `backend/app/ml/explainability.py` | Deterministic proportional feature-contribution explainer — the same one the live API returns |
| `research/prototypes/train_models.py` | Prototype training scripts (train on synthetic tensors) |
| `research/prototypes/weights/` | Weights trained on synthetic data; never loaded at runtime |

---

## 🧪 Testing & CI

| Check | Tooling | Command |
|-------|---------|---------|
| Type safety | TypeScript (`tsc --noEmit`) | `npm run typecheck` |
| Lint | ESLint (flat config) | `npm run lint` |
| Unit / component tests | Vitest + Testing Library | `npm test` |
| End-to-end tests | Playwright (Chromium) | `npm run test:e2e` |
| Backend unit / API tests | pytest + httpx (`backend/tests/`) | `python -m pytest -q` |
| Backend syntax + import smoke test | `compileall` + FastAPI import | `python -m compileall -q app` |

Every push and pull request runs all of the above through [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## ☁️ Cloud Deployment

MetaNutri deploys on the following managed services:

| Component | Platform | Guide |
|-----------|----------|-------|
| 🗄️ Database | [Supabase](https://supabase.com/) | Managed PostgreSQL |
| ⚙️ Backend API | [Render](https://render.com/) | Python deployment from GitHub |
| 🎨 Frontend Web | [Vercel](https://vercel.com/) | Next.js native platform |

### Step 1: Supabase (Database)

1. Create a project at [supabase.com](https://supabase.com/)
2. Go to **SQL Editor** → New query
3. Run the SQL from [`backend/schema.sql`](backend/schema.sql)
4. Copy your connection string from **Settings → Database → Connection string (URI)**

### Step 2: Render (Backend)

1. Create a new **Web Service** at [render.com](https://render.com/) → **Build & Deploy from a Repository** → select your repo
2. In **Settings → Docker**, set the **Dockerfile Path** to `backend/Dockerfile`
3. In **Environment**, add:
   - `DATABASE_URL` = your Supabase **connection pooler** URI (port **5432 session mode** — Render has no IPv6, so use `*.pooler.supabase.com`, not the IPv6-only direct host)
   - `SECRET_KEY` = a secure random string
4. Deploy → copy your `https://your-service.onrender.com` domain

### Step 3: Vercel (Frontend)

1. Import project from GitHub → select your repo
2. **Root Directory**: `frontend`
3. **Framework Preset**: Next.js (auto-detected)
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL (e.g. `https://your-service.onrender.com`)
5. Click **Deploy**

---

## 📁 Project Structure

```
MetaNutri---AI-/
├── backend/                          # ⚙️ FastAPI backend
│   ├── app/
│   │   ├── api/                      # API route handlers
│   │   │   ├── auth.py               # Authentication (register / login / refresh)
│   │   │   ├── users.py              # User profile management
│   │   │   ├── food.py               # Food search, logging & nutrition
│   │   │   ├── genomic.py            # Genomics data analysis
│   │   │   ├── microbiome.py         # Microbiome analysis
│   │   │   ├── metabolomics.py       # Metabolomics data
│   │   │   ├── predict.py            # AI prediction endpoints
│   │   │   ├── recommendation.py     # Nutrition recommendations & meal plans
│   │   │   ├── datasets.py           # Dataset management
│   │   │   ├── import_export.py      # Data import / export
│   │   │   └── nutrition_alerts.py   # Health alert system
│   │   ├── core/                     # Core infrastructure
│   │   │   ├── config.py             # Settings & env vars
│   │   │   ├── security.py           # JWT + httpOnly cookie auth, password hashing
│   │   │   ├── rate_limit.py         # In-memory rate limiter
│   │   │   └── redis.py              # Redis cache (graceful fallback)
│   │   ├── db/
│   │   │   └── session.py            # SQLAlchemy async engine
│   │   ├── ml/                       # 🧠 ML-adjacent backend code
│   │   │   ├── explainability.py             # Deterministic feature-contribution explainer (used by the live API)
│   │   │   └── dataset_downloader.py         # Generates bundled sample data (no network fetch)
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   ├── schemas/                  # Pydantic request / response schemas
│   │   ├── services/                 # Business logic (seed data, import / export)
│   │   └── main.py                   # FastAPI application entry
│   ├── data/                         # Seed & reference datasets (JSON)
│   ├── schema.sql                    # PostgreSQL table definitions
│   ├── requirements.txt              # Python dependencies
│   ├── Dockerfile                    # Production container
│   └── .env.example                  # Environment template
│
├── frontend/                         # 🎨 Next.js frontend
│   ├── src/
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── (auth)/               # Public auth group
│   │   │   │   ├── login/            # Sign in
│   │   │   │   └── forgot-password/  # Password recovery
│   │   │   ├── (app)/                # Protected group (auth guarded)
│   │   │   │   ├── dashboard/        # Analytics & health score
│   │   │   │   ├── profile/          # User profile
│   │   │   │   ├── genomic/          # Genomics analysis
│   │   │   │   ├── microbiome/       # Microbiome analysis
│   │   │   │   ├── metabolomics/     # Metabolomics data
│   │   │   │   ├── predict/          # AI prediction tools
│   │   │   │   ├── recommendations/  # Personalized advice
│   │   │   │   ├── meal-plan/        # AI meal planner
│   │   │   │   ├── explore/          # Food exploration
│   │   │   │   └── datasets/         # Dataset browser
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── content.tsx           # Landing page content
│   │   │   ├── layout.tsx            # Root layout (metadata, i18n)
│   │   │   ├── loading.tsx           # Route loading UI
│   │   │   ├── error.tsx             # Global error boundary
│   │   │   ├── not-found.tsx         # Custom 404 page
│   │   │   ├── icon.svg              # Favicon
│   │   │   ├── opengraph-image.tsx   # Dynamic Open Graph image
│   │   │   ├── twitter-image.tsx     # Dynamic Twitter card
│   │   │   ├── robots.ts             # robots.txt
│   │   │   └── sitemap.ts            # sitemap.xml
│   │   ├── components/               # Reusable UI components
│   │   │   ├── home/                 # Landing sections (hero, features, CTA)
│   │   │   ├── dashboard/            # Dashboard widgets & cards
│   │   │   ├── Navbar.tsx            # Navigation bar
│   │   │   ├── ProtectedRoute.tsx    # Auth route guard
│   │   │   ├── ErrorBoundary.tsx     # React error boundary
│   │   │   ├── Skeleton.tsx          # Loading skeletons
│   │   │   ├── MetabolicPathway.tsx  # Interactive pathway viewer
│   │   │   ├── NutritionAlerts.tsx   # Health alert toasts
│   │   │   ├── BioCanvas.tsx         # Animated DNA background
│   │   │   ├── BioBackground.tsx     # Bio-themed page background
│   │   │   ├── ParticleBackground.tsx# Particle field animation
│   │   │   ├── ScrollReveal.tsx      # Scroll-triggered reveal
│   │   │   ├── SpotlightTitle.tsx    # Animated hero title
│   │   │   └── TypeWriter.tsx        # Typewriter text effect
│   │   ├── constants/                # Shared constants (profile options, BMI)
│   │   ├── lib/                      # Utilities & services
│   │   │   ├── api.ts                # Axios client (same-origin, cookie auth)
│   │   │   ├── backendWarmup.ts      # Cold-start warm-up helper
│   │   │   ├── hooks.ts              # Custom React hooks
│   │   │   ├── i18n.tsx              # Internationalization (EN / ZH)
│   │   │   └── store/authStore.ts    # Zustand auth state
│   │   ├── types/                    # Shared TypeScript types
│   │   └── proxy.ts                  # Next.js edge auth guard
│   ├── tests/e2e/                    # Playwright end-to-end specs
│   ├── scripts/start-standalone.mjs  # Standalone server launcher
│   ├── public/                       # Static assets
│   ├── next.config.ts                # Next.js config (same-origin /api rewrites)
│   ├── tailwind.config.js            # Tailwind theme
│   ├── vercel.json                   # Vercel deployment config
│   ├── eslint.config.mjs             # ESLint flat config
│   ├── vitest.config.mjs             # Vitest config
│   ├── playwright.config.ts          # E2E test config
│   ├── Dockerfile / Dockerfile.dev   # Production / dev containers
│   └── package.json                  # Dependencies & scripts

├── research/                         # 🔬 Research module (the real ML; independent)
│   ├── src/                          # Reproducible pipeline (download → build → LOPO → figures)
│   ├── app/                          # Streamlit PPGR demo (runs the frozen model)
│   ├── experiments/                  # Result CSVs, regenerated by the pipeline
│   ├── reports/                      # Technical report (MD + 16-page PDF) & figures
│   ├── data/                         # Placeholder — raw datasets are never committed
│   ├── prototypes/                   # PyTorch model prototypes + synthetic weights (unused)
│   ├── requirements.txt / -dev.txt   # Pinned research dependencies
│   └── README.md
│
├── docs/                             # 📚 Documentation & assets
│   ├── assets/                       # Banner & screenshots
│   ├── API.md                        # API reference
│   ├── DEPLOYMENT.md                 # Deployment guide
│   ├── DATASETS.md                   # Dataset references
│   ├── ARCHITECTURE.md               # Architecture & design decisions
│   ├── ROADMAP.md                    # Research roadmap
│   ├── PROJECT-NOTES.md              # Project self-narrative (why it's split in two)
│   └── AUDITS.md                     # Audit & remediation log
│
├── .github/                          # GitHub config
│   └── workflows/                    # CI & keep-alive workflows
│
├── docker-compose.yml                # Local orchestration
├── start.sh                          # One-click startup script
├── CONTRIBUTING.md                   # Contribution guidelines
├── SECURITY.md                       # Security policy
├── CITATION.cff                      # How to cite this project
├── LICENSE                           # MIT License
└── README.md                         # 👈 You are here
```

---

## ⚠️ Limitations & Scope

This project is built for **demonstration and portfolio purposes**. In the interest of honesty, here is what it is and isn't:

- **Bundled datasets are curated samples, not full third-party dumps.** The files under `backend/data/` are small, hand-prepared reference sets. The dataset "download" endpoints simply (re)generate these local sample files — they do **not** fetch from USDA / KEGG / HMP. The TianChi client returns **mock placeholder listings**.
- **Predictions are heuristics, not clinical models.** Glucose, nutrient-absorption and risk outputs come from deterministic rules. They are **illustrative only** and must **not** be used for medical decisions.
- **Model weights are unused.** The `.pt` files under `research/prototypes/weights/` were trained on synthetic random tensors and are never loaded by the running API.
- **The real AI lives elsewhere.** Serious, data-trained models are developed in a separate research module on real open datasets — see [docs/ROADMAP.md](docs/ROADMAP.md).

**Development note.** AI coding tools were used as assistants during implementation — chiefly for scaffolding, refactoring and documentation. The architecture, product decisions and final review are the author's own, and AI-generated output was reviewed and adapted before being merged rather than accepted as-is.

**Repository history.** The project was developed locally first and published to GitHub in a handful of batched syncs, so the commits are clustered into a few active stretches rather than spread out evenly.

---

## 📚 Documentation

The API reference and roadmap are linked above; the rest of `docs/`:

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — services, data flow and the same-origin proxy setup
- [DATASETS.md](docs/DATASETS.md) — the curated reference datasets and their provenance
- [AUDITS.md](docs/AUDITS.md) — the audit and fix ledger
- [PROJECT-NOTES.md](docs/PROJECT-NOTES.md) — why this repository is split into two halves

---

## ❓ FAQ

<details>
<summary><strong>Is any of this a medical device?</strong></summary>

No. Everything here is for demonstration and portfolio purposes, and none of it is medical advice. See [Limitations & Scope](#️-limitations--scope).
</details>

<details>
<summary><strong>Do the live API endpoints return trained-model predictions?</strong></summary>

No. The glucose, nutrient-absorption and risk outputs are deterministic, rule-based heuristics and are illustrative only. The `feature_contributions` field is a transparent proportional decomposition, not SHAP.
</details>

<details>
<summary><strong>Where is the real machine learning?</strong></summary>

In the independent [`research/`](research/) module — a reproducible PPGR pipeline trained on real open data and evaluated subject-wise. See [Research Highlights](#-research-highlights) and [docs/ROADMAP.md](docs/ROADMAP.md).
</details>

<details>
<summary><strong>Why are there two repositories?</strong></summary>

Different consumers, different runtimes. This repository is the source of truth (platform + research); `ppgr-predictor` is a curated, read-only Streamlit deployment of the research demo. See [Related Repositories](#-related-repositories).
</details>

---

## 📝 Changelog

Release notes are maintained in [`CHANGELOG.md`](CHANGELOG.md).

---

## 🤝 Contributing

Bug reports, documentation fixes and code contributions are all welcome.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/short-description`)
3. Commit your Changes (`git commit -m 'feat: describe your change'`)
4. Push to the Branch (`git push origin feature/short-description`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the process for submitting pull requests.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

If you use this work, please cite it — see [`CITATION.cff`](CITATION.cff).

---

## 📮 Contact

**ElijahZhao** - [@ElijahZhao](https://github.com/ElijahZhao) - yulinzhao04@gmail.com · 550568658@qq.com

Project Link: [https://github.com/ElijahZhao/MetaNutri---AI-](https://github.com/ElijahZhao/MetaNutri---AI-)

---

<div align="center">

**MetaNutri** — Precision Nutrition Metabolic Digital Twin

</div>
