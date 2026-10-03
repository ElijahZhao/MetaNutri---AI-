<div align="center">

<p align="right">
  <a href="README.md">English</a> | <strong>简体中文</strong>
</p>

![MetaNutri Banner](docs/assets/banner.jpg)

# 🧬 MetaNutri

**AI 驱动的精准营养代谢数字孪生平台**

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

**[🌐 平台在线演示](https://meta-nutri-ai.vercel.app/) · [🧪 PPGR 研究演示（真 AI）](https://metanutri-ai-ppgr-predictor.streamlit.app/) · [📖 文档](docs/) · [🐛 提交 Bug](https://github.com/ElijahZhao/MetaNutri---AI-/issues) · [✨ 功能建议](https://github.com/ElijahZhao/MetaNutri---AI-/issues)**

[![Vercel](https://img.shields.io/badge/Vercel-已部署-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://meta-nutri-ai.vercel.app/)
[![Render](https://img.shields.io/badge/Render-已部署-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://metanutri-backend.onrender.com/)
[![Supabase](https://img.shields.io/badge/Supabase-技术支持-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

**🔬 `research/` 中真实数据训练的 ML · 🧪 43 个 REST 接口 · 🍎 8 个精选数据集 · 🌐 完整英 / 中双语 · 📄 16 页技术报告**

</div>

---

## 📑 目录

- [项目简介](#-项目简介)
- [📌 项目状态](#-项目状态)
- [🔬 研究亮点](#-研究亮点)
- [🧩 两仓库关系](#-两仓库关系)
- [📸 截图展示](#-截图展示)
- [✨ 核心功能](#-核心功能)
- [🏗️ 系统架构](#️-系统架构)
- [🛠️ 技术栈](#️-技术栈)
- [🚀 快速开始](#-快速开始)
- [🔌 API 与 AI/ML 实战](#-api-与-aiml-实战)
- [🧪 测试与 CI](#-测试与-ci)
- [☁️ 云端部署](#️-云端部署)
- [📁 项目结构](#-项目结构)
- [⚠️ 局限与边界](#️-局限与边界)
- [🤝 参与贡献](#-参与贡献)
- [📄 许可证](#-许可证)
- [📮 联系方式](#-联系方式)

---

## 🌟 项目简介

**MetaNutri** 是一个基于 AI 的精准营养代谢数字孪生平台，通过整合**基因组学**、**微生物组学**和**代谢组学**数据，为用户提供个性化的营养建议和健康管理方案。

本仓库**首先是一个全栈工程项目**：一个生产级别的 Next.js 前端、一个 FastAPI 后端与一个托管 PostgreSQL 数据库，端到端打通并部署在 Vercel / Render / Supabase 上。线上 API 提供的是**透明、确定性的规则化分析**；`backend/app/ml/` 下的 PyTorch 模型代码属于研究脚手架，**并未接入线上 API**。真实的数据训练模型在独立的研究模块中开发。

### 📌 项目状态

> **本仓库是一个工程演示项目，并配有一条独立的研究线。**
>
> - **线上实际运行的内容：** 认证、数据库 CRUD、食物检索、导入导出——以及血糖/营养/风险评估所用的**确定性规则化启发式**。全部仅供演示。
> - **研究脚手架（非线上）：** `backend/app/ml/` 下的 PyTorch 模型代码**未用真实数据训练**，且在运行时**从不加载**。
> - **真正的 AI 在哪里：** 一个自包含的研究模块——在**真实公开数据**上做餐后血糖响应预测，并采用严格的按受试者划分评估——**独立于本平台**开发与部署。见 [docs/ROADMAP.md](docs/ROADMAP.md)。
> - **非医疗器械。** 本项目不构成任何医疗建议，切勿用于临床决策。

### 🎯 为什么选择 MetaNutri？

| 痛点 | 解决方案 |
|------|---------|
| 🍎 通用饮食建议忽视个体生物差异 | 基于**你的**组学特征提供个性化推荐 |
| 🧬 基因组数据晦涩难懂 | AI 将复杂数据转化为可执行的洞察 |
| 📊 健康数据分散在不同 App | 统一面板整合基因组、微生物组、代谢组 |
| 🤖 AI 推荐像"黑盒"一样难以理解 | 透明的规则化评分展示**哪些因素**影响了这条建议 |
| ⚠️ 被动式医疗模式 | 早期营养缺乏检测与健康风险预警 |

---

## 🔬 研究亮点

平台上的 AI 接口是刻意保持诚实的启发式（见[局限与边界](#️-局限与边界)）。**真正的机器学习**在自包含的 [`research/`](research/) 模块中：一条可复现的流水线，在**真实公开数据**上预测**餐后 2 小时血糖响应（PPGR）**，并按受试者划分评估——同一个人绝不会同时出现在训练集与测试集。

| 阶段 | 核心结果 |
|------|---------|
| **复现已发表基线** —— CGMacros，早餐，留一受试者（LOPO） | **AUC r = 0.890 · iAUC r = 0.655**（论文 ≈ 0.89 / ≈ 0.64） |
| **扩展到全部餐次** —— 1,557 餐、45 名受试者 | **AUC r = 0.838 · iAUC r = 0.451** |
| **把冻结模型迁移到独立队列** —— BIG IDEAs，16 名受试者、656 餐、不同 CGM 设备 | **AUC r = 0.569**（部分迁移；iAUC/峰值抬升降至 ≈ 0.22 → 域偏移） |
| **超越单点估计** | 保形预测区间 · 受试者内/间分解 · 受试者随机截距混合效应模型 |

- **方法：** 严格的留一受试者（LOPO）交叉验证；XGBoost 对照均值预测器与两个仅用宏量营养的 Ridge 基线。
- **成果物：** [16 页技术报告（PDF）](research/reports/technical_report.pdf) · [可复现流水线](research/src/) · [结果 CSV](research/experiments/) · [图表](research/reports/figures/)。
- **在线 Demo（运行真实训练的模型）：** <https://metanutri-ai-ppgr-predictor.streamlit.app>
- **一条命令复现：** `cd research && bash src/run_all.sh`

> 以上每个数字都由 [`research/experiments/*.csv`](research/experiments/) 重新生成，且必须与技术报告一致——无估算、无四舍五入、无推断。

**图表（直接来自[技术报告](research/reports/technical_report.pdf)流水线）：**

| 预测值 vs 实测值 | 模型对比 |
|:---:|:---:|
| ![预测值 vs 实测值](research/reports/figures/fig1_pred_vs_actual.png) | ![模型对比](research/reports/figures/fig2_model_comparison.png) |

| 外部验证（BIG IDEAs） | 保形预测区间 |
|:---:|:---:|
| ![外部验证](research/reports/figures/fig5_external_validation.png) | ![保形预测区间](research/reports/figures/fig7_conformal.png) |

---

## 🧩 两仓库关系

本项目横跨**两个互相独立的 GitHub 仓库**。二者**刻意不做 git 层面的绑定**——没有 submodule、没有 subtree、没有 `.gitmodules`。它们之间的耦合靠**溯源关系**，而不是靠工具链。

| | **本仓库** | **[`ppgr-predictor`](https://github.com/ElijahZhao/ppgr-predictor)** |
|---|---|---|
| **它是什么** | 完整项目：全栈平台（`backend/`、`frontend/`）**以及**研究模块（`research/`） | 研究模块 Demo 的**部署产物**——一个自包含的 Streamlit 应用 |
| **线上地址** | <https://meta-nutri-ai.vercel.app> | <https://metanutri-ai-ppgr-predictor.streamlit.app> |
| **体积** | 约 17 MB | 约 690 KB |
| **角色** | 唯一事实来源（source of truth） | 筛选后的只读副本 |

**流向是单向的：本仓库 → `ppgr-predictor`。** 没有任何东西反向流动。部署仓库只包含一个*筛选后的子集*——`app.py`、`inference.py`、`model/*.json`、`assets/`、`src/`、`reports/`、`experiments/`——并且**不 import 平台侧的任何代码**。

**保证二者一致的那条规则。** 本仓库的 `research/` 是唯一事实来源。部署仓库（及其 README）里的每一个数字，都由 `research/experiments/*.csv` 生成，且必须与[技术报告](research/reports/technical_report.md)一致。部署仓库**永不单独修改**；一旦两边出现分歧，以本仓库为准，重新生成部署仓库。

**为什么不把它们用 submodule 绑起来。** Streamlit Community Cloud 构建的是你指定仓库的**仓库根目录**，并要求 `app.py` + `requirements.txt` 就在根目录。若直接指向本仓库，要么把整个平台拖进那次构建，要么依赖一个免费档不允许你指定的子目录入口。而用 submodule 会给那次构建增加一次额外 checkout 和一个新的失败点，同时还**不能**免除"需要筛选子集"这件事。消费方不同、运行时不同、体积预算不同——两个仓库才是正确设计。

**它们在运行时需要互相调用吗？不需要。** 两者之间没有任何 API 调用、没有共享包、没有数据交换。Demo 是完全自包含的：它加载导出的 JSON 模型文件，在本地完成预测。

> `ppgr-predictor` 的本地工作副本可放在 `.deploy/ppgr-predictor/`，作为**未被 git 跟踪**的镜像（见 `.gitignore`）。该镜像只是推送方便之用，**不属于**本仓库；克隆本仓库并不依赖它。

---

## 📸 截图展示

| 首页 | 营养仪表盘 |
|:---:|:---:|
| ![首页](docs/assets/screenshots/01-landing.png) | ![营养仪表盘](docs/assets/screenshots/02-dashboard.png) |

| 数据集管理 | 登录页 |
|:---:|:---:|
| ![数据集管理](docs/assets/screenshots/03-datasets.png) | ![登录页](docs/assets/screenshots/04-login.png) |

---

## ✨ 核心功能

<div align="center">

| | 功能 | 描述 |
|---|------|------|
| 🧬 | **三重组学整合** | 基因组 + 微生物组 + 代谢组数据统一分析流程 |
| 🤖 | **代谢分析** | 确定性的规则化血糖与营养估算——天生透明。PyTorch 模型代码属于研究脚手架，未接入线上 API |
| 🔍 | **透明评分** | 每条建议都展示其贡献因素（启发式贡献权重，并非 SHAP） |
| 📊 | **交互式仪表盘** | 健康评分、身体指标与风险雷达卡片，由 ECharts 图表支撑 |
| 🚨 | **健康预警** | 实时营养缺乏检测与健康风险评估 |
| 🍎 | **食物与营养探索** | 可检索的食物数据库，并提供个性化食物评分 |
| 🍽️ | **AI 膳食计划** | 基于个体生理特征的 AI 个性化膳食方案 |
| 📁 | **数据集浏览器** | 浏览平台内置的精选参考数据集 |
| 📥 | **导入 / 导出** | 导入你自己的组学与饮食数据，导出分析结果 |
| 🔐 | **默认安全** | httpOnly Cookie 会话、bcrypt 哈希与请求限流 |
| 🌐 | **双语界面** | 完整的英/中双语界面，基于轻量自研 i18n 层 |
| 📱 | **精致且响应式** | DNA / 粒子动画，桌面、平板、移动端完美适配 |

</div>

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                        用户（浏览器 / 移动端）                          │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │  HTTPS
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Vercel（前端部署）                             │
│     Next.js 16 App Router — 静态预渲染页面                            │
│  ┌───────────────┐┌────────────────┐┌───────────────────────────┐   │
│  │  静态页面      ││  边缘中间件     ││  ECharts + 自研 i18n       │   │
│  │  (App Router) ││  (proxy.ts)    ││  (图表, 英 / 中)           │   │
│  └───────────────┘└────────────────┘└───────────────────────────┘   │
│    重写  /api/*  →  同源代理（Cookie 保持第一方，避免跨域）             │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │  HTTPS / REST
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Render（后端部署）                             │
│                       FastAPI (Python 3.11)                         │
│  ┌────────┐┌────────┐┌────────┐┌────────┐┌──────────┐              │
│  │  认证  ││  用户  ││  饮食  ││  组学  ││  预测    │              │
│  └────────┘└────────┘└────────┘└────────┘└──────────┘              │
│  ┌────────┐┌──────────┐┌────────┐┌──────────────┐                  │
│  │  预警  ││  数据集   ││  导入  ││  规则分析     │                  │
│  └────────┘└──────────┘└────────┘└──────────────┘                  │
│   SQLAlchemy 2.0 异步 ORM · 规则化分析 · 可选 Redis 缓存              │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Supabase（托管 PostgreSQL 数据库）                    │
│   存储用户、档案、饮食、组学与数据集表。                                │
│   认证由 FastAPI 通过 httpOnly Cookie 处理；                          │
│   未使用 Supabase Auth 与 Storage。                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 技术栈

### 🎨 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| [Next.js](https://nextjs.org/) | 16 | React 框架，支持服务端渲染与 SEO |
| [React](https://react.dev/) | 19 | UI 组件库 |
| [TypeScript](https://www.typescriptlang.org/) | 5 | 类型安全 |
| [Tailwind CSS](https://tailwindcss.com/) | 3 | 原子化 CSS 框架 |
| [ECharts](https://echarts.apache.org/) | 6 | 数据可视化 |
| [TanStack Query](https://tanstack.com/query) | 5 | 服务端状态管理与缓存 |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5 | 客户端状态管理 |
| [React Hook Form](https://react-hook-form.com/) | 7 | 表单验证 |
| [Zod](https://zod.dev/) | 4 | Schema 验证 |
| Custom i18n | - | 轻量英/中翻译（`src/lib/i18n.tsx`；不依赖 i18next） |

### ⚙️ 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| [FastAPI](https://fastapi.tiangolo.com/) | 0.115 | 高性能异步 API 框架 |
| [Python](https://www.python.org/) | 3.11 | 运行时 |
| [SQLAlchemy](https://www.sqlalchemy.org/) | 2.0 | 异步 ORM |
| [PostgreSQL](https://www.postgresql.org/) | - | 主数据库 |
| [Redis](https://redis.io/) | 5 | 缓存与限流（可选，内存回退） |
| [Pydantic](https://docs.pydantic.dev/) | 2 | 数据验证 |
| [python-jose](https://github.com/mpdavis/python-jose) | 3.5 | JWT（签发进 httpOnly Cookie） |
| [Passlib](https://passlib.readthedocs.io/) | 1.7 | 密码哈希（bcrypt） |

### 🧠 AI / 机器学习

| 技术 | 版本 | 用途 |
|------|------|------|
| [PyTorch](https://pytorch.org/) | 2.x | 模型原型的研究脚手架（线上 API 不加载） |
| [NumPy](https://numpy.org/) | 1.26 | 数值计算（血糖响应曲线） |
| [Pandas](https://pandas.pydata.org/) | 2.2 | 数据处理（导入 / 导出） |
| [requests](https://docs.python-requests.org/) | 2.32 | HTTP 客户端（内置参考数据由本地生成，非下载） |

### 🔬 研究（真实 ML —— `research/`）

| 技术 | 版本 | 用途 |
|------|------|------|
| [XGBoost](https://xgboost.readthedocs.io/) | 3.4 | 梯度提升 PPGR 模型 |
| [scikit-learn](https://scikit-learn.org/) | 1.9 | 基线、指标与预处理 |
| [SciPy](https://scipy.org/) | 1.18 | 统计 |
| [statsmodels](https://www.statsmodels.org/) | 0.15 | 混合效应模型 |
| [NumPy](https://numpy.org/) | 2.5 | 数值计算 |
| [pandas](https://pandas.pydata.org/) | 3.0 | 表格数据 |
| [Matplotlib](https://matplotlib.org/) | 3.11 | 报告图表 |
| [Streamlit](https://streamlit.io/) | 1.65 | 交互式 PPGR Demo |
| [WeasyPrint](https://weasyprint.org/) | 70 | 技术报告 PDF |

---

## 🚀 快速开始

### 前置条件

- **Python** ≥ 3.11
- **Node.js** ≥ 20.19
- **npm** ≥ 9 或 **pnpm** ≥ 8
- **PostgreSQL** ≥ 14（或使用 [Supabase](https://supabase.com/) 云端数据库）

### 📦 安装

```bash
# 1. 克隆仓库
git clone https://github.com/ElijahZhao/MetaNutri---AI-.git
cd MetaNutri---AI-

# 2. 配置后端
cd backend
cp .env.example .env          # 编辑填入你的配置
pip install -r requirements.txt
cd ..

# 3. 配置前端
cd frontend
cp .env.example .env.local     # 编辑填入你的 API 地址
npm install
cd ..

# 4. 启动服务（使用两个终端分别运行）
cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
cd frontend && npm run dev
```

### 🌐 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:3000 | Next.js 网页应用 |
| 后端 API | http://localhost:8000 | FastAPI 服务 |
| API 文档（Swagger） | http://localhost:8000/docs | 交互式 API 文档 |
| API 文档（ReDoc） | http://localhost:8000/redoc | 另一种 API 文档格式 |

### 🐳 Docker（可选方案）

```bash
# 一键启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 🔬 研究模块

研究流水线**独立于**平台——它有自己的依赖与部署：

```bash
cd research
python -m venv .venv && source .venv/bin/activate   # 需要 Python ≥ 3.12
pip install -r requirements.txt
bash src/run_all.sh      # 下载 CGMacros（约 627 MB）、构建数据集、运行 LOPO 评估，写出 experiments/ + reports/

# ……或只启动交互式 Demo（运行冻结模型，无需训练栈）
pip install -r app/requirements.txt
python -m streamlit run app/app.py
```

CGMacros 数据集约 627 MB，**从不提交**（见 [`research/data/README.md`](research/data/README.md)）。

---

## 🔌 API 与 AI/ML 实战

完整的接口清单见 [📘 API 参考](docs/API.md)。后端交互式文档在 `<BASE>/docs`（Swagger）与 `<BASE>/redoc`。

### 认证（httpOnly Cookie）

登录后令牌通过 httpOnly Cookie 下发，前端无需手动附加 `Authorization` 头：

```http
POST /api/auth/login          # {username, password}
Set-Cookie: metanutri_access=...; HttpOnly; SameSite=Lax
Set-Cookie: metanutri_refresh=...; HttpOnly; SameSite=Lax
```

### 一条完整的 AI 调用链路

1. **登录** 获取会话 → 之后请求自动带 Cookie。
2. **上传组学数据**：`POST /api/genomic/upload`、`/api/microbiome/upload`、`/api/metabolomics/upload`。
3. **跑预测**：`POST /api/predict/glucose-response` 或 `GET /api/predict/risk-assessment`。
4. **拿推荐/饮食计划**：`POST /api/recommendations/meal-plan`。
5. **获取可解释性**：预测返回里含营养解读与 `feature_contributions`——启发式贡献权重，**并非** SHAP 值。

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
| `ml/metabolic_response_model.py` | 研究原型：血糖响应 / 营养吸收预测器（未接入线上 API） |
| `ml/gene_nutrition_model.py` | 研究原型：基因-营养关联（GNN） |
| `ml/microbiome_vae.py` | 研究原型：微生物组健康（VAE） |
| `ml/explainability.py` | 确定性的比例摊派特征贡献解释器（线上 API 返回的就是它） |
| `ml/train_models.py` | 原型训练脚本（在合成张量上训练） |
| `ml/weights/` | 在合成数据上训练的权重；运行时从不加载 |

---

## 🧪 测试与 CI

| 检查项 | 工具 | 命令 |
|--------|------|------|
| 类型安全 | TypeScript（`tsc --noEmit`） | `npm run typecheck` |
| 代码规范 | ESLint（扁平配置） | `npm run lint` |
| 单元 / 组件测试 | Vitest + Testing Library | `npm test` |
| 端到端测试 | Playwright（Chromium） | `npm run test:e2e` |
| 后端语法 + 导入冒烟测试 | `compileall` + FastAPI 导入 | `python -m compileall -q app` |

每次 push 与 Pull Request 都会通过 [`.github/workflows/ci.yml`](.github/workflows/ci.yml) 运行以上全部检查。

---

## ☁️ 云端部署

MetaNutri 采用以下技术栈实现无缝云端部署：

| 组件 | 平台 | 说明 |
|------|------|------|
| 🗄️ 数据库 | [Supabase](https://supabase.com/) | 托管 PostgreSQL |
| ⚙️ 后端 API | [Render](https://render.com/) | 从 GitHub 的 Python 部署 |
| 🎨 前端 Web | [Vercel](https://vercel.com/) | Next.js 原生平台 |

### 第一步：Supabase（数据库）

1. 在 [supabase.com](https://supabase.com/) 创建项目
2. 进入 **SQL Editor** → 新建查询
3. 执行 [`backend/schema.sql`](backend/schema.sql) 中的 SQL 语句
4. 从 **Settings → Database → Connection string (URI)** 复制连接字符串

### 第二步：Render（后端）

1. 在 [render.com](https://render.com/) 新建 **Web Service** → **Build & Deploy from a Repository** → 选择你的仓库
2. 在 **Settings → Docker** 中，将 **Dockerfile 路径** 设为 `backend/Dockerfile`
3. 在 **Environment** 中添加：
   - `DATABASE_URL` = 你的 Supabase **连接池** 地址（使用端口 **5432 会话模式**——Render 不支持 IPv6，因此请使用 `*.pooler.supabase.com`，不要用仅 IPv6 的直连地址）
   - `SECRET_KEY` = 一个安全的随机字符串
4. 等待部署完成 → 复制你的 `https://your-service.onrender.com` 域名

### 第三步：Vercel（前端）

1. 从 GitHub 导入项目 → 选择你的仓库
2. **Root Directory**: `frontend`
3. **Framework Preset**: Next.js（自动识别）
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = 你的 Render 后端地址（例如 `https://your-service.onrender.com`）
5. 点击 **Deploy**

---

## 📁 项目结构

```
MetaNutri---AI-/
├── backend/                          # ⚙️ FastAPI 后端
│   ├── app/
│   │   ├── api/                      # API 路由处理器
│   │   │   ├── auth.py               # 认证（注册 / 登录 / 刷新）
│   │   │   ├── users.py              # 用户档案管理
│   │   │   ├── food.py               # 食物检索、饮食日志与营养
│   │   │   ├── genomic.py            # 基因组数据分析
│   │   │   ├── microbiome.py         # 微生物组分析
│   │   │   ├── metabolomics.py       # 代谢组数据
│   │   │   ├── predict.py            # AI 预测接口
│   │   │   ├── recommendation.py     # 营养建议与膳食计划
│   │   │   ├── datasets.py           # 数据集管理
│   │   │   ├── import_export.py      # 数据导入导出
│   │   │   └── nutrition_alerts.py   # 健康预警系统
│   │   ├── core/                     # 核心基础设施
│   │   │   ├── config.py             # 配置与环境变量
│   │   │   ├── security.py           # JWT + httpOnly Cookie 认证、密码哈希
│   │   │   ├── rate_limit.py         # 内存限流
│   │   │   └── redis.py              # Redis 缓存（优雅降级）
│   │   ├── db/
│   │   │   └── session.py            # SQLAlchemy 异步引擎
│   │   ├── ml/                       # 🧠 机器学习模型
│   │   │   ├── metabolic_response_model.py   # 研究原型（未接入线上 API）
│   │   │   ├── gene_nutrition_model.py       # 研究原型（GNN）
│   │   │   ├── microbiome_vae.py             # 研究原型（VAE）
│   │   │   ├── explainability.py             # 研究原型解释器
│   │   │   ├── dataset_downloader.py         # 生成内置样例数据（不做网络请求）
│   │   │   ├── train_models.py               # 原型训练脚本（合成数据）
│   │   │   └── weights/                      # 在合成数据上训练的权重（运行时未使用）
│   │   ├── models/                   # SQLAlchemy ORM 模型
│   │   ├── schemas/                  # Pydantic 请求 / 响应 Schema
│   │   ├── services/                 # 业务逻辑（种子数据、导入 / 导出）
│   │   └── main.py                   # FastAPI 应用入口
│   ├── data/                         # 种子与参考数据集（JSON）
│   ├── schema.sql                    # PostgreSQL 表定义
│   ├── requirements.txt              # Python 依赖
│   ├── Dockerfile                    # 生产容器
│   └── .env.example                  # 环境变量模板
│
├── frontend/                         # 🎨 Next.js 前端
│   ├── src/
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── (auth)/               # 公开认证组
│   │   │   │   ├── login/            # 登录
│   │   │   │   └── forgot-password/  # 密码找回
│   │   │   ├── (app)/                # 受保护应用组（需鉴权）
│   │   │   │   ├── dashboard/        # 分析仪表盘与健康评分
│   │   │   │   ├── profile/          # 用户档案
│   │   │   │   ├── genomic/          # 基因组分析
│   │   │   │   ├── microbiome/       # 微生物组分析
│   │   │   │   ├── metabolomics/     # 代谢组数据
│   │   │   │   ├── predict/          # AI 预测工具
│   │   │   │   ├── recommendations/  # 个性化建议
│   │   │   │   ├── meal-plan/        # AI 膳食计划
│   │   │   │   ├── explore/          # 食物探索
│   │   │   │   └── datasets/         # 数据集浏览
│   │   │   ├── page.tsx              # 首页
│   │   │   ├── content.tsx           # 首页内容
│   │   │   ├── layout.tsx            # 根布局（metadata、i18n）
│   │   │   ├── loading.tsx           # 路由加载 UI
│   │   │   ├── error.tsx             # 全局错误边界
│   │   │   ├── not-found.tsx         # 自定义 404 页面
│   │   │   ├── icon.svg              # 网站图标
│   │   │   ├── opengraph-image.tsx   # 动态 Open Graph 图
│   │   │   ├── twitter-image.tsx     # 动态 Twitter 卡片
│   │   │   ├── robots.ts             # robots.txt
│   │   │   └── sitemap.ts            # sitemap.xml
│   │   ├── components/               # 可复用 UI 组件
│   │   │   ├── home/                 # 首页区块（Hero、功能、CTA）
│   │   │   ├── dashboard/            # 仪表盘小部件与卡片
│   │   │   ├── Navbar.tsx            # 导航栏
│   │   │   ├── ProtectedRoute.tsx    # 认证路由守卫
│   │   │   ├── ErrorBoundary.tsx     # React 错误边界
│   │   │   ├── Skeleton.tsx          # 加载骨架屏
│   │   │   ├── MetabolicPathway.tsx  # 交互式路径查看器
│   │   │   ├── NutritionAlerts.tsx   # 健康预警提示
│   │   │   ├── BioCanvas.tsx         # 动画 DNA 背景
│   │   │   ├── BioBackground.tsx     # 生物主题页面背景
│   │   │   ├── ParticleBackground.tsx# 粒子场动画
│   │   │   ├── ScrollReveal.tsx      # 滚动触发动效
│   │   │   ├── SpotlightTitle.tsx    # 首屏标题动效
│   │   │   └── TypeWriter.tsx        # 打字机文字效果
│   │   ├── constants/                # 共享常量（档案选项、BMI）
│   │   ├── lib/                      # 工具与服务
│   │   │   ├── api.ts                # Axios 客户端（同源、Cookie 认证）
│   │   │   ├── backendWarmup.ts      # 冷启动预热辅助
│   │   │   ├── hooks.ts              # 自定义 React Hooks
│   │   │   ├── i18n.tsx              # 国际化（英 / 中）
│   │   │   └── store/authStore.ts    # Zustand 认证状态
│   │   ├── types/                    # 共享 TypeScript 类型
│   │   └── proxy.ts                  # Next.js 边缘鉴权守卫
│   ├── tests/e2e/                    # Playwright 端到端测试
│   ├── scripts/start-standalone.mjs  # 独立服务启动脚本
│   ├── public/                       # 静态资源
│   ├── next.config.ts                # Next.js 配置（同源 /api 重写）
│   ├── tailwind.config.js            # Tailwind 主题
│   ├── vercel.json                   # Vercel 部署配置
│   ├── eslint.config.mjs             # ESLint 扁平配置
│   ├── vitest.config.mjs             # Vitest 配置
│   ├── playwright.config.ts          # 端到端测试配置
│   ├── Dockerfile / Dockerfile.dev   # 生产 / 开发容器
│   └── package.json                  # 依赖与脚本

├── research/                         # 🔬 研究模块（真正的 ML；独立）
│   ├── src/                          # 可复现流水线（下载 → 构建 → LOPO → 图表）
│   ├── app/                          # Streamlit PPGR Demo（运行冻结模型）
│   ├── experiments/                  # 结果 CSV，由流水线重新生成
│   ├── reports/                      # 技术报告（MD + 16 页 PDF）与图表
│   ├── data/                         # 占位——原始数据集从不提交
│   ├── requirements.txt / -dev.txt   # 固定的研究依赖
│   └── README.md
│
├── docs/                             # 📚 文档与资源
│   ├── assets/                       # Banner 与截图
│   ├── API.md                        # API 参考
│   ├── DEPLOYMENT.md                 # 部署指南
│   ├── DATASETS.md                   # 数据集参考
│   ├── ARCHITECTURE.md               # 架构与设计取舍
│   ├── ROADMAP.md                    # 路线图与决策记录
│   ├── APPLICATION-SUMMARY.md        # 一页项目综述
│   ├── AUDIT-FINDINGS.md             # 仓库审计记录
│   └── TODO.md                       # 待办：需手动完成的 GitHub 设置
│
├── .github/                          # GitHub 配置
│   ├── workflows/                    # CI 与保活工作流
│   ├── ISSUE_TEMPLATE/               # Bug 与功能建议模板
│   └── PULL_REQUEST_TEMPLATE/        # PR 模板
│
├── docker-compose.yml                # 本地编排
├── start.sh                          # 一键启动脚本
├── CONTRIBUTING.md                   # 贡献指南
├── CODE_OF_CONDUCT.md                # 社区行为准则
├── SECURITY.md                       # 安全策略
├── CITATION.cff                      # 引用方式
├── LICENSE                           # MIT 许可证
├── README.md                         # 英文版（默认展示）
└── README.zh-CN.md                   # 👈 中文版
```

---

## ⚠️ 局限与边界

本项目面向**演示与作品集用途**。为保持诚实，以下是它**是**什么、**不是**什么：

- **内置数据集是精选样例，并非完整的第三方数据。** `backend/data/` 下的文件都是人工整理的小型参考集。数据集"下载"接口只是（重新）生成这些本地样例文件——**不会**从 USDA / KEGG / HMP 抓取。天池客户端返回的是**模拟的占位清单**。
- **预测是启发式，并非临床模型。** 血糖、营养吸收与风险输出来自确定性规则，**仅供演示**，**不得**用于任何医疗决策。
- **模型权重未被使用。** `backend/app/ml/weights/` 下的 `.pt` 文件是在合成随机张量上训练的，运行中的 API 从不加载它们。
- **真正的 AI 在别处。** 严肃的、经数据训练的模型在独立的研究模块中、基于真实公开数据集开发——见 [docs/ROADMAP.md](docs/ROADMAP.md)。

---

## 🤝 参与贡献

贡献是开源社区最宝贵的财富，也是学习、启发、创造的最佳途径。你所做的任何贡献我们都**万分感激**。

1. Fork 本项目
2. 创建你的功能分支（`git checkout -b feature/AmazingFeature`）
3. 提交你的改动（`git commit -m 'feat: add some AmazingFeature'`）
4. 推送到分支（`git push origin feature/AmazingFeature`）
5. 开启一个 Pull Request

请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解我们的行为准则和提交 PR 的详细流程。

---

## 📄 许可证

基于 MIT 许可证开源。更多信息请参阅 [LICENSE](LICENSE)。

如需引用本项目，请见 [`CITATION.cff`](CITATION.cff)。

---

## 📮 联系方式

**ElijahZhao** - [@ElijahZhao](https://github.com/ElijahZhao) - yulinzhao04@gmail.com · 550568658@qq.com

项目链接：[https://github.com/ElijahZhao/MetaNutri---AI-](https://github.com/ElijahZhao/MetaNutri---AI-)

---

<div align="center">

由 **ElijahZhao** 用 ❤️ 打造

**MetaNutri** — AI 驱动的精准营养代谢数字孪生

[⬆ 返回顶部](#-metanutri)

</div>
