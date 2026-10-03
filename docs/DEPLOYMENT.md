# 部署指南（MetaNutri）

MetaNutri 采用三端分离的云原生架构。本文档说明**三者在生产环境的部署方式，以及它们之间如何连通**。

## 1. 生产架构总览

| 层 | 技术 | 托管平台 | 对外地址 |
|----|------|----------|----------|
| 前端 | Next.js 16 (App Router) | Vercel | https://meta-nutri-ai.vercel.app/ |
| 后端 | FastAPI (Async) + Uvicorn | Render (Web Service) | https://metanutri-backend.onrender.com |
| 数据库 | PostgreSQL | Supabase (DB + 连接池) | 见下 |

```
┌─────────────┐  HTTPS 同源 /api/*  ┌──────────────────────────┐
│  浏览器用户   │ ──────────────────►│  Vercel 前端 (Next.js)     │
│              │                    │  rewrites: /api/* → 后端   │
└─────────────┘                    └────────────┬─────────────┘
                                                │ 服务端代理（同源，浏览器无跨域）
                                                ▼
                                     ┌──────────────────────────┐
                                     │  Render 后端 (FastAPI/:PORT)│
                                     │  DATABASE_URL = pooler:5432 │
                                     └────────────┬─────────────┘
                                                  ▼
                                     ┌──────────────────────────┐
                                     │  Supabase PostgreSQL(pooler)│
                                     └──────────────────────────┘
```

### 三者如何连在一起（关键规则）

- **前端不直接连数据库**。浏览器只访问 Vercel 页面。
- **浏览器通过同源相对路径 `/api/*` 访问后端**：前端 axios 的 `baseURL` 为空（`frontend/src/lib/api.ts`），由 `frontend/next.config.ts` 的 `rewrites` 在 **Next 服务器端**把 `/api/:path*` 与 `/health` 代理到 `NEXT_PUBLIC_API_URL`。因此浏览器侧是**同源**访问，不存在跨域；`NEXT_PUBLIC_API_URL` 只在 Next 服务器端（rewrites 目标与 CSP `connect-src`）使用，**不含 `/api` 后缀**。
- **后端通过 `DATABASE_URL` 连 Supabase PostgreSQL**：走 **连接池（pooler）**，端口 **5432（会话模式 Session）**。
  - 为什么必须用 pooler：Render 服务器**没有 IPv6**，而 Supabase 直连主机名（`db.xxxx.supabase.co`）只解析 IPv6，无法直连。
  - 为什么用 5432 会话模式而不是 6543 事务模式：事务池（pgbouncer 串行复用连接）会与 asyncpg 的预编译语句缓存冲突，导致偶发 `prepared statement already exists` 500 错误。会话模式下后端已通过 `?prepared_statement_cache_size=0` 进一步规避。
- **认证采用 httpOnly Cookie**：登录成功后后端通过 `Set-Cookie` 下发 `metanutri_access` / `metanutri_refresh` 两个 **httpOnly Cookie**，浏览器自动随请求携带，无需在 JS 里手动附加 `Authorization` 头。刷新令牌每次使用都会轮换，且与 Redis 缓存校验，防重放。
- **CORS 白名单仅作兜底**：同源代理下浏览器不会触发跨域，但直接访问后端 API、Swagger 或非浏览器客户端仍受 CORS 约束。后端启用 `allow_credentials=True`（Cookie 必须），对 `*.vercel.app` 用 `allow_origin_regex` 放行，其余来源走 `CORS_ORIGINS` 精确列表。**不是** `allow_origins=["*"]`（通配符与 `allow_credentials=True` 互斥）。

---

## 2. 环境变量一览

> 配置前缀规则：前端（浏览器可见）用 `NEXT_PUBLIC_`；后端（服务器可见）不加前缀。**绝不要把数据库密码放进 `NEXT_PUBLIC_*`**。

### 后端（Render → Settings → Environment）

| 变量 | 值 | 说明 |
|------|----|------|
| `DATABASE_URL` | `postgresql://postgres.<PROJECT-REF>:<DB_PASSWORD>@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres` | **会话池(5432)**，IPv4 可解析；禁用预编译缓存 |
| `SECRET_KEY` | 一个高熵随机字符串 | JWT 签名密钥，生产必须改 |
| `CORS_ORIGINS` | `https://meta-nutri-ai.vercel.app` | 逗号分隔的浏览器来源白名单（可选）。同源代理下浏览器不触发 CORS，仅直接访问 API / Swagger 时需要；未设置时使用 `app/main.py` 的内置默认 |
| `FRONTEND_URL` | `https://meta-nutri-ai.vercel.app` | 拼接「忘记密码」重置链接用（仅在 `PASSWORD_RESET_RETURN_TOKEN=true` 时生效） |
| `PASSWORD_RESET_RETURN_TOKEN` | 不设置（默认 `false`） | `false` 时 `/api/auth/forgot-password` **不**返回重置令牌，需由邮件通道下发；设为 `true` 仅用于本地开发（无邮件服务） |
| `COOKIE_SAMESITE` | 不设置（默认 `lax`） | 设为 `none` 会移除唯一 CSRF 防线，后端将**拒绝启动**，除非同时设置 `ALLOW_INSECURE_SAMESITE_NONE=1` |
| `ALLOW_DEFAULT_SECRET_KEY` | 不设置 | 仅设为 `1` 时才允许在生产使用默认 `SECRET_KEY`；默认会在生产硬失败，避免弱密钥上线 |
| `PORT` | Render 自动注入（默认无） | Dockerfile 监听 `$PORT`，未设置则 8000 |

### 前端（Vercel → Project → Settings → Environment Variables）

| 变量 | 值 | 说明 |
|------|----|------|
| `NEXT_PUBLIC_API_URL` | `https://metanutri-backend.onrender.com` | 后端基础地址（**不含 `/api` 后缀**），仅供 Next 服务器端 rewrites / CSP 使用 |
| `NEXT_PUBLIC_SITE_URL` | `https://meta-nutri-ai.vercel.app` | 站点公开地址，用于 canonical / Open Graph / Twitter 元数据与 sitemap；未设置时回退到 Vercel 注入的 URL |

> 注意：`NEXT_PUBLIC_*` 会打进前端构建产物并暴露到浏览器，只放可公开的值。

### 数据库（Supabase）

- 数据库连接串在 **Project Settings → Database → Connection strings** 获取。
- 选择 **Session pooler**（端口 5432）的连接方式，填入后端 `DATABASE_URL`。
- `PROJECT-REF` 形如 `oazrwukqojbxqcnhergw`；`DB_PASSWORD` 为数据库访问密码。

---

## 3. 后端部署（Render）

1. [render.com](https://render.com) → **+ New → Web Service → Build & Deploy from a Repository** → 选择仓库。
2. **Settings → Docker**：`Dockerfile Path` = `backend/Dockerfile`。
3. **Settings → Environment**：填入上文后端变量（`DATABASE_URL`、`SECRET_KEY`）。
4. 部署完成后复制域名 `https://<service>.onrender.com`：
   - 验证健康：`GET https://<service>.onrender.com/health`，关注 `"database": "ok"`。
   - 前端 `NEXT_PUBLIC_API_URL` 填这个根地址。

> 部署坑：改完环境变量后选 **Save, rebuild, and deploy**（重建镜像），仅 Save 不生效。

---

## 4. 前端部署（Vercel）

1. 导入仓库 → **Root Directory = `frontend`**（Next.js 会自动识别）。
2. **Settings → Environment Variables**：`NEXT_PUBLIC_API_URL`。
3. 部署后发正式域名（例：`https://meta-nutri-ai.vercel.app/`）。

> `frontend/vercel.json` 已配置输出目录为 `.next`，可直接使用。
>
> **区域**：已按后端实际区域对齐——Render 后端部署在 **Singapore（东南亚）**（Vercel 对应区域代码 `sin1`），Supabase 在 `ap-southeast-2`（悉尼），故 `frontend/vercel.json` 的 `regions` 设为 `["sin1"]`，让同源代理就近执行。仅影响性能，不影响功能；若将来后端迁往其它区域，请同步调整此项。

---

## 5. 本地开发（Docker Compose）

在仓库根目录：

```bash
docker-compose up -d
```

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:3000 |
| 后端 | http://localhost:8000 |
| 数据库/Redis | `DATABASE_URL` / `REDIS_URL` 指向容器 |

本地默认后端用 SQLite（见 `app/core/config.py` 默认值），连线上 PostgreSQL 时通过 `DATABASE_URL` 环境变量切换。数据库表结构在启动时由 SQLAlchemy `Base.metadata.create_all` 自动创建（见 `app/main.py` lifespan）。

---

## 6. 保活（Render 免费层）

Render 免费 Web Service 在 **约 15 分钟无请求后进入休眠**，下一次请求会触发冷启动（可能等待数十秒）。生产环境通过 **外部定时器 cron-job.org** 每 10 分钟请求一次 `/health` 维持实例常驻：

- 任务 URL：`https://metanutri-backend.onrender.com/health`
- 频率：每 10 分钟
- 自定义请求头（用于在日志中识别）：`User-Agent: MetaNutriKeepAlive/1.0`

> 注意：免费的 750 实例小时/月按「实例运行时长」计，保活会让实例近乎全天运行（约 720 小时/月），仍在上限内；若同账号还有其它常驻服务，请留意总额度。
>
> 仓库中的 `.github/workflows/keepalive.yml` 已降级为 **push / 手动触发的健康检查**（该仓库的 GitHub Actions 定时任务不可靠），**不再**承担定时保活职责；定时保活由 cron-job.org 负责。

---

## 7. 常见排障

- **登录偶发 500 / `prepared statement already exists`**：`DATABASE_URL` 用错了 pooler——确认端口是 **5432 会话模式**，且连接串含 `prepared_statement_cache_size=0`。
- **后端与数据库连不上 / `password authentication failed`**：检查 `DATABASE_URL` 的密码与 Supabase 重置后的密码是否一致。
- **浏览器跨域失败 / 登录后立即循环跳登录页**：后端必须返回正确的 `access-control-allow-origin`（因 `allow_credentials=True`，**不允许** 为 `*`）。若你看到 CORS 报错或 cookie 未被保存，检查请求源是否命中 `allow_origin_regex` 的 `*.vercel.app` 规则。另注意无效 session 时后端会主动清除 cookie，浏览器端需处理 `401` 并重定向。
- **前端 404 5xx / 接口无响应**：核对 `NEXT_PUBLIC_API_URL` 是否指向 Render 根地址（不要带 `/api`），并访问 `/health` 后端是否存活。

---

## 8. 健康检查

```http
GET /health
```

响应含实时数据库连通状态：

```json
{
  "status": "ok",
  "service": "MetaNutri",
  "database": "ok"
}
```

`database` 字段为 `ok` 表示后端到 PostgreSQL 的通道正常，是验证"后端 1 数据库"是否打通的最快手段。