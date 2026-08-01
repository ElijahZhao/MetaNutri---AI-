<div align="center">

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
[![Railway](https://img.shields.io/badge/Railway-Deployed-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://metanutri-ai-production.up.railway.app/)
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
| 🤖 | **Deep Learning Models** | Transformer, GNN, and VAE architectures for metabolic response prediction |
| 🔍 | **Explainable AI** | SHAP and LIME feature importance for every recommendation |
| 🚨 | **Health Alerts** | Real-time nutritional deficiency detection and health risk assessment |
| 📊 | **Interactive Visualization** | Metabolic pathway maps, ECharts dashboards, and radar charts |
| 👤 | **User Profiles** | Personal health metrics, goals, and RBAC permission system |
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
│                          Railway (Backend)                            │
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
│                        Supabase (Database)                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL      │  │  Authentication   │  │  Storage         │  │
│  │  (User + Omics)  │  │  (JWT + OAuth)   │  │  (Datasets)      │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
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
| [ECharts](https://echarts.apache.org/) | 5 | Data visualization |
| [TanStack Query](https://tanstack.com/query) | 5 | Server state & caching |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5 | Client state management |
| [React Hook Form](https://react-hook-form.com/) | 7 | Form validation |
| [Zod](https://zod.dev/) | 4 | Schema validation |
| [i18next](https://www.i18next.com/) | - | Internationalization |

### ⚙️ Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| [FastAPI](https://fastapi.tiangolo.com/) | 0.115 | High-performance async API |
| [Python](https://www.python.org/) | 3.11 | Runtime |
| [SQLAlchemy](https://www.sqlalchemy.org/) | 2.0 | Async ORM |
| [PostgreSQL](https://www.postgresql.org/) | - | Primary database |
| [Redis](https://redis.io/) | 7 | Caching (optional) |
| [Pydantic](https://docs.pydantic.dev/) | 2 | Data validation |
| [JWT](https://jwt.io/) | - | Authentication |
| [Passlib](https://passlib.readthedocs.io/) | - | Password hashing |

### 🧠 AI / ML

| Technology | Version | Purpose |
|------------|---------|---------|
| [PyTorch](https://pytorch.org/) | 2.x | Deep learning framework |
| [scikit-learn](https://scikit-learn.org/) | 1.5 | Classical ML |
| [SHAP](https://shap.readthedocs.io/) | 0.46 | Model explainability |
| [NumPy](https://numpy.org/) | 1.26 | Numerical computing |
| [Pandas](https://pandas.pydata.org/) | 2.2 | Data processing |
| [BioPython](https://biopython.org/) | 1.84 | Bioinformatics |

---

## 🚀 Getting Started

### Prerequisites

- **Python** ≥ 3.11
- **Node.js** ≥ 18
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

## ☁️ Cloud Deployment

MetaNutri is designed for seamless cloud deployment with the following stack:

| Component | Platform | Guide |
|-----------|----------|-------|
| 🗄️ Database | [Supabase](https://supabase.com/) | PostgreSQL + Auth in one |
| ⚙️ Backend API | [Railway](https://railway.app/) | One-click Python deployment |
| 🎨 Frontend Web | [Vercel](https://vercel.com/) | Next.js native platform |

### Step 1: Supabase (Database)

1. Create a project at [supabase.com](https://supabase.com/)
2. Go to **SQL Editor** → New query
3. Run the SQL from [`backend/schema.sql`](backend/schema.sql)
4. Copy your connection string from **Settings → Database → Connection string (URI)**

### Step 2: Railway (Backend)

1. Create a new project → Deploy from GitHub → select your repo
2. **Settings → Build**:
   - Dockerfile Path: `backend/Dockerfile`
3. **Variables → Add**:
   - `DATABASE_URL` = your Supabase PostgreSQL connection string
   - `SECRET_KEY` = a secure random string
4. **Settings → Networking → Enable Outbound IPv6** (required for Supabase)
5. Wait for deployment → copy your `.up.railway.app` domain

### Step 3: Vercel (Frontend)

1. Import project from GitHub → select your repo
2. **Root Directory**: `frontend`
3. **Framework Preset**: Next.js (auto-detected)
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL (e.g. `https://xxx.up.railway.app`)
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
│   │   │   ├── security.py           # JWT auth & password hashing
│   │   │   └── redis.py              # Redis cache (graceful fallback)
│   │   ├── db/                       # Database layer
│   │   │   └── session.py            # SQLAlchemy async engine
│   │   ├── ml/                       # 🧠 Machine learning models
│   │   │   ├── metabolic_response_model.py   # Transformer predictor
│   │   │   ├── gene_nutrition_model.py       # GNN gene-nutrition
│   │   │   ├── microbiome_vae.py             # VAE microbiome health
│   │   │   ├── explainability.py              # SHAP/LIME explainer
│   │   │   ├── microbiome_analysis.py         # Diversity analysis
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
│   ├── railway.json                  # Railway deployment config
│   └── .env.example                  # Environment template
│
├── frontend/                         # 🎨 Next.js frontend
│   ├── src/
│   │   ├── app/                      # Next.js App Router pages
│   │   │   ├── page.js               # Landing page
│   │   │   ├── dashboard/            # Analytics dashboard
│   │   │   ├── login/                # Sign in
│   │   │   ├── forgot-password/      # Password recovery
│   │   │   ├── profile/              # User profile
│   │   │   ├── genomic/              # Genomics analysis
│   │   │   ├── microbiome/           # Microbiome analysis
│   │   │   ├── metabolomics/         # Metabolomics data
│   │   │   ├── predict/              # AI prediction tools
│   │   │   ├── recommendations/      # Personalized advice
│   │   │   ├── meal-plan/            # AI meal planner
│   │   │   ├── explore/              # Food exploration
│   │   │   ├── datasets/             # Dataset browser
│   │   │   ├── error.js              # Global error boundary
│   │   │   ├── not-found.js          # Custom 404 page
│   │   │   └── layout.js             # Root layout (metadata, i18n)
│   │   ├── components/               # Reusable UI components
│   │   │   ├── home/                 # Landing page sections
│   │   │   ├── dashboard/            # Dashboard widgets & cards
│   │   │   ├── Navbar.js             # Navigation bar
│   │   │   ├── ProtectedRoute.jsx    # Auth route guard
│   │   │   ├── ErrorBoundary.jsx     # React error boundary
│   │   │   ├── Skeleton.js           # Loading skeletons
│   │   │   ├── BioCanvas.jsx         # Animated DNA background
│   │   │   ├── MetabolicPathway.jsx  # Interactive pathway viewer
│   │   │   └── ...
│   │   └── lib/                      # Utilities & services
│   │       ├── api.js                # Axios client with interceptors
│   │       ├── i18n.js               # Internationalization (EN/ZH)
│   │       ├── hooks.js              # Custom React hooks
│   │       └── store/
│   │           └── authStore.js      # Zustand auth state
│   ├── public/                       # Static assets
│   ├── next.config.js                # Next.js config (security headers)
│   ├── tailwind.config.js            # Tailwind theme
│   ├── vercel.json                   # Vercel deployment config
│   ├── .eslintrc.json                # ESLint rules
│   ├── .prettierrc                   # Prettier formatting
│   ├── package.json                  # Dependencies
│   └── Dockerfile                    # Production container
│
├── docs/                             # 📚 Documentation & assets
│   ├── assets/                       # Images & diagrams
│   ├── API.md                        # API reference
│   ├── DEPLOYMENT.md                 # Deployment guide
│   ├── MODELS.md                     # AI model documentation
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
