# MetaNutri 优化清单 · 落地盘点（可勾选）

> 对照 `OPTIMIZATION_PLAN.md` 逐条核查实际代码得出。
> 核查范围：`frontend/`（Next.js）+ `backend/`（FastAPI）。
> 核查方式：初版为只读代码审计，之后按优先级逐轮整改并同步回填本清单。

## 图例

- `- [x]` 已完整落地
- `- [ ]` **🟡 部分落地** — 框架/一半已就绪，仍有明确缺口（缺口写在条目末尾）
- `- [ ]` **❌ 未落地**

## 汇总

| 状态 | 数量 | 占比 |
|------|------|------|
| ✅ 已完整落地 | 28 | 74% |
| 🟡 部分落地 | 6 | 16% |
| ❌ 未落地 | 4 | 11% |
| **合计（第一～九章 38 项）** | **38** | **有进展 89%** |

> 更新记录：第一轮完成 `2.3 数据缓存`、`7.1 ESLint/Prettier/Git Hooks`（🟡→✅）并消除 `1.2` 的死代码缺口；第二轮把演示级功能改为真实实现（血糖预测、风险评分、膳食计划、种子数据）；第三轮修复登录链路（CORS 预览域名、token 落盘顺序、超时 60s）与登录后 React #31，并引入 Vitest + RTL 测试体系（`7.5` ❌→🟡）；第四轮补齐 Playwright E2E（`7.5` 🟡→✅，`e2e` job 接入 CI），并修正 E2E 打桩中 nutrition-alerts 响应形状错误；第五轮启动 TypeScript 迁移（`1.1` ❌→🟡）：新增 `src/types/`、核心逻辑层迁 `.ts`、开启 `strict`；第六轮完成 `1.1`（🟡→✅）：`src/` 全部 `.js/.jsx` 迁为 `.ts/.tsx`，并收尾 `next.config`、`playwright.config`、`vitest.setup`、E2E spec 的 TS 化；第七轮「快赢一批」：`4.4 减少重渲染`（🟡→✅，`React.memo` 包装 `ScrollReveal`/`FeatureCard`）、`5.1 Loading 与骨架屏`（🟡→✅，根级 + 各路由 `loading.tsx` + Dashboard 卡片级骨架屏）、`7.4 常量集中`（❌→✅，新增 `src/constants/`）、`9.2 OG/Twitter`（❌→✅，`metadataBase` + `openGraph`/`twitter` + `opengraph-image`/`twitter-image`）、`9.3 a11y`（❌→✅，全局 `focus-visible` + reduced-motion、Navbar ARIA、skip link、登录/资料表单 `aria-invalid`/`aria-describedby`）；第八轮「安全硬化」：`6.1 Token 存储安全`（❌→✅，httpOnly Cookie）、`2.2 Token 刷新与无感登录`（❌→✅，refresh 轮换 + 401 静默续期）、`1.2 服务端边缘守卫`（🟡→✅，`middleware.ts`）、`6.2 全站限流`（🟡→✅，新增 `RateLimitMiddleware`）。

> 说明：原判断「第 1、2 章基本未落地」不准确。事实是第 1、2 章完成度最高（认证状态、API 拦截、错误边界均已落地）。经过第八轮安全硬化，剩余缺口集中在 **布局统一化（1.3）、上传封装（2.4）、输入校验（6.4）、大文件拆分（7.3）以及图片优化 / 头像 / 图表增强 / WebSocket 等新增功能类**。

---

## 一、架构与工程化

- [x] **1.1 TypeScript 类型体系** — `src/types/`（`auth` / `profile` / `risk` / `omics` / `nutrition` / `dataset` / `api`）形状对齐后端 pydantic；核心逻辑层（`lib/api.ts`、`lib/hooks.ts`、`lib/store/authStore.ts`、`lib/i18n.tsx`）与全部 50+ 展示组件/页面 content 均已迁 `.ts/.tsx`；`tsconfig.json` 开启 `strict: true`，新增 `npm run typecheck`（`tsc --noEmit`）；配置与测试（`next.config.ts`、`playwright.config.ts`、`vitest.setup.ts`、`tests/e2e/smoke.spec.ts`）同步 TS 化。`typecheck` / `lint`（0 error）/ `test`（9）/ `build` 全绿。
- [x] **1.2 统一路由守卫与认证状态** — `src/lib/store/authStore.ts`（Zustand）承载认证状态（用户对象，令牌在 httpOnly Cookie 中，前端不可读）；`ProtectedRoute` 已接入全部 10 个受保护页面（原为死代码：把 `isAuthenticated` 当布尔值用导致永不生效）；新增 `src/middleware.ts` 服务端边缘守卫：无会话 Cookie 访问受保护路由直接 302 到 `/login`，已登录访问 `/login` 反向跳 `/dashboard`（只校验 Cookie 存在性，真正鉴权仍在 API 侧）。
- [x] **1.3 全局布局统一化** — 首页已拆分为 `components/home/`（SiteHeader/HeroSection/FeatureGrid/CTASection）；新增 `(app)`/`(auth)` 路由组：`(app)/layout.tsx` 统一挂载 `Navbar`+`ProtectedRoute`，`(auth)/layout.tsx` 统一居中渐变外壳，10 个受保护页与登录/找回密码页不再各自包裹；`RouteLoading` 退化为纯内容骨架，E2E 新增「每个受保护路由恰好渲染一次共享外壳」回归用例。
- [x] **1.4 统一错误边界** — `components/ErrorBoundary.jsx` + `app/error.js`，全局（ClientProvider 内）与 dashboard 局部均已包裹。

## 二、API 层优化

- [x] **2.1 统一 API 错误处理与响应拦截** — `lib/api.ts` 请求/响应双拦截器、`ERROR_MESSAGES` 归一化、401 统一登出；`timeout` 已由 15s 提升至 60s，给 Render 免费实例冷启动留出余量。
- [x] **2.2 Token 刷新与无感登录** — 后端 `/api/auth/refresh`：校验 httpOnly refresh Cookie、与缓存中的当前令牌比对（每次刷新轮换，重放已轮换令牌即判定会话可能泄露并清空），重新签发 access+refresh。前端 `lib/api.ts` 响应拦截器遇 401 自动调用 refresh 并重放原请求（并发 401 共用同一个 in-flight 请求，仅刷新一次），刷新失败才清会话跳 `/login`；`/auth/*` 端点自身 401 不触发刷新。
- [x] **2.3 数据缓存与请求去重** — React Query 已接入实际页面：`lib/hooks.ts` 的 9 个 hooks 全部被 dashboard/profile/datasets/microbiome/metabolomics/NutritionAlerts 使用；profile 更新走 `useUpdateProfile` 并自动失效缓存；跨页共享 `profile`/`risk` 缓存键。
- [ ] 🟡 **2.4 上传接口统一封装** — `importExportAPI.importData` 已处理 FormData+60s 超时；但无通用 `uploadFile(endpoint, file, onProgress)`。后端 CORS 已收紧为白名单（✅ 该项已完成）。

## 三、状态管理

- [ ] 🟡 **3.1 轻量级全局状态** — 仅有 `useAuthStore`；缺 `useUIStore`（language/toast/globalLoading/canvasMode）与 `useDataStore`；`LanguageProvider` 仍在 `lib/i18n.tsx` 用 Context+useState，未迁 Zustand。
- [x] **3.2 表单状态规范化** — `login/content.jsx`、`profile/content.jsx` 均用 `react-hook-form` + `zodResolver`；BMI 用 `useMemo` 计算。

## 四、性能优化

- [x] **4.1 组件懒加载与代码分割** — `BioCanvas` 用 `dynamic(...,{ssr:false})` 且 `{isCanvasMode && <BioCanvas/>}` 条件渲染；首页拆区块；Dashboard 拆卡片。
- [x] **4.2 Canvas 动画性能** — `BioCanvas.jsx` 已监听 `prefers-reduced-motion` 降帧、`devicePixelRatio` 缩放、`document.hidden` 暂停。
- [ ] ❌ **4.3 图片与资源优化** — 全项目无 `next/image`；`next.config.js` 无 `images` 配置。
- [x] **4.4 减少不必要的重渲染** — `Navbar.tsx` 已改用 store，不再每次 `JSON.parse(localStorage)`；`ScrollReveal`、首页 `FeatureCard` 已用 `React.memo` 包装（`FEATURES` 为模块级常量、`feature` 引用稳定，memo 生效）；`profile` 选项生成用 `useMemo` 缓存。

## 五、用户体验优化

- [x] **5.1 全局 Loading 与骨架屏** — `components/Skeleton.tsx` 提供 SkeletonCard/Chart/Table；已补根级 `app/loading.tsx`（品牌化居中提示）与路由级 `loading.tsx`（dashboard/profile/datasets，复用 `RouteLoading` 外壳）；Dashboard 取消整页 loading，改为按 `profileQuery`/`riskQuery`/`recommendationsQuery` 各自 `isLoading` 显示卡片级骨架屏。
- [x] **5.2 Toast 通知系统** — `react-hot-toast` + `ClientProvider` 内全局 `<Toaster>`。
- [x] **5.3 表单验证与错误提示** — login/profile 均有 zod schema（用户名/邮箱/密码强度/数值范围）与字段级错误提示。
- [x] **5.4 404 与错误页面** — 自定义 `app/not-found.js` 与 `app/error.js`。
- [x] **5.5 全站国际化** — `translations` 按 common/home/auth/dashboard/profile 分组；login/dashboard/profile/genomic/microbiome/metabolomics/recommendations/explore/predict/datasets 等页均使用 `useLanguage()`。
- [x] **5.6 语言持久化** — `lib/i18n.js` 读写 `localStorage` 的 `metanutri-language`。
- [x] **5.7 移动端适配** — 各页广泛使用 `grid-cols-1 md:grid-cols-*` + `overflow-x-auto`。

## 六、安全优化

- [x] **6.1 Token 存储安全** — 令牌不再落 `localStorage`：后端登录/刷新通过 `Set-Cookie` 下发 `metanutri_access` / `metanutri_refresh`（`httponly` + `secure` + `samesite=lax`，可配 `COOKIE_DOMAIN`），前端 `authStore` 只保留展示用 user 对象，`lib/api.ts` 启用 `withCredentials` 走同源 `/api` 代理（Cookie 因此是第一方，不受三方 Cookie 拦截影响）；登出/改密/重置密码均吊销服务端会话。
- [x] **6.2 CORS 与 API 安全** — CORS 白名单 + 放行 `*.vercel.app` 预览/分支域名；`app/api/auth.py` 对登录/注册/忘记密码做按 IP+用户名 的内存限流（5 次/60s，另有 20 次/300s 的 IP 突发上限）；新增 `app/core/rate_limit.py` 的 `RateLimitMiddleware` 对**全部 `/api` 路由**按客户端 IP 限流（读 120 次/分、写 40 次/分，Redis 优先，Redis 不可用时退化为进程内滑动窗口），`/health` 与 CORS 预检豁免，超限返回 429 + `Retry-After`，且因挂在 CORS 内层，429 响应仍带 CORS 头。
- [x] **6.3 安全响应头** — `next.config.js` 已配置 CSP、X-Frame-Options、X-Content-Type-Options、Referrer-Policy、Permissions-Policy。
- [ ] 🟡 **6.4 输入安全** — `MetabolicPathway.jsx` 有 `escapeHtml` 处理 tooltip（✅）；上传文件类型/大小校验仍需确认。

## 七、代码质量与规范

- [x] **7.1 ESLint + Prettier + Git Hooks + CI** — 补齐依赖（eslint 9 / eslint-config-next 16 / prettier / husky / lint-staged），改用 flat config `eslint.config.mjs`；根目录 `.husky/pre-commit` 跑 lint-staged，`.github/workflows/ci.yml` 跑前端 lint + test + build 与后端 compileall。`npm run lint` 通过（0 error / 24 warning）。
- [x] **7.2 路径别名统一** — 基本统一为 `@/`，仅 `app/layout.js` 与 `components/ClientProvider.jsx` 两处残留相对路径。
- [ ] 🟡 **7.3 组件拆分** — home/dashboard 已拆（✅）；但 `MetabolicPathway.jsx`(310行)、`app/datasets/content.jsx`(398行)、`app/profile/content.jsx`(463行) 仍偏大。
- [x] **7.4 常量与配置集中** — 新增 `src/constants/`（`profile.ts` + `index.ts` 统一导出）：`GENDER_VALUES`/`ACTIVITY_VALUES`/`GOAL_VALUES`/`BMI_THRESHOLDS` 与 `buildProfileOptions(t)`；`profile/content.tsx` 已改为消费该模块（原硬编码选项移除）。
- [x] **7.5 单元测试与 E2E 测试** — 单元测试：Vitest 2 + React Testing Library + jsdom（`vitest.config.mjs`、`vitest.setup.js`），5 个测试文件 / 9 个用例覆盖 i18n 标签渲染（回归保护 React #31）、`authStore` 登录 token 落盘顺序（回归保护登录后 401）、Navbar/OmicsCards/BodyMetricsCard 渲染。E2E：Playwright（`playwright.config.js`、`tests/e2e/smoke.spec.js`），覆盖落地页渲染、未登录访问 `/dashboard` 重定向登录、登录后进入 Dashboard 且无白屏（回归保护 i18n 键冲突），全程 `page.route` 打桩后端、不依赖生产。`npm test` 与 `npm run test:e2e` 均已接入 CI（`frontend` 与新增 `e2e` job）。

## 八、功能完整性

- [ ] ❌ **8.1 用户头像上传** — 前端无头像组件，后端无 `/api/users/avatar`。
- [x] **8.2 密码找回与修改** — `app/forgot-password`（含重置流程）+ 后端 `/auth/forgot-password`、`/auth/reset-password`、`/users/change-password` 齐全。
- [ ] ❌ **8.3 Dashboard 数据可视化增强** — 无主题切换、时间范围筛选、CSV/PNG 导出、雷达历史对比。
- [ ] 🟡 **8.4 数据集页面优化** — 有搜索 + 分类筛选（✅）；无分页、下载进度、已导入标记。
- [ ] ❌ **8.5 实时通知与 WebSocket** — 无 WebSocket/SSE，也无 `refetchInterval` 轮询兜底。

## 九、SEO 与可访问性

- [x] **9.1 页面级 Metadata** — 14 个页面均 `export const metadata`。
- [x] **9.2 Open Graph 与社交分享** — 根 `layout.tsx` 配置 `metadataBase`（`NEXT_PUBLIC_SITE_URL` → `VERCEL_*` → localhost 回退）+ `openGraph`（type/siteName/locale/url）+ `twitter: summary_large_image`；新增动态生成的 `app/opengraph-image.tsx` 与 `app/twitter-image.tsx`（`next/og`，1200×630，构建产物路由 `/opengraph-image`、`/twitter-image`）。
- [x] **9.3 可访问性（a11y）** — 全局 `:focus-visible` 焦点环 + `prefers-reduced-motion` 降级（`globals.css`）；根布局 skip link（跳转 `#main-content`，各页 `<main>` 已带 `id`/`tabIndex={-1}`）；Navbar 加 `aria-label`/`aria-current`/`aria-expanded`/`aria-controls`，装饰性图标 `aria-hidden`；登录页与资料页表单补齐 `id`/`htmlFor`/`aria-invalid`/`aria-describedby`（错误提示 `role="alert"`）。

---

## 十、原「具体代码问题清单」逐条

| 状态 | 问题 | 结论 |
|------|------|------|
| [x] | `lib/api.js` 无响应拦截/超时 | 已加拦截器；超时由 15s 提升至 60s（冷启动不再误报超时） |
| [x] | `app/page.js` 单文件过大 | 已拆 `components/home/*` |
| [x] | `app/page.js` BioCanvas 始终挂载 | 已 `dynamic` + 条件渲染 |
| [x] | `TypeWriter.js` 用 `em` 估算宽度 | 已改为不可见撑宽容器，按最宽文案的真实宽度撑开 |
| [x] | `BioCanvas.jsx` 未监听 reduced-motion | 已监听 |
| [x] | `lib/i18n.js` 语言不持久化 | 已持久化 |
| [x] | `Navbar.js` 每次 parse localStorage | 已改用 store |
| [x] | `login/page.js` 无表单验证 | 已 rhf+zod |
| [x] | `dashboard/page.js` 无错误边界/整页 loading | 有 ErrorBoundary；已加路由级 `loading.tsx` + 卡片级独立骨架屏 |
| [x] | `profile/page.js` BMI 渲染中计算 | 已 `useMemo` |
| [x] | 其他页重复 token 检查 | 已统一到 store |
| [x] | `backend/main.py` CORS `*` | 已收紧白名单，并放行 `*.vercel.app` 预览域名 |

## 十一、盘点中额外发现的问题

- [x] **死代码：`ProtectedRoute.jsx` 无人引用** — 已修复（原把 `isAuthenticated` 当布尔值用，导致永不生效）并接入全部 10 个受保护页面。
- [x] **死代码：`lib/hooks.js` 无人引用** — 9 个 hooks 已全部接入实际页面。
- [x] **无 CI** — 已补 `.github/workflows/ci.yml`，并在提交前通过 husky + lint-staged 校验。

---

## 缺口优先级建议

**已完成（第一轮）**
- [x] 清理/接入死代码：`ProtectedRoute`、`lib/hooks.js`
- [x] TypeWriter 宽度估算改为真实测量
- [x] 补 husky + lint-staged + CI workflow
- [x] React Query 真正接入页面（2.3）

**已完成（第二轮：演示级功能改为真实实现）**
- [x] 血糖预测改为确定性计算（真实食物特征 + 用户画像），并修复 `peak_glucose` 与曲线峰值不一致
- [x] 种子数据在应用启动时幂等灌入
- [x] 风险评分去随机（由年龄 / BMI / 活动水平推导）
- [x] 膳食计划确定性生成（热量目标 + 低 GI 优先，保证蛋白质来源）

**已完成（第三轮：登录链路与稳定性）**
- [x] 修复登录失败：CORS 放行 `*.vercel.app`、token 先落盘再调 `/me`、axios 超时 15s→60s
- [x] 修复登录成功后白屏（React #31）：i18n 键名对象/字符串冲突，字符串键改名为 `*Label`
- [x] 引入 Vitest + React Testing Library 测试体系（7.5，含 CI 接入）

**已完成（第四轮：端到端测试）**
- [x] 补齐 Playwright E2E（`playwright.config.js` + `tests/e2e/smoke.spec.js`），并将 `e2e` job 接入 CI
- [x] 修正 E2E 打桩里 nutrition-alerts 响应形状（对象 → 原误写成数组，会导致 Dashboard 渲染崩溃）
- [x] ESLint 忽略 Playwright 产物目录（`playwright-report/`、`test-results/`），避免 lint 误扫生成文件报错

**已完成（第五轮：TypeScript 核心层迁移）**
- [x] 新增 `src/types/`（auth / profile / risk / omics / nutrition / dataset / api），形状对齐后端 pydantic
- [x] 核心逻辑层迁 TS：`lib/api.ts`、`lib/hooks.ts`、`lib/store/authStore.ts`、`lib/i18n.tsx`
- [x] `tsconfig.json` 开启 `strict: true`，新增 `npm run typecheck`；`tsc` / lint / test(9) / build 全绿
- [x] 修正 vitest 的 esbuild loader（`tsx` 覆盖 `js|jsx|ts|tsx`），否则 `.tsx` 源码无法被测试解析

**已完成（第六轮：TypeScript 迁移收尾）**
- [x] `src/` 下全部 `.js/.jsx` 组件与页面 content 迁为 `.ts/.tsx`（含 `BioCanvas`、`MetabolicPathway` 等复杂可视化）
- [x] 配置与测试同步 TS 化：`next.config.ts`、`playwright.config.ts`、`vitest.setup.ts`、`tests/e2e/smoke.spec.ts`
- [x] 调整 vitest 的 esbuild `include`（覆盖 `src` 与根目录 setup/config，排除 `node_modules`），修复迁移后 setup 文件解析失败
- [x] `.gitignore` 忽略 `*.tsbuildinfo` 增量构建缓存
- [x] 全量验证：`typecheck` / `lint`（0 error）/ `test`（9）/ `build` 全绿

**已完成（第七轮：快赢一批）**
- [x] `4.4` 减少重渲染：`React.memo` 包装 `ScrollReveal` / `FeatureCard`
- [x] `5.1` Loading 与骨架屏：根级 + 路由级 `loading.tsx` + Dashboard 卡片级骨架屏
- [x] `7.4` 常量集中：新增 `src/constants/`，Profile 选项/BMI 阈值统一维护并本地化
- [x] `9.2` OG/Twitter：`metadataBase` + `openGraph`/`twitter` + 动态 `opengraph-image`/`twitter-image`
- [x] `9.3` a11y：`focus-visible` + reduced-motion、Navbar ARIA、skip link、表单 `aria-invalid`/`aria-describedby`
- [x] 全量验证：`typecheck` / `lint`（0 error）/ `test`（9）/ `build` 全绿（含 `/opengraph-image`、`/twitter-image` 静态产物）

**已完成（第八轮：安全硬化）**
- [x] `6.1` Token 存储安全：令牌迁 httpOnly Cookie（`httponly`/`secure`/`samesite=lax`，可配 domain）
- [x] `2.2` Token 刷新与无感登录：`/api/auth/refresh` + 轮换 + 重放检测；前端 401 静默续期并重放原请求（并发去重）
- [x] `1.2` 收尾：`src/middleware.ts` 服务端边缘守卫（Cookie 存在性判定，未登录 302 `/login`，已登录访问 `/login` 反向跳转）
- [x] `6.2` 全站限流：`app/core/rate_limit.py` 的 `RateLimitMiddleware` 覆盖全部 `/api`（读 120/分、写 40/分；Redis 优先 + 内存降级；429 + `Retry-After`，CORS 头保留）
- [x] 同步更新 E2E（打桩后手动种会话 Cookie）与单测（断言 localStorage 不再存令牌）
- [x] 已用最小 FastAPI 应用做功能自测：读/写分档生效、`/health` 豁免、其他 IP 不受影响、429 带 CORS 头

**已完成（第九轮：工程化收尾）**
- [x] `1.3` `(app)`/`(auth)` 路由组统一布局，消除各页重复的 `Navbar`/外壳包裹
- [x] 受保护页 loading 分支补 `main#main-content`，四种「无主区」早退状态不再破坏外壳与 a11y 结构
- [x] 修复 `authStore` 双份存储竞态：此前用户同时写在 `metanutri-user`（同步读）与 `metanutri-auth`（persist 异步水合）两处，直接打开受保护页时首帧 `user=null` 会把已登录用户弹回 `/login`（经中间件又落到 `/dashboard`）。改为单一 `persist` 源 + `hydrated` 标志，`ProtectedRoute` 等待水合后再判定；同时移除 5 个页面里与布局重复的 `isAuthenticated()` 守卫（竞态来源）
- [x] 修复 `next.config.ts` CSP 的 `upgrade-insecure-requests`：它把 App Router 同源 RSC 请求从 http 升级为 https，任何 HTTP 部署（本地 `next start`、E2E、无 TLS 自托管）都会 `ERR_SSL_PROTOCOL_ERROR` → 回退整页导航 → 夹具 `ERR_ABORTED`。已移除（HTTPS 部署由 HSTS 保障）
- [x] 修复 `metabolomics` 页 `analysis.pathways.length` 无空值保护导致整页被 `ErrorBoundary` 接管（与同文件 144 行的写法保持一致）
- [x] E2E 打桩补全 `datasets/stats`、`datasets/tianchi`、`metabolomics/analysis` 等真实信封形状，并修正 `startsWith('/api/datasets')` 吞掉子路由、`/api/users/profile` 尾部斜杠不匹配两处打桩缺陷
- [x] 全量验证：`typecheck` / `lint`（0 error）/ `test`（10）/ `build` / `playwright`（4 passed）全绿

**待办 · 中大型**
- [ ] 通用 `uploadFile(endpoint, file, onProgress)` 封装（2.4）

**待办 · 新增功能类**
- [ ] 头像上传、Dashboard 图表增强、WebSocket 通知、next/image
