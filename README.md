<div align="center">

<p align="right">
  <strong>English</strong> | <a href="README.zh-CN.md">简体中文</a>
</p>

![MetaNutri Banner](docs/assets/banner.jpg)

# 🧬 MetaNutri

**AI-Powered Precision Nutrition Metabolic Digital Twin Platform**

[![GitHub Stars](https://img.shields.io/github/stars/ElijahZhao/MetaNutri---AI-?style=for-the-badge&logo=github&color=10b981)](https://github.com/ElijahZhao/MetaNutri---AI-/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/ElijahZhao/MetaNutri---AI-?style=for-the-badge&logo=github&color=3b82f6)](https://github.com/ElijahZhao/MetaNutri---AI-/network/members)
[![License](https://img.shields.io/github/license/ElijahZhao/MetaNutri---AI-?style=for-the-badge&color=8b5cf6)](LICENSE)
[![Issues](https://img.shields.io/github/issues/ElijahZhao/MetaNutri---AI-?style=for-the-badge&color=f59e0b)](https://github.com/ElijahZhao/MetaNutri---AI-/issues)

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)

**[🌐 Live Demo](https://meta-nutri-ai.vercel.app/) · [📖 Documentation](docs/) · [🐛 Report Bug](https://github.com/ElijahZhao/MetaNutri---AI-/issues) · [✨ Request Feature](https://github.com/ElijahZhao/MetaNutri---AI-/issues)**

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://meta-nutri-ai.vercel.app/)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://metanutri-backend.onrender.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [☁️ Cloud Deployment](#️-cloud-deployment)
- [📁 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📮 Contact](#-contact)

---

## 🌟 About the Project

**MetaNutri** is an AI-powered precision nutrition metabolic digital twin platform that integrates **genomics**, **microbiome**, and **metabolomics** data to deliver personalized nutritional recommendations and health management solutions.

By leveraging advanced deep learning architectures (**Transformers**, **GNNs**, **VAEs**) and SHAP/LIME explainability, MetaNutri bridges the gap between multi-omics research and practical dietary guidance.

### 🎯 Why MetaNutri?

| Problem | Solution |
|---------|----------|
| 🍎 Generic diet advice ignores individual biology | Personalized recommendations based on YOUR omics profile |
| 🧬 Genomics data is hard to interpret | AI translates complex data into actionable insights |
| 📊 Scattered health data across apps | Unified dashboard for genomics, microbiome, metabolomics |
| 🤖 "Black box" AI recommendations | SHAP/LIME explainability shows *why* each suggestion |
| ⚠️ Reactive healthcare | Early nutritional deficiency detection and risk alerts |

---

## ✨ Key Features

<div align="center">

| | Feature | Description |
|---|---------|-------------|
| 🧬 | **Tri-Omics Integration** | Genomics + Microbiome + Metabolomics data analysis in a unified pipeline |
| 🤖 | **Deep Learning Models** | PyTorch model code for metabolic response, gene-nutrition (GNN) and microbiome (VAE) — research code; the live API currently serves deterministic heuristics |
| 🔍 | **Explainable AI** | SHAP and LIME feature importance for every recommendation |
| 🚨 | **Health Alerts** | Real-time nutritional deficiency detection and health risk assessment |
| 📊 | **Interactive Visualization** | Metabolic pathway maps, ECharts dashboards, and radar charts |
| 👤 | **User Profiles** | Personal health metrics and dietary goals |
| 🍽️ | **Meal Planning** | AI-generated personalized meal plans based on your biology |
| 🌐 | **i18n Support** | Full English / Chinese bilingual interface |
| 📱 | **Responsive Design** | Works beautifully on desktop, tablet, and mobile |

</div>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                              Users                                    │
│                         (Browser / Mobile)                           │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           Vercel (Frontend)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ Next.js  │ │  React   │ │  ECharts │ │ i18n     │              │
│  │  (SSR)   │ │  (UI)    │ │ (Charts) │ │ (l10n)   │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │  HTTPS / REST API
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Render (Backend)                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                        FastAPI (Python)                       │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │    │
│  │  │  Auth   │ │  Users  │ │  Foods  │ │  Omics  │          │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │    │
│  │  │  Predict│ │  Alerts │ │  Datasets│ │ Import  │          │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  PyTorch     │  │  SQLAlchemy  │  │  Redis (opt) │             │
│  │  (ML Models) │  │   (ORM)      │  │   (Cache)    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Supabase (PostgreSQL Database)                    │
│  Stores user, omics and dataset tables.                             │
│  Auth is handled by the FastAPI API via httpOnly cookies;           │
│  Supabase Auth and Storage are NOT used.                            │
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
| [PyTorch](https://pytorch.org/) | 2.x | Deep learning framework |
| [scipy](https://scipy.org/) | 1.14 | Scientific / statistical computing |
| [SHAP](https://shap.readthedocs.io/) | 0.46 | Model explainability |
| [NumPy](https://numpy.org/) | 1.26 | Numerical computing |
| [Pandas](https://pandas.pydata.org/) | 2.2 | Data processing |
| [scikit-learn](https://scikit-learn.org/) | 1.5 | Feature scaling & baseline models (SHAP explainability) |
| [requests](https://docs.python-requests.org/) | 2.32 | HTTP client (reference data is generated locally, not downloaded) |

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

---

## 🔌 API & AI/ML 实战

完整的接口清单见 [📘 API 参考](docs/API.md)。后端交互式文档在 `<BASE>/docs`（Swagger）与 `<BASE>/redoc`。

### 认证（httpOnly Cookie）

登录后令牌通过 httpOnly Cookie 下发，前端无需手动附加 `Authorization` 头：

```http
POST /api/auth/login          # {username, password}
Set-Cookie: metanutri_access=...; HttpOnly; SameSite=Lax
Set-Cookie: metanutri_refresh=...; HttpOnly; SameSite=Lax
```

### 一条完整的 AI 调用链路

1. **登录**获取会话 → 之后请求自动带 Cookie。
2. **上传组学数据**：`POST /api/genomic/upload`、`/api/microbiome/upload`、`/api/metabolomics/upload`。
3. **跑预测**：`POST /api/predict/glucose-response` 或 `GET /api/predict/risk-assessment`。
4. **拿推荐/饮食计划**：`POST /api/recommendations/meal-plan`。
5. **获取个性化解释**：预测返回里含营养解读与 `feature_contributions`（SHAP）。

```bash
BASE=https://metanutri-backend.onrender.com

# 登录并保存 Cookie
curl -c cookies.txt -X POST "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"username":"you","password":"secret123"}'

# 生成饮食计划（需登录）
curl -b cookies.txt -X POST "$BASE/api/recommendations/meal-plan" \
  -H 'Content-Type: application/json' \
  -d '{"calorie_target":2000}'
```

### AI/ML 模块（后端）

| 模块 | 能力 |
|------|------|
| `ml/metabolic_response_model.py` | 血糖响应 / 营养吸收预测器 |
| `ml/gene_nutrition_model.py` | 基因-营养关联（GNN） |
| `ml/microbiome_vae.py` | 微生物组健康（VAE） |
| `ml/explainability.py` | SHAP + 自定义 LIME 可解释性 |
| `ml/train_models.py` | 模型训练脚本 |
| `ml/weights/` | 预训练权重 |

---

## ☁️ Cloud Deployment

MetaNutri is designed for seamless cloud deployment with the following stack:

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
│   │   │   ├── auth.py               # Authentication (register/login)
│   │   │   ├── users.py              # User profile management
│   │   │   ├── food.py               # Food logs & nutrition
│   │   │   ├── genomic.py            # Genomics data analysis
│   │   │   ├── microbiome.py         # Microbiome analysis
│   │   │   ├── metabolomics.py       # Metabolomics data
│   │   │   ├── predict.py            # AI prediction endpoints
│   │   │   ├── recommendation.py     # Nutrition recommendations
│   │   │   ├── datasets.py           # Dataset management
│   │   │   ├── import_export.py      # Data import/export
│   │   │   └── nutrition_alerts.py   # Health alert system
│   │   ├── core/                     # Core infrastructure
│   │   │   ├── config.py             # Settings & env vars
│   │   │   ├── security.py           # JWT + httpOnly cookie auth, password hashing
│   │   │   ├── rate_limit.py         # In-memory rate limiter
│   │   │   └── redis.py              # Redis cache (graceful fallback)
│   │   ├── db/                       # Database layer
│   │   │   └── session.py            # SQLAlchemy async engine
│   │   ├── ml/                       # 🧠 Machine learning models
│   │   │   ├── metabolic_response_model.py   # Transformer predictor
│   │   │   ├── gene_nutrition_model.py       # GNN gene-nutrition
│   │   │   ├── microbiome_vae.py             # VAE microbiome health
│   │   │   ├── explainability.py              # SHAP/LIME explainer
│   │   │   ├── dataset_downloader.py           # Public dataset fetcher
│   │   │   ├── train_models.py                 # Training scripts
│   │   │   └── weights/                        # Pre-trained model weights
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── services/                 # Business logic layer
│   │   └── main.py                   # FastAPI application entry
│   ├── data/                         # Seed & reference data
│   ├── schema.sql                    # PostgreSQL table definitions
│   ├── requirements.txt              # Python dependencies
│   ├── Dockerfile                    # Production container
│   └── .env.example                  # Environment template
│
├── frontend/                         # 🎨 Next.js frontend
│   ├── src/
│   │   ├── app/                      # Next.js App Router pages (TSX)
│   │   │   ├── (auth)                # Public auth group
│   │   │   │   ├── login/            # Sign in
│   │   │   │   └── forgot-password/  # Password recovery
│   │   │   ├── (app)                 # Protected app group (auth guarded)
│   │   │   │   ├── dashboard/        # Analytics dashboard
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
│   │   │   ├── layout.tsx            # Root layout (metadata, i18n)
│   │   │   ├── error.tsx             # Global error boundary
│   │   │   └── not-found.tsx         # Custom 404 page
│   │   ├── components/               # Reusable UI components
│   │   │   ├── home/                 # Landing page sections
│   │   │   ├── dashboard/            # Dashboard widgets & cards
│   │   │   ├── Navbar.tsx            # Navigation bar
│   │   │   ├── ProtectedRoute.tsx    # Auth route guard
│   │   │   ├── ErrorBoundary.tsx     # React error boundary
│   │   │   ├── Skeleton.tsx          # Loading skeletons
│   │   │   ├── BioCanvas.tsx         # Animated DNA background
│   │   │   └── MetabolicPathway.tsx  # Interactive pathway viewer
│   │   ├── lib/                      # Utilities & services
│   │   │   ├── api.ts                # Axios client (same-origin, cookie auth)
│   │   │   ├── i18n.tsx              # Internationalization (EN/ZH)
│   │   │   ├── hooks.ts              # Custom React hooks
│   │   │   └── store/
│   │   │       └── authStore.ts      # Zustand auth state
│   │   └── proxy.ts                  # Next.js 16 edge auth guard
│   ├── public/                       # Static assets
│   ├── next.config.ts                # Next.js config
│   ├── tailwind.config.js            # Tailwind theme
│   ├── vercel.json                   # Vercel deployment config
│   ├── eslint.config.mjs             # ESLint flat config
│   ├── vitest.config.mjs             # Vitest config
│   ├── playwright.config.ts          # E2E test config
│   ├── .prettierrc                   # Prettier formatting
│   ├── package.json                  # Dependencies
│   └── Dockerfile                    # Production container
│
├── docs/                             # 📚 Documentation & assets
│   ├── assets/                       # Images & diagrams
│   ├── API.md                        # API reference
│   ├── DEPLOYMENT.md                 # Deployment guide
│   └── DATASETS.md                   # Dataset references
│
├── .github/                          # GitHub config
│   ├── ISSUE_TEMPLATE/               # Bug & feature templates
│   └── PULL_REQUEST_TEMPLATE/        # PR template
│
├── docker-compose.yml                # Local orchestration
├── start.sh                          # One-click startup script
├── CONTRIBUTING.md                   # Contribution guidelines
├── CODE_OF_CONDUCT.md                # Community code of conduct
├── LICENSE                           # MIT License
└── README.md                         # 👈 You are here
```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## 📮 Contact

**ElijahZhao** - [@ElijahZhao](https://github.com/ElijahZhao) - elijahzhao@gmail.com

Project Link: [https://github.com/ElijahZhao/MetaNutri---AI-](https://github.com/ElijahZhao/MetaNutri---AI-)

---

<div align="center">

Made with ❤️ by **ElijahZhao**

**MetaNutri** — AI-Powered Precision Nutrition Metabolic Digital Twin

[⬆ Back to Top](#-metanutri)

</div>
