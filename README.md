# MetaNutri - AI驱动的精准营养代谢数字孪生平台

![GitHub stars](https://img.shields.io/github/stars/ElijahZhao/MetaNutri---AI-?style=social)
![GitHub forks](https://img.shields.io/github/forks/ElijahZhao/MetaNutri---AI-?style=social)
![GitHub license](https://img.shields.io/github/license/ElijahZhao/MetaNutri---AI-)
![GitHub last commit](https://img.shields.io/github/last-commit/ElijahZhao/MetaNutri---AI-)
![GitHub issues](https://img.shields.io/github/issues/ElijahZhao/MetaNutri---AI-)
![GitHub pull requests](https://img.shields.io/github/issues-pr/ElijahZhao/MetaNutri---AI-)

---

## 📋 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [核心功能](#核心功能)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [API文档](#api文档)
- [AI模型](#ai模型)
- [数据集](#数据集)
- [开发指南](#开发指南)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 🌟 项目简介

**MetaNutri** 是一个基于深度学习的精准营养代谢数字孪生平台，旨在通过整合基因组、微生物组和代谢组数据，为用户提供个性化的营养建议和健康管理方案。

### 🎯 核心目标

| 目标 | 描述 |
|------|------|
| **个性化营养** | 根据用户的遗传背景和微生物组特征，提供精准的饮食建议 |
| **代谢预测** | 使用深度学习模型预测用户对不同食物的代谢响应 |
| **健康预警** | 识别潜在的营养缺乏和健康风险，提前干预 |
| **数据可视化** | 通过交互式图表展示三重组学数据和代谢路径 |

### 🚀 项目亮点

- **三重组学整合**: 基因组 + 微生物组 + 代谢组数据闭环分析
- **深度学习模型**: Transformer、GNN、VAE等先进架构
- **可解释AI**: SHAP/LIME分析模型预测的特征重要性
- **实时预警系统**: 营养缺乏检测和健康风险评估
- **交互式可视化**: 代谢路径图、数据统计图表
- **容器化部署**: Docker一键启动，环境隔离

---

## 🛠️ 技术栈

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14+ | React框架，服务端渲染 |
| React | 18+ | UI组件库 |
| Tailwind CSS | 3+ | 样式框架 |
| ECharts | 5+ | 数据可视化 |
| Lucide React | 0.29+ | 图标库 |
| Axios | 1.6+ | HTTP客户端 |

### 后端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| FastAPI | 0.104+ | Python Web框架 |
| SQLAlchemy | 2.0+ | ORM数据库操作 |
| SQLite | 3+ | 轻量级数据库 |
| Redis | 7+ | 缓存服务 |
| JWT | - | 身份认证 |
| scikit-bio | 0.5+ | 生物信息分析 |

### AI/ML技术

| 技术 | 版本 | 用途 |
|------|------|------|
| PyTorch | 2.1+ | 深度学习框架 |
| NumPy | 1.24+ | 数值计算 |
| Pandas | 2.1+ | 数据处理 |
| SHAP | 0.45+ | 模型可解释性 |
| LIME | 0.2+ | 局部可解释性 |

### DevOps

| 技术 | 用途 |
|------|------|
| Docker | 容器化部署 |
| Docker Compose | 多服务编排 |
| Git | 版本控制 |

---

## ✨ 核心功能

### 1. 用户管理

- **注册/登录**: JWT认证，安全可靠
- **档案编辑**: 个人信息、目标设置、偏好管理
- **权限控制**: RBAC细粒度权限管理

### 2. 食物日志

- **饮食记录**: 记录每日食物摄入
- **营养计算**: 自动计算热量和营养素摄入量
- **历史追踪**: 查看饮食历史和趋势

### 3. 营养分析

- **摄入量分析**: 对比用户摄入与推荐值
- **营养预警**: 识别潜在的营养素缺乏
- **个性化建议**: 根据用户特征提供饮食建议

### 4. AI预测

- **代谢响应预测**: 预测食物对用户代谢的影响
- **健康风险评估**: 评估慢性病风险
- **可解释性分析**: SHAP/LIME特征重要性展示

### 5. 组学数据管理

- **基因组数据**: 基因检测结果上传和分析
- **微生物组数据**: 肠道菌群分析
- **代谢组数据**: 代谢物浓度检测和分析

### 6. 数据可视化

- **代谢路径图**: 交互式代谢途径展示
- **统计图表**: 营养摄入、代谢指标可视化
- **个性化仪表盘**: 用户数据概览

---

## 🚀 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+
- Docker (可选)

### 本地运行

#### 1. 克隆项目

```bash
git clone https://github.com/ElijahZhao/MetaNutri---AI-.git
cd metanutri
```

#### 2. 启动后端服务

```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

后端服务将在 `http://localhost:8000` 启动，API文档地址：`http://localhost:8000/docs`

#### 3. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 `http://localhost:3000` 启动

### Docker一键启动

```bash
docker-compose up -d
```

服务启动后：
- 前端: `http://localhost:3000`
- 后端: `http://localhost:8000`
- Redis: `http://localhost:6379`

### 导入示例数据

```bash
cd backend
python -m app.scripts.import_sample_data
```

---

## 📁 项目结构

```
metanutri/
├── backend/                    # 后端服务
│   ├── app/                    # 应用代码
│   │   ├── api/                # API路由
│   │   │   ├── auth.py         # 认证接口
│   │   │   ├── users.py        # 用户管理
│   │   │   ├── food_logs.py    # 食物日志
│   │   │   ├── nutrition.py    # 营养分析
│   │   │   ├── genomics.py     # 基因组数据
│   │   │   ├── microbiome.py   # 微生物组数据
│   │   │   ├── metabolomics.py # 代谢组数据
│   │   │   ├── predictions.py  # AI预测
│   │   │   ├── import_export.py# 数据导入导出
│   │   │   └── nutrition_alerts.py # 营养预警
│   │   ├── core/               # 核心配置
│   │   │   ├── config.py       # 配置管理
│   │   │   ├── security.py     # 安全设置
│   │   │   └── database.py     # 数据库连接
│   │   ├── crud/               # CRUD操作
│   │   │   ├── users.py        # 用户CRUD
│   │   │   ├── food_logs.py    # 食物日志CRUD
│   │   │   └── ...             # 其他CRUD
│   │   ├── models/             # 数据库模型
│   │   │   ├── user.py         # 用户模型
│   │   │   ├── food_log.py     # 食物日志模型
│   │   │   └── ...             # 其他模型
│   │   ├── schemas/            # Pydantic Schema
│   │   │   ├── user.py         # 用户Schema
│   │   │   └── ...             # 其他Schema
│   │   ├── ml/                 # 机器学习模块
│   │   │   ├── models/         # 模型架构
│   │   │   │   ├── transformer.py   # 代谢响应Transformer
│   │   │   │   ├── gnn.py           # 基因营养GNN
│   │   │   │   └── vae.py           # 微生物组VAE
│   │   │   ├── weights/        # 模型权重
│   │   │   ├── predict.py      # 预测接口
│   │   │   └── explain.py      # SHAP/LIME解释
│   │   ├── scripts/            # 脚本工具
│   │   │   ├── import_sample_data.py # 示例数据导入
│   │   │   ├── dataset_downloader.py # 数据集下载器
│   │   │   └── generate_weights.py  # 权重生成
│   │   ├── main.py             # 应用入口
│   │   └── celery_worker.py    # 异步任务
│   ├── requirements.txt        # Python依赖
│   └── Dockerfile              # 后端Docker镜像
├── frontend/                   # 前端应用
│   ├── src/                    # 源码目录
│   │   ├── app/                # Next.js路由
│   │   │   ├── dashboard/      # 仪表盘页面
│   │   │   ├── food-log/       # 食物日志页面
│   │   │   ├── nutrition/      # 营养分析页面
│   │   │   ├── genomics/       # 基因组页面
│   │   │   ├── microbiome/     # 微生物组页面
│   │   │   ├── metabolomics/   # 代谢组页面
│   │   │   ├── profile/        # 用户档案页面
│   │   │   ├── explore/        # 探索页面
│   │   │   ├── meal-plan/      # 膳食计划页面
│   │   │   ├── login/          # 登录页面
│   │   │   └── register/       # 注册页面
│   │   ├── components/         # 通用组件
│   │   │   ├── Layout.jsx      # 布局组件
│   │   │   ├── Sidebar.jsx     # 侧边栏组件
│   │   │   ├── DashboardStats.jsx # 数据统计组件
│   │   │   ├── NutritionAlerts.jsx # 营养预警组件
│   │   │   ├── MetabolicPathway.jsx # 代谢路径可视化
│   │   │   ├── ChartCard.jsx   # 图表卡片组件
│   │   │   ├── FloatingElements.jsx # 浮动元素动画
│   │   │   ├── ScrollReveal.jsx # 滚动渐显动画
│   │   │   ├── TypeWriter.jsx  # 打字机效果
│   │   │   └── ParticleBackground.jsx # 粒子背景
│   │   ├── lib/                # 工具库
│   │   │   ├── api.js          # API客户端
│   │   │   ├── utils.js        # 工具函数
│   │   │   └── constants.js    # 常量定义
│   │   └── styles/             # 样式文件
│   │       └── globals.css     # 全局样式
│   ├── package.json            # npm依赖
│   ├── tailwind.config.js      # Tailwind配置
│   └── Dockerfile              # 前端Docker镜像
├── docker-compose.yml          # Docker Compose配置
├── .gitignore                  # Git忽略规则
├── LICENSE                     # 许可证文件
└── README.md                   # 项目说明文档
```

---

## 📡 API文档

### 基础URL

```
http://localhost:8000/api/v1/
```

### 认证接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /auth/login | 用户登录 |
| POST | /auth/register | 用户注册 |
| POST | /auth/refresh | 刷新Token |

### 用户接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /users/me | 获取当前用户信息 |
| PUT | /users/me | 更新用户信息 |
| DELETE | /users/me | 删除用户账号 |

### 食物日志接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /food-logs | 获取食物日志列表 |
| POST | /food-logs | 添加食物日志 |
| GET | /food-logs/{id} | 获取单条日志 |
| PUT | /food-logs/{id} | 更新日志 |
| DELETE | /food-logs/{id} | 删除日志 |

### 营养分析接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /nutrition/intake | 获取营养摄入统计 |
| GET | /nutrition/recommendations | 获取营养建议 |
| GET | /nutrition/alerts | 获取营养预警 |

### AI预测接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /predictions/metabolic-response | 预测代谢响应 |
| POST | /predictions/health-risk | 评估健康风险 |
| GET | /predictions/explain/{id} | 获取解释结果 |

### 完整API文档

访问 `http://localhost:8000/docs` 查看交互式API文档

---

## 🧠 AI模型

### 模型架构

#### 1. 代谢响应Transformer

```
输入: 食物成分 + 用户基因型 + 微生物组组成
输出: 代谢物浓度变化预测
架构: Transformer Encoder + MLP Head
```

#### 2. 基因营养GNN

```
输入: 基因-营养相互作用网络
输出: 营养素吸收效率预测
架构: GraphSAGE + Attention Mechanism
```

#### 3. 微生物组VAE

```
输入: 微生物组丰度数据
输出: 潜在空间表示 + 健康状态预测
架构: Variational Autoencoder
```

### 模型训练

```bash
cd backend
python -m app.ml.train --model transformer --epochs 100
```

### 模型权重

模型权重存储在 `backend/app/ml/weights/` 目录下，首次运行时会自动生成。

### 可解释性

使用SHAP和LIME分析模型预测的特征重要性：

```bash
cd backend
python -m app.ml.explain --model transformer --sample data.json
```

---

## 📊 数据集

### 内置数据集

| 数据集 | 来源 | 描述 |
|--------|------|------|
| USDA食物营养数据库 | USDA | 食物成分和营养信息 |
| KEGG代谢通路数据 | KEGG | 代谢通路和酶信息 |
| HMP参考数据 | HMP | 人类微生物组参考序列 |
| 代谢组学参考数据 | MetaboLights | 代谢物参考谱 |
| 基因-营养相互作用数据 | GWAS Catalog | 基因与营养的关联 |

### 数据集下载

```bash
cd backend
python -m app.scripts.dataset_downloader --all
```

### 数据导入

```bash
cd backend
python -m app.scripts.import_sample_data
```

---

## 👨‍💻 开发指南

### 代码规范

#### Python代码规范

- 使用PEP 8规范
- 使用type hints
- 使用async/await进行异步操作

#### JavaScript/React代码规范

- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 使用React Hooks

### 测试

#### 后端测试

```bash
cd backend
pytest tests/
```

#### 前端测试

```bash
cd frontend
npm test
```

### 代码提交规范

使用Conventional Commits格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

#### Commit类型

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 代码重构
- `test`: 测试更新
- `chore`: 构建/工具更新

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork项目
2. 创建功能分支: `git checkout -b feature/your-feature`
3. 提交更改: `git commit -m 'feat: add your feature'`
4. 推送到分支: `git push origin feature/your-feature`
5. 创建Pull Request

### 贡献者

- [ElijahZhao](https://github.com/ElijahZhao)

---

## 📄 许可证

项目采用 [MIT License](LICENSE)，允许自由使用、复制、修改和分发。

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交Issue: [GitHub Issues](https://github.com/ElijahZhao/MetaNutri---AI-/issues)
- 发送邮件: elijahzhao@gmail.com

---

**MetaNutri** - AI驱动的精准营养代谢数字孪生平台

Made with ❤️ by ByteDance AI Lab
