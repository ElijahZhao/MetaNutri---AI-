# MetaNutri 审计与修复记录

> 范围：仓库全量文件、依赖与构建配置、后端路由与源码、前端组件与工程配置、CI/部署配置、
> 认证与限流逻辑、版本库卫生、i18n 与 schema 对齐、数据文件与生成器一致性、前后端接口对账、
> 容器构建上下文与镜像卫生、研究模块。
> 本文件记录已处理的问题与结论，供维护者与审查者参考。

---

## 1. 平台修复清单

| # | 事项 | 优先级 | 处置 |
|---|------|--------|------|
| 1 | `requirements.txt` 补 `scikit-learn` | 高 | 已加 `scikit-learn==1.5.1`；两份 README 技术栈表同步 |
| 2 | `docs/API.md` 食物接口鉴权标错 | 高 | 已改为「需登录」（`/api/foods/search`、`/api/foods/{id}` 实际均需登录） |
| 3 | `docker-compose.yml` 前端代理地址错误 | 高 | 已改为 `http://backend:8000`（容器间用服务名） |
| 4 | 客户端 IP 取值不一致 | 中 | `auth.py` 复用 `rate_limit.client_ip`，与全局限流口径统一 |
| 5 | `.env.example` 的 `SECRET_KEY` 绕过保护 | 中 | 占位值与哨兵值一致并强化注释，避免照抄示例即用弱密钥 |
| 6 | 两份 README 技术栈/结构失真 | 中 | 已修（i18next→Custom i18n、python-jose 3.5、Redis 去重、scikit-learn、Node ≥20.19、Supabase 描述、`(auth)`、`src/proxy.ts`、axios 描述） |
| 7 | `CONTRIBUTING.md` 与实际不符 | 中 | 已修（Python 3.11+/Node 20.19+、真实克隆地址、CI 冒烟命令替换不存在的 `pytest tests/`） |
| 8 | `DEPLOYMENT.md` 架构过时且缺保活 | 中 | 已改为同源代理架构图与说明，新增「保活（Render 免费层）」章节 |
| 9 | 环境变量文档缺口 | 中 | `.env.example` 与 `DEPLOYMENT.md` 补齐 `CORS_ORIGINS`/`FRONTEND_URL`/`ALLOW_DEFAULT_SECRET_KEY`/`NEXT_PUBLIC_SITE_URL` |
| 10 | KEGG 数据三方漂移 | 中 | 重生成 `kegg_pathways.json` 为 `{"name","prefix"}`，与生成器/`DATASETS.md` 一致 |
| 11 | `/api/datasets/categories` 未鉴权 | 中 | 已补 `Depends(get_current_active_user)` |
| 12 | 前端 `/api/datasets` 与后端路由尾斜杠不一致 | 中 | 后端改为 `@router.get("")`（规范路径 `/api/datasets`，无尾斜杠）、前端改回 `/api/datasets` |
| 13 | 孤立设计文档 | 低 | 已删除 `2026-07-17-metanutri-design.md` |
| 14 | RBAC 死架构（三处） | 低 | 删除 `services/rbac_service.py`、`models/rbac.py`；`schema.sql` 移除 4 张 RBAC 表与种子 |
| 15 | Bearer 遗留命名 | 低 | 有意保留：`oauth2_scheme` 仍作为 Authorization 头回退（`security.py:73`）；`token_type="bearer"` 被前端类型与 e2e mock 使用，改动会破坏测试 |
| 16 | 未加载权重与加载函数 | 低 | 有意保留（README 已注明为「研究代码；线上 API 用确定性启发式」）；仅移除 `predict.py` 中未使用的 `get_predictor` 导入 |
| 17 | 其它死代码 | 低 | 删除 `ml/microbiome_analysis.py`；移除 `content.tsx` 的 `console.log`；移除 `datasets.py` 未使用的 `db` 参数 |
| 18 | `.gitignore` 无效否定规则 | 低 | 已移除空操作 `!backend/app/ml/weights/` |
| 19 | `models/__init__.py` 聚合不全 | 低 | 已补 `MetabolomicsData` / `MetabolomicsPathway` |
| 20 | `model_cache` 无效挂载 | 低 | 已移除挂载与卷定义 |
| 21 | `.gitignore` 未忽略 PID/截图 | 低 | 已加 `.backend.pid`/`.frontend.pid`/`.screenshots/`/`venv/`/`.venv/` |
| 22 | 缺 `.dockerignore` | 中 | 新增根级与 `frontend/` 的 `.dockerignore` |
| 23 | compose 用生产镜像跑 `npm run dev` | 中 | 新增 `frontend/Dockerfile.dev`，compose 改用之 |
| 24 | 5 个模型文件未使用 `UUID` 导入 | 低 | 已删除 5 行导入 |
| 25 | PR 模板贡献指南链接失效 | 低 | 已改为 `../../CONTRIBUTING.md` |
| 26 | 缺 favicon/robots/sitemap | 低 | 新增 `app/icon.svg`、`app/robots.ts`、`app/sitemap.ts` |
| 27 | Vercel 区域不一致 | 低 | 确认 Render 后端在 Singapore 后，`vercel.json` 的 `regions` 由 `iad1` 改为 `sin1`，`DEPLOYMENT.md` 同步 |
| 28 | CSRF 防护核查 | 高 | 已专项取证（见 §3）：防护充分，无阻断项；1 处配置隐患（`COOKIE_SAMESITE=none`）已加启动硬失败 |
| 29 | `.deploy/ppgr-predictor` 被当作 gitlink 提交但无 `.gitmodules` | 中 | 已 `git rm --cached` 并加入 `.gitignore`（该目录是部署仓库的本地镜像，非子模块） |
| 30 | 根目录遗留 `ppgr-predictor-space.zip` 被跟踪 | 低 | 已取消跟踪并加入 `.gitignore`；方案弃用后该产物已彻底删除 |

**验证**
- 后端：`python -m compileall -q app` 通过；`backend/data/kegg_pathways.json` JSON 解析通过（8 条、键 `name`/`prefix`）。
- 前端：`npm ci` → `npm run typecheck` ✅、`npm run lint`（0 error）✅、`npm test` ✅、`npm run build` ✅（静态路由 `/icon.svg`、`/robots.txt`、`/sitemap.xml` 均成功生成）。
- 全仓库检索确认无对已删除模块（`rbac_service`、`models.rbac`、`microbiome_analysis`）的残留引用。
- 尾斜杠复验：无法直连 Vercel 域名（TLS 被中间代理中断），改用本地 `next dev` + mock 后端复现同源代理行为——旧写法 `GET /api/datasets/` → **308** 去尾斜杠、随后后端再 **307** 跳到绝对后端地址；新写法 `GET /api/datasets` → **200**，直接命中代理目标、无任何跳转。因此「前端加尾斜杠」的方案无效，已改为**后端规范为无尾斜杠**；`docs/API.md`、`docs/DATASETS.md` 同步为 `/api/datasets`。
- 后端完整导入冒烟交由 CI（`.github/workflows/ci.yml` 的 `python -c "from app.main import app"`）复核。

---

## 2. 研究模块 / 基础设施 / 平台安全修复

### 2.1 研究模块与基础设施

| # | 问题 | 证据 | 处置 |
|---|------|------|------|
| R1 | `experiments/results.csv` 中 `mean` 基线的 `within_r` 无法由代码复现：`within_between()` 对「受试者内恒定」的预测返回 `NaN`，而 CSV 与报告 §4.5 记录为 `0.0` | `research/src/evaluate.py` vs `research/experiments/results.csv` | 明确约定：受试者内恒定预测记 `0.0`（并写入 docstring），代码与 CSV/报告三者一致 |
| R2 | 外部验证的「内部参照」样本量不一致：`external_validate.py` 用**全部 1699 餐**，报告 §4.2 用 `iauc>0` 过滤后的 **1557 餐** | `research/src/external_validate.py`；报告表 4 | 在脚本 docstring 与报告表 4 加注说明。**未改数值**（数据集不随仓库提交，改过滤会再次造成 `external_results.csv` 不可复现） |
| I1 | GitHub Actions 未声明 `permissions`，默认 `GITHUB_TOKEN` 权限偏大 | `.github/workflows/ci.yml`、`health-check.yml` | 两处均补 `permissions: contents: read` |

### 2.2 平台安全修复（最小改动、不动业务逻辑）

| # | 问题 | 影响 | 处置 |
|---|------|------|------|
| S1 | `/api/auth/forgot-password` 对已注册邮箱**直接返回 `reset_token`**，前端还渲染该令牌与重置表单 | 任意人输入他人邮箱即可拿到令牌并改密码（**账号接管**），同时构成**用户枚举** | 新增配置 `PASSWORD_RESET_RETURN_TOKEN`（默认 `false`）；仅本地开发显式开启时才回传令牌，且已注册/未注册邮箱的响应完全一致 |
| S2 | `COOKIE_SAMESITE=none` 会一次性移除本项目**唯一**的 CSRF 防线，且无 token / Origin 兜底（§3 已记录） | 换成跨站直连后，任意站点可让受害者浏览器携带 cookie 发写请求 | 启动时若 `COOKIE_SAMESITE=none` 且未设 `ALLOW_INSECURE_SAMESITE_NONE=1`，直接硬失败（与 `SECRET_KEY` 硬失败同风格） |

配套项（S1）：前端 `forgot-password` 页面原本**不读取** URL 上的 `?token=` 查询参数——令牌在 `content.tsx` 中只来自接口响应，而 `page.tsx` 只做透传，因此后端（`PASSWORD_RESET_RETURN_TOKEN=true` 时）拼出的 `reset_url` 落到 `/forgot-password?token=...` 后不会被使用。现已让 `content.tsx` 经 `useSearchParams()` 读取该参数：带 `token` 时跳过邮箱步骤、直接展示「设置新密码」表单且不回显原始令牌；`page.tsx` 相应包一层 `<Suspense>` 以满足 Next.js 对 `useSearchParams` 的预渲染要求。新增回归测试 `content.test.tsx`，`next build` 与全量单测通过。

---

## 3. CSRF 专项核查

### 3.1 结论

**现有防护是充分的，不存在可直接利用的 CSRF 漏洞，不构成公开仓库的阻断项。**

但需明确两点限定：
1. 本项目认证**确实**由 Cookie 承载，所以 CSRF 在这里是**真问题**，不是可以跳过的那一类；
2. 整条防线目前只由**一个配置项**（`COOKIE_SAMESITE`）承担，代码里又把「改成 `none`」作为一种可选配置提供——这是唯一需要留意的隐患（现已加启动硬失败，见 §2.2 S2）。

### 3.2 证据

**① 认证由 Cookie 承载 → CSRF 成立，必须核**

- `backend/app/core/security.py:16-22`：浏览器把 JWT 放在 httpOnly cookie（`metanutri_access` / `metanutri_refresh`）；`security.py:82` `token = token or request.cookies.get(ACCESS_TOKEN_COOKIE)`。
- 反例对照：若认证只走 `Authorization` 头（浏览器不会自动携带），CSRF 天然不成立。本项目**不是**这种情况。

**② 主防线：`SameSite=Lax`（默认值）**

- `backend/app/core/config.py` `COOKIE_SAMESITE: str = "lax"`、`COOKIE_SECURE: bool = True`。
- `backend/app/api/auth.py` 的 `_cookie_kwargs()` 将 `httponly` / `secure` / `samesite` 落到两个 cookie 上。
- 效果：跨站发起的 POST/PUT/PATCH/DELETE **不会携带**该 cookie，攻击者站点无法借用受害者登录态写数据。

**③ 放大器：前端同源代理，使 Lax 得以成立（无需放宽 SameSite）**

- `frontend/next.config.ts` 把 `/api/:path*` 与 `/health` 重写到后端；前端 `baseURL` 为空（相对路径）。
- 浏览器侧始终是**同源**请求，cookie 是第一方，因此**不需要**为跨域把 SameSite 放宽到 `none`。

**④ CORS 收敛（不依赖通配符）**

- `backend/app/main.py`：显式 origin 列表 + `allow_origin_regex=^https://([a-z0-9-]+\.)*vercel\.app$`，`allow_credentials=True`。

**⑤ 关键前提：写操作全在非 GET 方法上，GET 无副作用**

`SameSite=Lax` 仍会在「顶级 GET 导航」时携带 cookie，所以只要存在会写库的 GET，Lax 就挡不住。

- 全量清点 `backend/app/api/*.py`：**43 条路由 = 20 条 GET + 23 条写操作（POST/PUT/DELETE）**。
- 以 `db.commit()` 作为**持久化判据**逐条定位：全仓库共 **28 处**写入调用（`db.add` / `db.add_all` / `db.commit` / `db.delete` / `db.flush`），**28 处全部落在 POST/PUT/DELETE 处理器内，无一落在 GET 处理器内**（`auth.py`、`genomic.py`、`import_export.py`、`datasets.py`、`metabolomics.py`、`recommendation.py`、`users.py`、`microbiome.py`）。
- 20 条 GET 全部为读取；对其中最可能产生副作用的 `GET /api/metabolomics/analysis` 读了完整实现确认：只 `SELECT` + 内存计算，不写库。
- `datasets.py` 中看似「触发下载/导入」的路径**全部是 POST**。
- 因此：**不存在可被 Lax 放行的写操作 GET**。

### 3.3 隐患（唯一一项，已处置）

**`COOKIE_SAMESITE=none` 会一次性移除全部 CSRF 防护，且没有补偿控制。**

- 仓库中**不存在第二道防线**：全仓库检索 `csrf` / `origin` / `referer` 无任何命中——没有 CSRF token、没有 double-submit cookie、没有 Origin/Referer 校验中间件。
- 危险组合：若为「前端换域名直连后端」而设 `COOKIE_SAMESITE=none`，任意站点都能让受害者浏览器带上 cookie 发请求；而 `main.py` 的 `allow_origin_regex` **放行了全部 `*.vercel.app`**（任何人都可免费注册）。两者叠加即为可利用的 CSRF。
- **当前未触发**：默认 `lax`，且前端走同源代理。
- 处置：启动时若 `COOKIE_SAMESITE=none` 且未设 `ALLOW_INSECURE_SAMESITE_NONE=1`，直接硬失败（`backend/app/core/config.py`）。

### 3.4 已核、不构成问题

- `POST /api/auth/logout` 不要求有效 token：有意为之（过期会话也要能清 cookie）。「登出 CSRF」影响极低，且跨站 POST 本就带不上 cookie。
- `POST /api/auth/refresh`：刷新即轮换 + 复用即失效，不构成固定会话风险。
- Cookie 无 `Domain` → host-only，减少子域写入面。未使用 `__Host-` 前缀属可选加固。

### 3.5 判定

- **是否阻断公开仓库：否。** CSRF 取决于**运行中的部署**，与仓库可见性无关；默认配置是安全的。
- **已交接的**：`COOKIE_SAMESITE=none` 这一配置陷阱现已由启动硬失败覆盖。

---

## 4. 缺陷修缮与死代码清理

### 4.1 后端（A 线缺陷 → 修缮，不新增功能）

| # | 严重度 | 问题 | 处置 |
|---|--------|------|------|
| D1 | 中 | `FeatureContributionExplainer` 用**固定切片** `sorted_contributions[-3:]` 充当「负面因素」，不判正负。血糖路径输入全为正 → 把「最小的正贡献」标成**主要负面因素**（用户可见的误导） | 改为**按贡献正负分组**；量级排序天然使「最负」居首 |
| D2 | 低 | `calculate_confidence` 以 `len(input_data)` 为分母，空字典即 `ZeroDivisionError` | 空输入直接返回基准置信度 `0.6` |
| D3 | 中 | `nutrient-absorption` 用 `np.random.uniform` 抖动吸收率 → 同一请求结果不稳定 | 改为**确定性剂量-吸收曲线**（剂量饱和）；README / README.zh-CN / `docs/API.md` 表述同步修正 |
| D4 | 低 | `SHAPExplainer` / `LIMEExplainer` 为**死代码**（无任何端点引用）；后者还用 `np.random.uniform` 伪造贡献 | 删除。该模块不再依赖 numpy/pandas/shap/sklearn，成为纯标准库模块 |
| D5 | 低 | 随 D4，`shap==0.46.0`、`scikit-learn==1.5.1`、`scipy==1.14.0` 在 `backend/` **完全无引用** | 从 `backend/requirements.txt` 移除，缩小镜像与供应链面 |
| D6 | 低 | 后端镜像**以 root 运行**（前端镜像已降权） | 新增非 root 用户并 `chown /app` 后 `USER appuser` |
| D7 | 低 | `.dockerignore` **未排除 `research/`**（含 `.venv` 与本地数据集） | 补 `research`、`**/.venv`、`**/.next`、`**/coverage` 等规则 |
| D8 | 中 | `/api/metabolomics/analysis` 用 `np.random.uniform` 生成 `enrichment_score` 与 **`p_value`** → 每次请求给出**随机 p 值**，前端还以 `p=...` 渲染（**伪统计量被当作显著性展示**） | 改为**确定性**：`enrichment_score` = 观测/期望计数比，`p_value` = 其单调函数；字段与类型不变，前端零改动；`docs/API.md` 标注为启发式、非统计检验 |

**确认健康（有证据）**：`npm audit --omit=dev` = **0 漏洞**；`frontend/src` 无任何 XSS 落点（`dangerouslySetInnerHTML` / `innerHTML` / `eval` / `new Function` / `document.write` 均 0 命中）；全库无 `TODO/FIXME/HACK`；未跟踪任何密钥（仅 `.env.example`）；模型加载一律 `torch.load(weights_only=True)`；`users` / `metabolomics` / `recommendation` / `import_export` 均按 `user_id == current_user.id` 过滤；限流、CSP 与安全响应头、CI `permissions: contents: read` 均在位。

**验证**：`python -m compileall -q app` 通过；`explainability.py` 已无第三方依赖，以纯 Python 断言其正负号分组（全正输入时 `top_negative` 为空）与空输入置信度，均通过。

### 4.2 前端 API 契约 / 死代码二次清理

| # | 严重度 | 问题 | 处置 |
|---|--------|------|------|
| P1 | 高 | **修改密码 / 重置密码接口不可用**：前端请求体用 camelCase（`oldPassword`/`newPassword`），后端 pydantic 模型为 snake_case（`old_password`/`new_password`）→ 每次调用都 422 | 前端改为 `old_password`/`new_password` |
| P2 | 高 | **个人资料无法保存**：表单把 `dietary_goals`/`dietary_restrictions` 作为**字符串数组**提交，而后端 schema 为 `Optional[dict]`、DB 为 JSONB 字典 → 每次保存都 422；反向读取还会抛异常 | 前端在回填/提交处做 dict↔array 转换，与既有 schema 一致 |
| P3 | 低 | 后端 47 处未使用导入（F401）、8 处无占位符 f-string（F541）、1 处未使用局部变量（F841） | 全部清除；`ruff check app --select F` 已 **All checks passed** |
| P4 | 低 | 前端 `datasetAPI` 三个**未被调用**的方法返回类型与后端不符（`categories` / `tianchiSearch` / `tianchiDetail`） | 修正类型标注（仅类型层，无行为变化） |

**验证**：后端 `python -m compileall -q app` 通过、`ruff check app --select F` 通过；前端 `npm run typecheck`、`npm run lint`（0 error）、`npm test`、`npm run build`（20 条静态路由全部生成）均通过。

---

## 5. 已确认健康（无需处理）

- `backend/Dockerfile`、`frontend/Dockerfile`：动态端口 / standalone 入口与配置一致。
- **`backend/schema.sql` 与模型一致**：7 张在用表（users / user_profiles / genomic_data / microbiome_data / metabolomics_data / metabolomics_pathways / food_nutrition / nutrition_recommendations）的列名、类型、可空性、索引与 `backend/app/models/` 下的 SQLAlchemy 定义逐列吻合。
- **文档相对链接有效**：`README.md` / `README.zh-CN.md`、`docs/API.md`、`docs/DATASETS.md`、`CODE_OF_CONDUCT.md` 的相对链接全部指向存在的文件。
- **无硬编码凭据**：全仓库扫描未发现 `sk-*` / `AKID*` / `BEGIN ... PRIVATE KEY` 等密钥；出现的 `metanutri-backend.onrender.com`、`*.supabase.com` 均为部署文档与 `health-check.yml` 中的公开地址，非凭据。
- **静态资源引用有效**：`frontend/public/.gitkeep` 已被跟踪；`docs/assets/banner.jpg` 被两份 README 引用，非死文件。
- **受保护路由为双层**：`(app)/layout.tsx` 挂客户端 `ProtectedRoute` 守卫 + 后端 Cookie 鉴权。
- `.github/workflows/ci.yml`：前端 typecheck+lint+test+build、e2e、后端 compileall+import 冒烟，覆盖充分。
- `frontend/playwright.config.ts`、`frontend/vitest.config.mjs`：与 standalone 输出匹配。
- `.github/workflows/health-check.yml`：已从定时保活重构为 push/dispatch 健康检查，保活交由外部 cron。
- `frontend/next.config.ts` 的 `/api` + `/health` rewrites、CSP、`backendWarmup.ts` 前端预热：同源代理与冷启动 UX 完整、自洽。
- **前后端接口对账**：前端 `frontend/src/lib/api.ts` 的 40+ 个调用与后端 43 条路由**逐条对应**。
- `frontend/src/lib/i18n.tsx`：`const zh: Translations`（`Translations = typeof en`），中英键值由 TypeScript 编译期强制一致，**不存在运行时缺键风险**。
- `backend/app/schemas/` 的 5 个文件全部被 API 引用，无孤立 schema。
- 前端 17 个组件全部被引用，无孤立组件。
- 认证与限流源码复核通过：`security.py`（access/refresh 类型区分、Cookie 优先、登出用哨兵值失效）、`auth.py`（refresh 轮换 + 复用即失效 + 401 同时清 Cookie）、`redis.py`（Redis 不可用时内存兜底）、`db/session.py`（按数据库类型条件化连接池）。
- 版本库卫生：未被误提交 `.db` / `.env` / 密钥 / `node_modules` / 构建产物。

---

## 6. 有意保留 / 记录待议

- `predict.py` 请求体 `user_id` 必填却被忽略（实际用 `current_user.id`）——**不是越权、无数据泄漏**，仅 API 语义冗余；改动需前后端联动，记录待议。
- GitHub Actions 仍以可变 major tag（`@v4` / `@v5`）引用第三方 Action；由 Dependabot 跟进。
- `/meal-plan` 页面把 `recommendationAPI.mealPlan()` 的返回值强转为分组对象，因此**生成后不会渲染任何菜品**；且该页图表/合计值为静态演示数据，页面亦未出现在导航栏。修复需重设计该页的数据映射，属「扩展」范畴，留待后续。
- `/api/datasets/import/{id}` 仅支持 `usda`/`sample`/`hmp`/`metabolomics`/`microbiome_samples`，其余 4 个（kegg / gene_nutrition / dietary_guidelines / disease_markers）会返回 404；新增导入分支属新增功能，未做。
- 数据集下载器与天池客户端为**演示占位**，按平台冻结约束**不改代码**，仅在 README / `docs/API.md` / `docs/DATASETS.md` 标注。
