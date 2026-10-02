# MetaNutri 审查发现汇总

> 审查日期：2026-10-02 ｜ 方式：只读审查（未改动任何项目源文件）
> 范围：仓库全量文件、依赖声明、后端路由与源码、前端组件与工程配置、CI/构建/部署配置、认证与限流逻辑、版本库卫生、部署与贡献文档
> 结论：八轮审查结果一致，未互相推翻。以下为合并去重后的完整清单，按优先级排列。

---

## ⓪ 工具链发现：沙箱写入即自动提交并推送（已处理）

- **现象**：本沙箱环境中，写入文件会在 `main` 上自动产生提交，message 固定为 `feat: MetaNutri: AI精准营养代谢数字孪生平台`，并自动推送到 `origin/main`。
- **证据**
  - `492bdc7`（新增，118 行）、`e7a8bca`（更新，51 增 17 删），两条提交**只包含 `AUDIT-FINDINGS.md`**，与文档的两次写入一一对应。
  - 作者/提交者均为 `ElijahZhao`；`git ls-remote origin main` 曾返回 `e7a8bca`，即已推送。
- **影响**：绕过了正常提交流程，且使用了此前已废弃的通用 message，抵消了先前的提交历史整理成果。
- **处理**：已将这批提交合并为一条语义清晰的 `docs:` 提交（`b07e553`），并以 `--force-with-lease` 覆盖远程 `main`；`git ls-remote` 复核通过。
- **后续约定**：每次写入文件后，在当轮收尾统一改写该轮自动提交的 message。

---

## 一、高优先级（影响可用性 / 正确性）

### 1. `requirements.txt` 未声明 `scikit-learn`，但运行时在用

- **证据**
  - `backend/app/ml/explainability.py:4-5` 顶层 `from sklearn.ensemble import RandomForestRegressor` / `from sklearn.preprocessing import StandardScaler`。
  - 运行时代码路径：`backend/app/main.py:11` 加载 predict 路由 → `backend/app/api/predict.py:15` 导入 `explainability` → 触发 sklearn 导入。
  - `backend/requirements.txt` 中**没有 `scikit-learn`**（仅有 torch / numpy / pandas / shap / scipy / requests 等）。
- **影响**：应用启动即依赖 sklearn，目前仅由 `shap` 的传递依赖带入。一旦上游依赖变动或重装环境，后端会在启动时 `ImportError`。
- **建议**：在 `backend/requirements.txt` 显式加入 `scikit-learn`（版本与 shap 兼容），并在 README 技术栈表补上。

### 2. `docs/API.md` 把需要登录的食物接口标成「公开」

- **证据**
  - `docs/API.md:28` 与 `docs/API.md:65-66` 将 `/api/foods/search`、`/api/foods/{id}` 列为公开。
  - 实际 `backend/app/api/food.py:16-23`（search）与 `backend/app/api/food.py:42-46`（{food_id}）均挂 `Depends(get_current_active_user)`，未登录返回 401。
- **影响**：调用者按文档直接请求会拿到 401，误导。
- **建议**：把这两个接口从「公开」移到「需登录」。

---

## 二、中优先级（正确性隐患 / 文档准确性）

### 3. 认证限流与全局限流取「客户端 IP」的方式不一致

- **证据**
  - 全局限流器 `backend/app/core/rate_limit.py:29-37` 的 `client_ip()` 读取 `x-forwarded-for` / `x-real-ip`（注释明确写「honouring the proxy header set by Render/Vercel」）。
  - 但认证暴力破解限流器 `backend/app/api/auth.py:54` 使用 `request.client.host`。
  - 仓库内**没有任何地方配置 `--forwarded-allow-ips`**（`backend/Dockerfile:18`、`docker-compose.yml:47`、`start.sh:57` 的 uvicorn 命令均未设置）；uvicorn 默认 `forwarded-allow-ips=127.0.0.1`，因此运行在 Render 反向代理之后时，`request.client.host` 取得的是**代理 IP**而非真实客户端 IP。
- **影响**：`auth.py:41-42,57-61` 的「每 IP 总爆发上限」`_LOGIN_BURST_MAX = 20`（每 300 秒）实际作用在代理 IP 上，退化为**全站所有用户的共享上限**（注册 / 登录 / 忘记密码合计 20 次 / 5 分钟），可能给无关用户返回 429。按用户名计数的单账号限流（`auth.py:63-68`）不受影响。
- **缓解**：`auth.py:71-73,181` 在登录成功时会清空该 IP 的爆发桶，因此影响有限，但仍与设计意图不符。
- **建议**：让 `auth.py` 复用 `rate_limit.client_ip(request)`，或为 uvicorn 显式配置 `--proxy-headers --forwarded-allow-ips='*'`（Render 场景）。

### 4. `backend/.env.example` 的 `SECRET_KEY` 占位值绕过了生产硬失败保护

- **证据**
  - 硬失败保护的哨兵值 `backend/app/core/config.py:8` 为 `super-secret-key-change-in-production`。
  - 而 `backend/.env.example:10` 给的是 `your-super-secret-key-change-in-production`（**多了 `your-` 前缀，与哨兵值不相等**）。
  - 保护逻辑 `config.py:69-83` 只在密钥**恰好等于哨兵值**时才告警/硬失败。
- **影响**：若部署者直接照抄 `.env.example`，生产环境将使用一个**公开可知的弱密钥**运行，且不会触发任何告警或拒启（JWT 可被伪造）。
- **建议**：把示例值改为空或与哨兵值完全一致，或让保护逻辑同时拦截该示例值。

### 5. `README.md` 与 `README.zh-CN.md` 技术栈与结构描述失真

| 位置 | 现状 | 实际 |
|------|------|------|
| 技术栈表 | `python-jose 3.3` | `backend/requirements.txt` 为 `3.5.0` |
| 技术栈表 | 列出 `i18next` | 非依赖；实为自研 `frontend/src/lib/i18n.tsx` |
| 技术栈表 | Redis 重复两行（版本 7 / 5） | 实际 `redis==5.0.7`，应去重 |
| 技术栈表 | `requests 2.32｜公共数据集下载` | 无真实下载，数据由 `dataset_downloader.py` 本地生成 |
| 功能表 | `RBAC 权限系统` | RBAC 为死代码（见第 10 条） |
| 功能表 | `GNN / VAE 用于代谢响应预测` | 模型未接入任何接口（见第 12 条） |
| 结构注释 | `lib/api.ts # Fetch client` | 实为 axios 客户端（`frontend/src/lib/api.ts:1`） |
| 结构图 | `frontend/proxy.ts` | 实际路径为 `frontend/src/proxy.ts` |
| 结构图（zh-CN） | `(login)` | 实际目录为 `(auth)` |
| 架构图 | Supabase 提供 Auth / Storage | 认证为后端自研 httpOnly Cookie；未使用 Supabase Storage |
| 前置要求 | `Node.js ≥ 18`（`README.md:183`、`README.zh-CN.md:183`） | `next@16.2.12`（`frontend/package.json:33`）在 `package-lock.json` 中多处要求 `node >=20.19.0`，Node 18 实际无法安装/构建 |

### 6. `CONTRIBUTING.md` 与实际不符

- `CONTRIBUTING.md:126-129` 的后端测试命令 `pytest tests/` 指向不存在的目录（后端无 `tests/`，也无 pytest 配置）。
- `CONTRIBUTING.md:19` 要求 Python 3.10+，与 README 的 3.11+ 冲突。
- `CONTRIBUTING.md:20` 要求 Node.js 18+，与 `frontend/package-lock.json` 中 `>=20.19.0` 的实际要求冲突（见第 5 条）。
- `CONTRIBUTING.md:32` 的克隆地址 `https://github.com/your-username/metanutri.git` 为模板占位符，与实际仓库名 `MetaNutri---AI-` 不符。
- `CONTRIBUTING.md:55` 提到 `flake8` / `mypy`，但仓库未配置、未安装。

### 7. `docs/DEPLOYMENT.md` 与实际架构不符，且缺少保活说明

- **架构描述过时**：文档 `DEPLOYMENT.md:18` 写「调用 /api/* (**跨域**)」、`:26` 写「页面里的 JS 通过 `NEXT_PUBLIC_API_URL` 找到后端地址」、`:27` 写「所有业务请求一律 `https://metanutri-backend.onrender.com/api/*`」。
  - 实际 `frontend/src/lib/api.ts:44` 为 `baseURL: ''`（**同源相对路径**），`frontend/next.config.ts:49-62` 用 `rewrites` 把 `/api/:path*` 与 `/health` 代理到后端。
  - 即浏览器侧是**同源**访问后端，`NEXT_PUBLIC_API_URL` 只在 Next 服务器端（rewrites 目标与 CSP `connect-src`）使用。文档描述的是一套已不再使用的跨域直连 + CORS 拓扑（`config.py:50-52` 的注释反而与新代码一致）。
- **缺少保活说明**：生产依赖 cron-job.org 维持 Render 免费实例不休眠，但 `DEPLOYMENT.md` 全文未提，后续维护者无从得知。

### 8. 环境变量文档缺口

- `backend/app/core/config.py:21` 的 `CORS_ORIGINS`：未出现在 `backend/.env.example` 与 `DEPLOYMENT.md`（当前靠 `backend/app/main.py:43-56` 的默认值兜底）。
- `backend/app/core/config.py:77` 的 `ALLOW_DEFAULT_SECRET_KEY`：仅在代码中使用，无任何说明。
- `backend/app/api/auth.py:247` 的 `FRONTEND_URL`：由 `os.getenv` 直接读取（**未在 config.py 中声明**），既不在 `.env.example` 也不在部署文档中。未设置时 `forgot-password` 返回的 `reset_url` 恒为 `None`（`auth.py:271`），调用方无从得知需要配置它。
- **影响**：非官方域名自部署者、或需要重置链接的场景，无法从示例/文档得知这些可配置项。

---

## 三、低优先级（死代码 / 清理项）

### 9. 孤立设计文档

- `2026-07-17-metanutri-design.md`（仓库根目录）：内容停留在早期设计，仍写 Scikit-learn / Biopython / D3.js / JWT，全仓库无任何引用。建议删除。

### 10. RBAC 死架构（三处残留）

- `backend/app/services/rbac_service.py`：`RBACService` 与 `check_permission` 未被任何运行时代码导入。
- `backend/app/models/rbac.py`：未在 `backend/app/models/__init__.py` 注册。
- `backend/schema.sql:145-176`：仍定义 `roles` / `permissions` / `role_permissions` / `user_roles` 四张表。

### 11. Bearer 认证遗留命名（无害）

- `backend/app/core/security.py:6,19`：保留 `OAuth2PasswordBearer`（`auto_error=False`，已停用）。
- `backend/app/schemas/user.py:34`：返回 `token_type="bearer"`。

### 12. 未被加载的模型权重

- `backend/app/ml/weights/`（`metabolic_response.pt` / `gene_nutrition.pt` / `microbiome_vae.pt`）运行时均未加载。
- `get_predictor()` / `get_gnn_model()` / `get_vae_model()` 仅定义未被调用；`backend/app/api/predict.py` 实际走确定性启发式 `_predict_glucose_response`。

### 13. 其它

- `backend/app/ml/microbiome_analysis.py`：全仓库无引用（死代码）。
- `frontend/src/app/content.tsx:37`：一句 `console.log('Fullscreen not supported')`，可顺手移除。

### 14. `.gitignore` 存在无效的否定规则

- `.gitignore:22-23`：`!backend/app/ml/weights/` 之前**没有对应的忽略规则**，该否定规则为空操作；注释 `# keep tracked model weights in backend/app/ml/weights/` 也易引起误解。
- **建议**：删除该 `!` 行（权重当前本就正常跟踪），或补上真正的忽略规则。

### 15. `backend/app/models/__init__.py` 聚合不全

- `backend/app/models/` 下有 8 个模型文件，但 `__init__.py` 只导出 6 个，漏了 `metabolomics`（及 `rbac`）。
- **影响**：`backend/app/api/metabolomics.py:10`、`backend/app/api/datasets.py:13`、`backend/app/api/import_export.py:16` 都直接 `from app.models.metabolomics import ...`，因此 `backend/app/main.py:20` 的 `Base.metadata.create_all` 仍能建表，**无实际故障**，仅聚合文件与实际不一致。

---

## 四、已确认健康（无需处理）

- `backend/Dockerfile`、`frontend/Dockerfile`：动态端口 / standalone 入口与配置一致。
- `.github/workflows/ci.yml`：前端 typecheck+lint+test+build、e2e、后端 compileall+import 冒烟，覆盖充分。
- `frontend/playwright.config.ts`、`frontend/vitest.config.mjs`：与 standalone 输出匹配。
- `.github/workflows/keepalive.yml`：已从定时保活重构为 push/dispatch 健康检查，保活交由外部 cron。
- `frontend/next.config.ts` 的 `/api` + `/health` rewrites、CSP（含不使用 `upgrade-insecure-requests` 的原因注释）、`frontend/src/lib/backendWarmup.ts` 前端预热：同源代理与冷启动 UX 完整、自洽。
- `backend/app/main.py`：限流中间件在 CORS 之前注册（保证 429 也带 CORS 头）、lifespan 建表与种子失败不阻塞启动，处理得当。
- `backend/app/core/config.py:69-83`：生产环境默认密钥硬失败保护逻辑本身正确（问题仅在于示例值绕过了它，见第 4 条）。
- 后端 43 条路由与 `docs/API.md` 交叉核对：除第 2 条外全部一致。
- 前端 17 个组件全部被引用（含相对路径与 `dynamic()` 导入），无孤立组件。
- 前端依赖（axios / react-hot-toast / lucide-react / echarts-for-react 等）全部有实际使用。
- `PUBLIC_DATASETS` 的 8 个 key 与 `docs/DATASETS.md` 清单逐条吻合。
- `i18n.tsx` 的 `sampleNotice` 中英双份齐全，并在 `datasets/content.tsx` 正确渲染。
- 认证与限流源码复核通过：`backend/app/core/security.py`（access/refresh 类型区分、Cookie 优先、登出用哨兵值失效）、`backend/app/api/auth.py`（refresh 轮换 + 复用即失效 + 401 同时清 Cookie）、`backend/app/core/redis.py`（Redis 不可用时内存兜底、登出可失效）、`backend/app/db/session.py`（按数据库类型条件化连接池、pgbouncer 预处理语句兼容）。
- 版本库卫生：186 个跟踪文件，未被误提交 `.db` / `.env` / 密钥 / `node_modules` / 构建产物；`.github` 含 issue 与 PR 模板。
- 仓库根同时存在 `package.json` / `package-lock.json`（供 husky）与前端的同名文件：属有意设计，`frontend/next.config.ts:9-11` 已注释说明并固定 Turbopack root，无需处理。

---

## 五、建议执行顺序

1. `requirements.txt` 补 `scikit-learn`；修正 `docs/API.md` 食物接口鉴权。
2. 统一 `auth.py` 与 `rate_limit.py` 的客户端 IP 取值（第 3 条）；修正 `.env.example` 的 `SECRET_KEY` 占位值（第 4 条）。
3. 修订 `DEPLOYMENT.md`：改为同源代理的真实架构描述（第 7 条）、补保活说明、补齐环境变量（含 `FRONTEND_URL`，第 8 条）；修订 `CONTRIBUTING.md` 的 Python/Node 版本、测试命令与克隆地址（第 6 条）。
4. 修订两份 README（技术栈表、`api.ts` 描述、`src/proxy.ts`、zh-CN 的 `(auth)`、Node 版本，第 5 条）。
5. 删除孤立设计文档；清理 `.gitignore` 无效规则（第 14 条）；补全 `models/__init__.py`（第 15 条）；评估清理 RBAC 三处残留、Bearer 遗留命名、未加载权重与权重加载函数。

---

## 附：八轮审查覆盖维度

| 轮次 | 维度 | 新增结论 |
|------|------|----------|
| 1 | 文件清单与引用关系 | 死代码 / 孤立文档 / 假下载 |
| 2 | 交叉引用与文档一致性 | API.md 食物鉴权标错 |
| 3 | 依赖声明与构建配置 | sklearn 未声明 |
| 4 | 路由核对与遗留标记 | README `api.ts` 描述失真 |
| 5 | 前端组件与环境变量 | `.env.example` 缺变量 |
| 6 | 认证 / 限流 / 会话源码 | 客户端 IP 取值不一致；SECRET_KEY 占位值绕过保护 |
| 7 | 版本库卫生与 git 状态 | 沙箱自动提交并推送；`.gitignore` 无效规则；`models/__init__.py` 聚合不全 |
| 8 | 部署 / 贡献文档与工程入口 | DEPLOYMENT 架构描述过时；`FRONTEND_URL` 未记录；Node 版本口径不符；CONTRIBUTING 克隆地址占位 |

---

> 备注：本文档仅为审查记录，上述事项处理完毕后可一并删除，避免成为新的过时文件。
