# 部署指南（MetaNutri）

MetaNutri 采用三端分离的云原生架构。本文档说明**三者在生产环境的部署方式，以及它们之间如何连通**。

## 1. 生产架构总览

| 层 | 技术 | 托管平台 | 对外地址 |
|----|------|----------|----------|
| 前端 | Next.js 16 (App Router) | Vercel | https://meta-nutri-ai.vercel.app/ |
| 后端 | FastAPI (Async) + Uvicorn | Render (Web Service) | https://metanutri-backend.onrender.com |
| 数据库 | PostgreSQL | Supabase (DB + 连接池) | 见下 |

```
┌─────────────┐   HTTPS/JWT   ┌──────────────────┐   Pooler(PG，IPv4)   ┌──────────────┐
│  浏览器用户   │ ─────────────►│  Vercel 前端       │                      │   Supabase    │
│ (Vercel 页面) │              │  NEXT_PUBLIC_API_URL │                      │   PostgreSQL   │
└─────────────┘              │      ▼          │                      └──────────────┘
                             │ 调用 /api/* (跨域) │
                             └────────┬─────────┘
                                      │  Render 后端 (FastAPI /:$PORT)
                                      │  DATABASE_URL = *.pooler.supabase.com:5432
```

### 三者如何连在一起（关键规则）

- **前端不直接连数据库**。浏览器只访问 Vercel 页面；页面里的 JS 通过 `NEXT_PUBLIC_API_URL` 这个环境变量找到后端地址。
- **所有业务请求都走后端**：登录、查询、AI 预测等一律 `https://metanutri-backend.onrender.com/api/*`。
- **后端通过 `DATABASE_URL` 连 Supabase PostgreSQL**：走 **连接池（pooler）**，端口 **5432（会话模式 Session）**。
  - 为什么必须用 pooler：Render 服务器**没有 IPv6**，而 Supabase 直连主机名（`db.xxxx.supabase.co`）只解析 IPv6，无法直连。
  - 为什么用 5432 会话模式而不是 6543 事务模式：事务池（pgbouncer 串行复用连接）会与 asyncpg 的预编译语句缓存冲突，导致偶发 `prepared statement already exists` 500 错误。会话模式下后端已通过 `?prepared_statement_cache_size=0` 进一步规避。
- **认证采用 JWT**：登录成功后前段拿到 `access_token`，之后每次请求带 `Authorization: Bearer <token>`。后端 CORS 已开启 `allow_origins=["*"]`（接口为纯 Bearer 鉴权、不依赖 Cookie，因此公网开放安全）。

---

## 2. 环境变量一览

> 配置前缀规则：前端（浏览器可见）用 `NEXT_PUBLIC_`；后端（服务器可见）不加前缀。**绝不要把数据库密码放进 `NEXT_PUBLIC_*`**。

### 后端（Render → Settings → Environment）

| 变量 | 值 | 说明 |
|------|----|------|
| `DATABASE_URL` | `postgresql://postgres.<PROJECT-REF>:<DB_PASSWORD>@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres` | **会话池(5432)**，IPv4 可解析；禁用预编译缓存 |
| `SECRET_KEY` | 一个高熵随机字符串 | JWT 签名密钥，生产必须改 |
| `PORT` | Render 自动注入（默认无） | Dockerfile 监听 `$PORT`，未设置则 8000 |

### 前端（Vercel → Project → Settings → Environment Variables）

| 变量 | 值 | 说明 |
|------|----|------|
| `NEXT_PUBLIC_API_URL` | `https://metanutri-backend.onrender.com` | 后端基础地址（**不含 `/api` 后缀**） |

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

## 6. 常见排障

- **登录偶发 500 / `prepared statement already exists`**：`DATABASE_URL` 用错了 pooler——确认端口是 **5432 会话模式**，且连接串含 `prepared_statement_cache_size=0`。
- **后端与数据库连不上 / `password authentication failed`**：检查 `DATABASE_URL` 的密码与 Supabase 重置后的密码是否一致。
- **浏览器跨域失败**：后端返回 `access-control-allow-origin: *`；若改了 credentials 相关配置需同步调整 CORS。
- **前端 404 5xx / 接口无响应**：核对 `NEXT_PUBLIC_API_URL` 是否指向 Render 根地址（不要带 `/api`），并访问 `/health` 后端是否存活。

---

## 7. 健康检查

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