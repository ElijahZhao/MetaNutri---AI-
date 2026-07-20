# 贡献指南

欢迎您为 MetaNutri 项目做出贡献！我们非常感谢您的帮助和支持。

## 📋 贡献方式

您可以通过以下方式为项目做出贡献：

1. **报告Bug**: 在 GitHub Issues 中提交问题报告
2. **提出功能请求**: 在 GitHub Issues 中提交功能建议
3. **提交代码**: 通过 Pull Request 提交代码更改
4. **改进文档**: 完善 README.md 或其他文档
5. **帮助用户**: 回答 GitHub Issues 中的问题

## 🔧 开发环境设置

### 前置要求

- Python 3.10+
- Node.js 18+
- Git

### 步骤

1. **Fork 项目**

   在 GitHub 上点击 "Fork" 按钮创建项目的副本

2. **克隆项目**

   ```bash
   git clone https://github.com/your-username/metanutri.git
   cd metanutri
   ```

3. **添加上游仓库**

   ```bash
   git remote add upstream https://github.com/ElijahZhao/MetaNutri---AI-.git
   ```

4. **创建功能分支**

   ```bash
   git checkout -b feature/your-feature-name
   ```

## ✅ 代码规范

### Python 代码规范

- 遵循 PEP 8 规范
- 使用 type hints
- 使用 async/await 进行异步操作
- 确保代码通过 `flake8` 和 `mypy` 检查

### JavaScript/React 代码规范

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 使用 React Hooks
- 确保代码通过 `npm run lint` 检查

### 提交信息规范

使用 Conventional Commits 格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

#### Commit 类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `test`: 测试更新
- `chore`: 构建/工具更新

#### 示例

```
feat(api): 添加营养预警接口

- 实现营养缺乏检测逻辑
- 添加预警等级分类
- 更新API文档
```

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
pytest tests/
```

### 前端测试

```bash
cd frontend
npm test
```

确保所有测试通过后再提交 Pull Request。

## 📄 文档

如果您的更改涉及新功能或 API 变更，请更新相关文档：

- README.md
- docs/ 目录下的文档

## 💬 沟通

- 对于问题和讨论，请使用 GitHub Issues
- 对于紧急问题，可以发送邮件到 elijahzhao@gmail.com

## 📜 许可证

通过提交代码，您同意您的贡献将采用项目的 MIT 许可证。

---

感谢您的贡献！🎉
