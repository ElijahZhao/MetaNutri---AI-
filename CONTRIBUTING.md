# 贡献指南

## 📋 贡献方式

Bug 报告、功能建议、代码改动和文档修订都欢迎，统一走 GitHub Issues 与 Pull Request。

## 🔧 开发环境设置

### 前置要求

- Python 3.11+（平台后端；**研究模块 `research/` 需 3.12+**，其 `numpy 2.5` / `pandas 3` 要求 `>=3.12`）
- Node.js 20.19+（`next@16` 及其依赖要求 `node >=20.19.0`）
- Git

### 步骤

1. **Fork 项目**

   在 GitHub 上点击 "Fork" 按钮创建项目的副本

2. **克隆项目**

   ```bash
   git clone https://github.com/ElijahZhao/MetaNutri---AI-.git
   cd MetaNutri---AI-
   ```

3. **添加上游仓库**

   ```bash
   git remote add upstream https://github.com/ElijahZhao/MetaNutri---AI-.git
   ```

4. **安装依赖**

   ```bash
   # 根目录：安装 husky 并激活 Git 钩子
   #（提交前对前端改动自动执行 eslint --fix + prettier）
   npm install

   # 前端：安装包含 lint-staged / eslint / prettier 在内的依赖
   cd frontend && npm install && cd ..

   # 后端
   cd backend && pip install -r requirements.txt && cd ..
   ```

5. **创建功能分支**

   ```bash
   git checkout -b feature/your-feature-name
   ```

## ✅ 代码规范

- **后端**：保持与现有代码风格一致。CI 会对 `app/` 执行 `python -m pytest`、`python -m compileall` 与导入冒烟测试。
- **前端**：ESLint + Prettier，由 husky + lint-staged 在提交前自动运行（见 `.husky/pre-commit`）；手动检查用 `npm run lint`。
- **提交信息**：沿用 Conventional Commits，本仓库历史提交即为此格式，如 `fix(backend): ...`、`docs: ...`。

## 📝 Pull Request 流程

1. **提交代码**

   ```bash
   git add .
   git commit -m 'feat: add your feature'
   git push origin feature/your-feature-name
   ```

2. **创建 Pull Request**

   在 GitHub 上创建 Pull Request，填写以下信息：

   - 标题：简洁描述更改内容
   - 描述：详细说明更改的目的、实现方式和测试情况
   - 关联的 Issue（如果有）

3. **代码审查**

   项目维护者会审查您的代码，可能会提出修改建议。请根据建议进行修改并重新提交。

4. **合并**

   代码审查通过后，项目维护者会将您的代码合并到主分支。

## 🧪 测试

### 后端测试

```bash
cd backend
pip install -r requirements.txt -r requirements-dev.txt
python -m pytest -q    # tests/：单元 + API 测试
```

`tests/` 覆盖密码哈希与 JWT（`test_security.py`）、配置校验（`test_config.py`）
与导入接口的校验分支（`test_import_export_api.py`），不需要数据库、Redis 或网络。
CI 另外执行语法检查与导入冒烟：

```bash
python -m compileall -q app
SECRET_KEY=ci-smoke-test-key python -c "from app.main import app; print('FastAPI app OK:', app.title)"
```

### 前端测试

```bash
cd frontend
npm run typecheck
npm run lint
npm test            # Vitest 单元测试
npm run test:e2e    # Playwright 端到端（需先 npm run build）
```

### 研究模块测试

研究模块的运行依赖（Streamlit Demo）+ 开发工具（ruff / pytest）：

```bash
cd research
pip install -r app/requirements.txt -r requirements-dev.txt

ruff check src app          # 代码检查
pytest --cov                # 单元测试 + Streamlit AppTest，覆盖率门槛 90%
```

测试包含两部分：`app/tests/test_inference.py` 覆盖预测/TreeSHAP 数学，
`app/test_app.py` 用 Streamlit 自带 `AppTest` 无头启动整个 UI。**无需服务器、
无需网络、无需训练**（用的是 `app/model/` 里冻结的模型）。

以上三项（backend / frontend / research）都会在 CI 中运行；见
[`.github/workflows/ci.yml`](.github/workflows/ci.yml)。研究管线的完整复现见
[`research/README.md`](research/README.md)。

确保所有检查通过后再提交 Pull Request。

## 📄 文档

如果您的更改涉及新功能或 API 变更，请更新相关文档：

- README.md
- docs/ 目录下的文档

## 💬 沟通

- 对于问题和讨论，请使用 GitHub Issues
- 对于紧急问题，可以发送邮件到 yulinzhao04@gmail.com 或 550568658@qq.com

## 📜 许可证

通过提交代码，您同意您的贡献将采用项目的 MIT 许可证。
