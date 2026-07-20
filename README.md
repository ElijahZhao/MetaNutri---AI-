# 🧬 MetaNutri - AI驱动的精准营养代谢数字孪生平台

<p align="center">
  <strong>基于深度学习的精准营养代谢数字孪生平台</strong>
</p>

<p align="center">
  <a href="https://github.com/ElijahZhao/MetaNutri---AI-/stargazers"><img src="https://img.shields.io/github/stars/ElijahZhao/MetaNutri---AI-?style=social" alt="Stars"></a>
  <a href="https://github.com/ElijahZhao/MetaNutri---AI-/network/members"><img src="https://img.shields.io/github/forks/ElijahZhao/MetaNutri---AI-?style=social" alt="Forks"></a>
  <a href="https://github.com/ElijahZhao/MetaNutri---AI-/blob/main/LICENSE"><img src="https://img.shields.io/github/license/ElijahZhao/MetaNutri---AI-" alt="License"></a>
  <a href="https://github.com/ElijahZhao/MetaNutri---AI-/issues"><img src="https://img.shields.io/github/issues/ElijahZhao/MetaNutri---AI-" alt="Issues"></a>
  <a href="https://github.com/ElijahZhao/MetaNutri---AI-/pulls"><img src="https://img.shields.io/github/issues-pr/ElijahZhao/MetaNutri---AI-" alt="PRs"></a>
  <img src="https://img.shields.io/badge/python-3.10+-blue" alt="Python">
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js">
  <img src="https://img.shields.io/badge/FastAPI-0.115-green" alt="FastAPI">
</p>

---

## 📖 项目简介

**MetaNutri** 是一个基于深度学习的精准营养代谢数字孪生平台，通过整合基因组、微生物组和代谢组数据，为用户提供个性化的营养建议和健康管理方案。

### 🎯 核心能力

| 能力 | 描述 |
|------|------|
| 🧬 **三重组学整合** | 基因组 + 微生物组 + 代谢组数据闭环分析 |
| 🤖 **深度学习模型** | Transformer、GNN、VAE 先进架构 |
| 🔍 **可解释AI** | SHAP/LIME 特征重要性分析 |
| ⚠️ **健康预警** | 营养缺乏检测和健康风险评估 |
| 📊 **交互式可视化** | 代谢路径图、统计图表 |
| 🐳 **容器化部署** | Docker 一键启动，环境隔离 |

---

## 🚀 快速开始（三步启动）

### 1. 克隆仓库

```bash
git clone https://github.com/ElijahZhao/MetaNutri---AI-.git
cd MetaNutri---AI-
```

### 2. 安装依赖

```bash
# 使用一键脚本（推荐）
./start.sh --install

# 或手动安装
cd backend && pip install -r requirements.txt && cd ..
cd frontend && npm install && cd ..
```

### 3. 启动服务

```bash
# 一键启动前后端
./start.sh --all

# 或单独启动
./start.sh --backend    # 仅后端
./start.sh --frontend   # 仅前端
```

### 🌐 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 🖥️ 前端 | http://localhost:3000 | Next.js 应用 |
| ⚙️ 后端 API | http://localhost:8000 | FastAPI 服务 |
| 📚 API 文档 | http://localhost:8000/docs | Swagger UI |
| 🔍 ReDoc | http://localhost:8000/redoc | ReDoc 文档 |

### 其他命令

```bash
./start.sh --stop      # 停止所有服务
./start.sh --status    # 查看运行状态
./start.sh --help      # 查看帮助
```

---

## 🛠️ 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| [Next.js](https://nextjs.org/) | 16 | React 框架，支持 SSR |
| [React](https://react.dev/) | 18 | UI 组件库 |
| [Tailwind CSS](https://tailwindcss.com/) | 3 | 原子化 CSS 框架 |
| [ECharts](https://echarts.apache.org/) | 5 | 数据可视化图表 |
| [Lucide React](https://lucide.dev/) | 0.29 | 图标库 |
| [Axios](https://axios-http.com/) | 1.6 | HTTP 客户端 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| [FastAPI](https://fastapi.tiangolo.com/) | 0.115 | 高性能 Python Web 框架 |
| [SQLAlchemy](https://www.sqlalchemy.org/) | 2.0 | ORM 数据库操作 |
| [SQLite](https://www.sqlite.org/) | 3 | 轻量级数据库 |
| [Redis](https://redis.io/) | 7 | 缓存服务 |
| [JWT](https://jwt.io/) | - | 身份认证 |
| [scikit-bio](http://scikit-bio.org/) | 0.5 | 生物信息分析 |

### AI/ML

| 技术 | 版本 | 用途 |
|------|------|------|
| [PyTorch](https://pytorch.org/) | 2.1 | 深度学习框架 |
| [NumPy](https://numpy.org/) | 1.26 | 数值计算 |
| [Pandas](https://pandas.pydata.org/) | 2.2 | 数据处理 |
| [SHAP](https://shap.readthedocs.io/) | 0.46 | 模型可解释性 |
| [scikit-learn](https://scikit-learn.org/) | 1.5 | 机器学习工具 |

---

## ✨ 核心功能

### 1. 用户管理 👤
- JWT 认证，注册/登录
- 个人档案编辑（身高、体重、目标等）
- RBAC 细粒度权限控制

### 2. 食物日志 🍎
- 记录每日饮食摄入
- 自动计算热量和营养素
- 历史追踪和趋势分析

### 3. 营养分析 📊
- 摄入量分析与推荐值对比
- 营养缺乏预警
- 个性化饮食建议

### 4. AI 预测 🤖
- 代谢响应预测（血糖、胰岛素变化）
- 健康风险评估
- SHAP/LIME 特征重要性解释

### 5. 组学数据 🧬
- 基因组数据上传与分析
- 微生物组α/β多样性分析
- 代谢组数据可视化

### 6. 数据可视化 📈
- 交互式代谢路径图
- ECharts 统计图表
- 个性化仪表盘

---

## 📁 项目结构

```
MetaNutri---AI-/
├── backend/                         # 后端服务
│   ├── app/
│   │   ├── api/                     # API 路由
│   │   │   ├── auth.py              # 认证接口
│   │   │   ├── users.py             # 用户管理
│   │   │   ├── food.py              # 食物日志
│   │   │   ├── nutrition_alerts.py  # 营养预警
│   │   │   ├── genomic.py           # 基因组数据
│   │   │   ├── microbiome.py        # 微生物组数据
│   │   │   ├── metabolomics.py      # 代谢组数据
│   │   │   ├── predict.py           # AI 预测
│   │   │   ├── recommendation.py    # 营养建议
│   │   │   ├── datasets.py          # 数据集管理
│   │   │   └── import_export.py     # 数据导入导出
│   │   ├── core/                    # 核心配置
│   │   │   ├── config.py            # 配置管理
│   │   │   ├── security.py          # 安全/JWT
│   │   │   └── redis.py             # Redis 缓存
│   │   ├── db/                      # 数据库
│   │   ├── ml/                      # 机器学习
│   │   │   ├── metabolic_response_model.py  # 代谢响应Transformer
│   │   │   ├── gene_nutrition_model.py      # 基因营养GNN
│   │   │   ├── microbiome_vae.py            # 微生物组VAE
│   │   │   ├── explainability.py            # SHAP/LIME解释
│   │   │   ├── microbiome_analysis.py       # 微生物组分析
│   │   │   ├── dataset_downloader.py        # 数据集下载
│   │   │   ├── train_models.py              # 模型训练
│   │   │   └── weights/                     # 模型权重
│   │   ├── models/                  # 数据库模型
│   │   ├── schemas/                 # Pydantic Schema
│   │   ├── services/                # 业务服务
│   │   └── main.py                  # 应用入口
│   ├── data/                        # 示例数据
│   ├── requirements.txt              # Python 依赖
│   └── Dockerfile
├── frontend/                        # 前端应用
│   ├── src/
│   │   ├── app/                     # Next.js 页面
│   │   │   ├── dashboard/           # 仪表盘
│   │   │   ├── food-log/            # 食物日志
│   │   │   ├── genomic/             # 基因组
│   │   │   ├── microbiome/          # 微生物组
│   │   │   ├── metabolomics/        # 代谢组
│   │   │   ├── predict/             # AI 预测
│   │   │   ├── profile/             # 用户档案
│   │   │   ├── meal-plan/           # 膳食计划
│   │   │   ├── explore/             # 探索
│   │   │   ├── datasets/            # 数据集
│   │   │   ├── login/               # 登录
│   │   │   └── recommendations/     # 营养建议
│   │   ├── components/              # 通用组件
│   │   │   ├── Navbar.js
│   │   │   ├── MetabolicPathway.jsx    # 代谢路径可视化
│   │   │   ├── NutritionAlerts.jsx     # 营养预警
│   │   │   ├── FloatingElements.js     # 浮动动画
│   │   │   ├── ParticleBackground.js   # 粒子背景
│   │   │   ├── ScrollReveal.js         # 滚动渐显
│   │   │   └── TypeWriter.js           # 打字机效果
│   │   └── lib/                     # 工具库
│   ├── package.json
│   └── Dockerfile
├── docs/                            # 详细文档
│   ├── API.md                      # API 文档
│   ├── DEPLOYMENT.md               # 部署指南
│   ├── MODELS.md                   # 模型文档
│   └── DATASETS.md                 # 数据集文档
├── .github/                         # GitHub 配置
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE/
├── start.sh                         # 一键启动脚本
├── docker-compose.yml               # Docker 编排
├── .gitignore
├── LICENSE                         # MIT 许可证
├── CONTRIBUTING.md                 # 贡献指南
├── CODE_OF_CONDUCT.md              # 行为准则
└── README.md                       # 项目说明
```

---

## 📡 API 接口

### 认证接口

| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/api/auth/register` | 用户注册 |
| `POST` | `/api/auth/login` | 用户登录 |
| `POST` | `/api/auth/logout` | 退出登录 |

### 用户接口

| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/api/users/me` | 获取当前用户 |
| `PUT` | `/api/users/me` | 更新用户信息 |

### 食物日志

| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/api/food/logs` | 获取食物日志 |
| `POST` | `/api/food/logs` | 添加食物日志 |
| `PUT` | `/api/food/logs/{id}` | 更新日志 |
| `DELETE` | `/api/food/logs/{id}` | 删除日志 |

### 营养分析

| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/api/nutrition/alerts` | 营养预警 |
| `GET` | `/api/recommendations` | 个性化建议 |

### AI 预测

| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/api/predict/metabolic-response` | 代谢响应预测 |
| `GET` | `/api/predict/explain/{id}` | 预测解释 |

> 完整 API 文档请访问 `http://localhost:8000/docs`

---

## 🧠 AI 模型

### 模型架构

| 模型 | 架构 | 输入 | 输出 |
|------|------|------|------|
| 代谢响应 Transformer | Transformer Encoder + MLP | 食物成分 + 基因型 + 微生物组 | 代谢物浓度变化 |
| 基因营养 GNN | GraphSAGE + Attention | 基因-营养网络 | 营养素吸收效率 |
| 微生物组 VAE | Variational Autoencoder | 微生物组丰度 | 健康状态预测 |

### 模型训练

```bash
cd backend
python -m app.ml.train_models
```

### 模型可解释性

```bash
cd backend
python -c "from app.ml.explainability import explain_metabolic_prediction"
```

---

## 📊 数据集

| 数据集 | 来源 | 描述 |
|--------|------|------|
| USDA 食物营养数据库 | USDA | 食物成分和营养信息 |
| KEGG 代谢通路 | KEGG | 代谢通路和酶信息 |
| HMP 参考数据 | Human Microbiome Project | 人类微生物组参考 |
| 代谢组学参考 | MetaboLights | 代谢物参考谱 |
| 基因-营养关联 | GWAS Catalog | 基因与营养关联 |

下载数据集：

```bash
cd backend
python -m app.ml.dataset_downloader --all
```

---

## 🐳 Docker 部署

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 👨‍💻 开发指南

### 代码规范

- **Python**: 遵循 PEP 8，使用 type hints 和 async/await
- **JavaScript**: 使用 ESLint + Prettier，React Hooks
- **提交格式**: Conventional Commits (`feat:`, `fix:`, `docs:`, ...)

### 测试

```bash
# 后端测试
cd backend && pytest

# 前端测试
cd frontend && npm test
```

---

## 🤝 贡献

欢迎贡献代码！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解贡献流程。

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/your-feature`
3. 提交更改: `git commit -m 'feat: add your feature'`
4. 推送: `git push origin feature/your-feature`
5. 创建 Pull Request

---

## 📄 许可证

本项目采用 [MIT License](LICENSE)。

---

## 📞 联系方式

- 提交 Issue: [GitHub Issues](https://github.com/ElijahZhao/MetaNutri---AI-/issues)
- 邮箱: elijahzhao@gmail.com

---

<p align="center">
  <strong>MetaNutri</strong> - AI驱动的精准营养代谢数字孪生平台<br>
  Made with ❤️ by <a href="https://github.com/ElijahZhao">ElijahZhao</a>
</p>
