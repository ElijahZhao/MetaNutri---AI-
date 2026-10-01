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
| ✅ 已完整落地 | 17 | 45% |
| 🟡 部分落地 | 11 | 29% |
| ❌ 未落地 | 10 | 26% |
| **合计（第一～九章 38 项）** | **38** | **有进展 74%** |

> 更新记录：第一轮完成 `2.3 数据缓存`、`7.1 ESLint/Prettier/Git Hooks`（🟡→✅）并消除 `1.2` 的死代码缺口；第二轮把演示级功能改为真实实现（血糖预测、风险评分、膳食计划、种子数据）；第三轮修复登录链路（CORS 预览域名、token 落盘顺序、超时 60s）与登录后 React #31，并引入 Vitest + RTL 测试体系（`7.5` ❌→🟡）。

> 说明：原判断「第 1、2 章基本未落地」不准确。事实是第 1、2 章完成度最高（认证状态、API 拦截、错误边界均已落地），真正的缺口集中在 **TypeScript 迁移、Token 安全、测试/CI、以及若干新增功能**。

---

## 一、架构与工程化

- [ ] ❌ **1.1 TypeScript 类型体系** — `tsconfig.json` 为 `strict:false` + `allowJs:true`，源码全为 `.js/.jsx`，无 `types/` 目录。需迁移核心文件、补 `types/auth|profile|api|recommendation.ts`、开 `strict`。
- [ ] 🟡 **1.2 统一路由守卫与认证状态** — `src/lib/store/authStore.js`（Zustand+persist）已就绪；`ProtectedRoute` 已修复并接入全部 10 个受保护页面（原为死代码：把 `isAuthenticated` 当布尔值用导致永不生效）；**仍缺 `middleware.ts` 服务端边缘拦截**，跳转仍发生在客户端。
- [ ] 🟡 **1.3 全局布局统一化** — 首页已拆分为 `components/home/`（SiteHeader/HeroSection/FeatureGrid/CTASection）；但未建 `(app)`/`(auth)` 路由组，各页仍各自 `import Navbar`。
- [x] **1.4 统一错误边界** — `components/ErrorBoundary.jsx` + `app/error.js`，全局（ClientProvider 内）与 dashboard 局部均已包裹。

## 二、API 层优化

- [x] **2.1 统一 API 错误处理与响应拦截** — `lib/api.js` 请求/响应双拦截器、`ERROR_MESSAGES` 归一化、401 统一登出；`timeout` 已由 15s 提升至 60s，给 Render 免费实例冷启动留出余量。
- [ ] ❌ **2.2 Token 刷新与无感登录** — 后端 `app/api/auth.py` 无 refresh token 机制，前端无静默刷新逻辑。
- [x] **2.3 数据缓存与请求去重** — React Query 已接入实际页面：`lib/hooks.js` 的 9 个 hooks 全部被 dashboard/profile/datasets/microbiome/metabolomics/NutritionAlerts 使用；profile 更新走 `useUpdateProfile` 并自动失效缓存；跨页共享 `profile`/`risk` 缓存键。
- [ ] 🟡 **2.4 上传接口统一封装** — `importExportAPI.importData` 已处理 FormData+60s 超时；但无通用 `uploadFile(endpoint, file, onProgress)`。后端 CORS 已收紧为白名单（✅ 该项已完成）。

## 三、状态管理

- [ ] 🟡 **3.1 轻量级全局状态** — 仅有 `useAuthStore`；缺 `useUIStore`（language/toast/globalLoading/canvasMode）与 `useDataStore`；`LanguageProvider` 仍在 `lib/i18n.js` 用 Context+useState，未迁 Zustand。
- [x] **3.2 表单状态规范化** — `login/content.jsx`、`profile/content.jsx` 均用 `react-hook-form` + `zodResolver`；BMI 用 `useMemo` 计算。

## 四、性能优化

- [x] **4.1 组件懒加载与代码分割** — `BioCanvas` 用 `dynamic(...,{ssr:false})` 且 `{isCanvasMode && <BioCanvas/>}` 条件渲染；首页拆区块；Dashboard 拆卡片。
- [x] **4.2 Canvas 动画性能** — `BioCanvas.jsx` 已监听 `prefers-reduced-motion` 降帧、`devicePixelRatio` 缩放、`document.hidden` 暂停。
- [ ] ❌ **4.3 图片与资源优化** — 全项目无 `next/image`；`next.config.js` 无 `images` 配置。
- [ ] 🟡 **4.4 减少不必要的重渲染** — `Navbar.js` 已改用 store，不再每次 `JSON.parse(localStorage)`（✅）；但未见 `React.memo` 包装 `ScrollReveal`/`FeatureCard`。

## 五、用户体验优化

- [ ] 🟡 **5.1 全局 Loading 与骨架屏** — `components/Skeleton.js` 提供 SkeletonCard/Chart/Table 等，Dashboard 用页面级 `SkeletonDashboard`；但无 `loading.tsx`，未见各卡片独立骨架屏。
- [x] **5.2 Toast 通知系统** — `react-hot-toast` + `ClientProvider` 内全局 `<Toaster>`。
- [x] **5.3 表单验证与错误提示** — login/profile 均有 zod schema（用户名/邮箱/密码强度/数值范围）与字段级错误提示。
- [x] **5.4 404 与错误页面** — 自定义 `app/not-found.js` 与 `app/error.js`。
- [x] **5.5 全站国际化** — `translations` 按 common/home/auth/dashboard/profile 分组；login/dashboard/profile/genomic/microbiome/metabolomics/recommendations/explore/predict/datasets 等页均使用 `useLanguage()`。
- [x] **5.6 语言持久化** — `lib/i18n.js` 读写 `localStorage` 的 `metanutri-language`。
- [x] **5.7 移动端适配** — 各页广泛使用 `grid-cols-1 md:grid-cols-*` + `overflow-x-auto`。

## 六、安全优化

- [ ] ❌ **6.1 Token 存储安全** — token 仍存 `localStorage`（`authStore.js` 读写、`api.js` 读取注入 Bearer），未迁 httpOnly Cookie。
- [ ] 🟡 **6.2 CORS 与 API 安全** — CORS 已白名单，并额外放行 `*.vercel.app` 预览/分支域名（避免预览地址登录被 CORS 拦截）；`auth.py` 有登录/注册/忘记密码的内存限流（✅）；但**全站限流缺失**（仅 auth 端点）。
- [x] **6.3 安全响应头** — `next.config.js` 已配置 CSP、X-Frame-Options、X-Content-Type-Options、Referrer-Policy、Permissions-Policy。
- [ ] 🟡 **6.4 输入安全** — `MetabolicPathway.jsx` 有 `escapeHtml` 处理 tooltip（✅）；上传文件类型/大小校验仍需确认。

## 七、代码质量与规范

- [x] **7.1 ESLint + Prettier + Git Hooks + CI** — 补齐依赖（eslint 9 / eslint-config-next 16 / prettier / husky / lint-staged），改用 flat config `eslint.config.mjs`；根目录 `.husky/pre-commit` 跑 lint-staged，`.github/workflows/ci.yml` 跑前端 lint + test + build 与后端 compileall。`npm run lint` 通过（0 error / 24 warning）。
- [x] **7.2 路径别名统一** — 基本统一为 `@/`，仅 `app/layout.js` 与 `components/ClientProvider.jsx` 两处残留相对路径。
- [ ] 🟡 **7.3 组件拆分** — home/dashboard 已拆（✅）；但 `MetabolicPathway.jsx`(310行)、`app/datasets/content.jsx`(398行)、`app/profile/content.jsx`(463行) 仍偏大。
- [ ] ❌ **7.4 常量与配置集中** — 无 `constants/` 目录；`goalOptions`/`restrictionOptions`/`activityOptions` 仍硬编码在 `profile/content.jsx`。
- [ ] 🟡 **7.5 单元测试与 E2E 测试** — 已引入 Vitest 2 + React Testing Library + jsdom（`vitest.config.mjs`、`vitest.setup.js`）；5 个测试文件 / 9 个用例覆盖：i18n 标签渲染（回归保护 React #31）、`authStore` 登录 token 落盘顺序（回归保护登录后 401）、Navbar/OmicsCards/BodyMetricsCard 渲染；`npm test` 已接入 CI（lint 与 build 之间）。**仍缺 Playwright E2E**。

## 八、功能完整性

- [ ] ❌ **8.1 用户头像上传** — 前端无头像组件，后端无 `/api/users/avatar`。
- [x] **8.2 密码找回与修改** — `app/forgot-password`（含重置流程）+ 后端 `/auth/forgot-password`、`/auth/reset-password`、`/users/change-password` 齐全。
- [ ] ❌ **8.3 Dashboard 数据可视化增强** — 无主题切换、时间范围筛选、CSV/PNG 导出、雷达历史对比。
- [ ] 🟡 **8.4 数据集页面优化** — 有搜索 + 分类筛选（✅）；无分页、下载进度、已导入标记。
- [ ] ❌ **8.5 实时通知与 WebSocket** — 无 WebSocket/SSE，也无 `refetchInterval` 轮询兜底。

## 九、SEO 与可访问性

- [x] **9.1 页面级 Metadata** — 14 个页面均 `export const metadata`。
- [ ] ❌ **9.2 Open Graph 与社交分享** — 无 `openGraph`/`twitter:card`。
- [ ] ❌ **9.3 可访问性（a11y）** — 全站仅 1 处 `aria-label`（Navbar）；无 `focus-visible`/`aria-*` 系统补齐。

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
| [ ] | `dashboard/page.js` 无错误边界/整页 loading | 🟡 有 ErrorBoundary；仍页面级 loading |
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

**待办 · 中大型**
- [ ] TypeScript 迁移（1.1）
- [ ] Token 迁 httpOnly Cookie + refresh（2.2，跨前后端）
- [ ] 全站限流（当前仅 auth 端点）
- [ ] `middleware.ts` 服务端边缘守卫（1.2 收尾）
- [ ] 通用 `uploadFile(endpoint, file, onProgress)` 封装（2.4）
- [ ] Playwright E2E（7.5 收尾）

**待办 · 新增功能类**
- [ ] 头像上传、Dashboard 图表增强、WebSocket 通知、OG 标签、a11y 补齐、constants 集中、next/image
