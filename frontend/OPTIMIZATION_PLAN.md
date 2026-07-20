# MetaNutri 前端项目优化方案（详尽版）

> 基于 `/workspace/frontend` 与 `/workspace/backend` 的全量代码审查，仅输出优化方案，不直接改动代码。

---

## 一、架构与工程化（P0-P1）

### 1.1 引入 TypeScript 类型体系
**现状**：项目虽安装了 `@types/node`、`@types/react`、`typescript`，但源码仍为 `.js/.jsx`，无任何类型定义。`page.js` 中的 `user`、`profile`、`risk` 等状态均为 `any`，IDE 无法推导，运行时易出现 `Cannot read properties of undefined`。

**优化方案**：
- 将核心文件逐步迁移为 `.ts/.tsx`（建议从新文件开始，老文件逐步重构）。
- 定义统一类型：
  - `types/auth.ts`：User、LoginRequest、RegisterRequest、TokenResponse
  - `types/profile.ts`：Profile、BodyMetrics、DietaryGoal
  - `types/api.ts`：ApiResponse<T>、ApiError
  - `types/recommendation.ts`：Recommendation、MealPlan、RiskAssessment
- 为 `lib/api.js` 的所有 API 方法添加返回类型，例如 `authAPI.login(data: LoginRequest): Promise<AxiosResponse<TokenResponse>>`。
- 配置 `tsconfig.json` 的 `strict: true` 与 `paths` 别名映射。

### 1.2 统一路由守卫与认证状态
**现状**：每个受保护页面（dashboard、profile、genomic 等）都重复以下代码：
```js
const token = localStorage.getItem('token');
if (!token) router.push('/login');
```
导致重复代码、维护困难、跳转闪烁。

**优化方案**：
- 创建 `AuthProvider` Context，集中管理 `token`、`user`、`isAuthenticated`、`isLoading`。
- 提供 `useAuth()` Hook，暴露 `login()`、`logout()`、`checkAuth()`。
- 创建 `ProtectedRoute` 高阶组件/中间件（Next.js Middleware 或页面级 HOC），统一处理未登录跳转。
- 使用 Next.js App Router 的 `middleware.ts` 在服务端/边缘拦截未认证请求，减少客户端闪烁。

### 1.3 全局布局统一化
**现状**：`dashboard`、`profile`、`genomic` 等页面各自 `import Navbar`，`login`、`page.js`（首页）没有统一布局。新增页面容易遗漏导航。

**优化方案**：
- 创建 `(app)` 路由组，将需要导航的页面统一放入该组，并在其 `layout.tsx` 中渲染 `<Navbar />` 与 `<Footer />`（如有）。
- 登录/注册等认证页使用 `(auth)` 路由组，采用独立居中布局。
- 首页保持当前自由布局，但将公共头部提取为 `SiteHeader` 组件。

### 1.4 建立统一错误边界
**现状**：React 组件抛错会导致整个页面白屏，用户只能刷新。`dashboard` 中仅 `console.error` 捕获，没有降级 UI。

**优化方案**：
- 创建 `ErrorBoundary` 类组件，捕获渲染错误并显示友好错误页（带重试按钮）。
- 在根布局包裹全局 Error Boundary。
- 为 API 请求添加局部错误边界或 `error.tsx`（Next.js 约定）。
- 关键组件（图表、数据面板）各自包裹独立 Error Boundary，避免单个组件拖垮整个页面。

---

## 二、API 层优化（P0-P1）

### 2.1 统一 API 错误处理与响应拦截
**现状**：`lib/api.js` 只有请求拦截器（注入 token），没有响应拦截器。每个页面自己 `try/catch`，错误提示碎片化，401 未统一处理。

**优化方案**：
- 在 axios 响应拦截器中统一处理：
  - 401：触发全局登出，跳转登录页。
  - 403：提示权限不足。
  - 422/400：提取后端 `detail` 字段并提示。
  - 500/网络错误：显示通用错误提示。
- 封装 `apiClient.request<T>()` 方法，统一返回 `{ data, error }` 或抛出标准化错误。
- 为所有 API 调用设置默认 `timeout: 10000`，上传接口单独设置更长超时。

### 2.2 Token 刷新与无感登录
**现状**：token 过期后用户直接被打回登录页，体验差。`localStorage.getItem('token')` 散落在多处。

**优化方案**：
- 后端支持 refresh token 后，前端在响应拦截器中检测 401，用 refresh token 静默刷新 access token。
- 刷新失败或没有 refresh token 时，再跳转登录。
- 将 token 读取逻辑集中到 `AuthProvider`，禁止组件直接访问 `localStorage`。

### 2.3 数据缓存与请求去重
**现状**：每次进入 Dashboard 都并发请求 profile、risk、recommendations、genomic，无缓存，切换页面重复请求。

**优化方案**：
- 引入 `TanStack Query (React Query)` 或 `SWR`：
  - Dashboard 各卡片独立使用 `useQuery`，自带缓存、重试、去重、后台刷新。
  - profile 表单使用 `useMutation` 处理保存，配合乐观更新。
- 为不同接口设置合理的 `staleTime`（如 profile 5 分钟、alerts 1 分钟）。

### 2.4 上传接口统一封装
**现状**：`importExportAPI.importData` 单独构造 `FormData` 并覆盖 header，其他地方如果有图片/头像上传会再次重复。

**优化方案**：
- 创建 `uploadFile(endpoint: string, file: File, onProgress?: (p: number) => void)` 通用函数，自动处理 `FormData` 与进度回调。
- 支持大文件分片上传（可选）。
- 后端 `CORS` 目前 `allow_origins=["*"]`，生产环境必须限制为前端真实域名。

---

## 三、状态管理（P1）

### 3.1 引入轻量级全局状态
**现状**：`language`、`canvasMode`、`user` 等状态分散，跨组件通信依赖 localStorage 或 props drilling。

**优化方案**：
- 使用 `Zustand` 创建几个独立 store：
  - `useAuthStore`：token、user、login、logout
  - `useUIStore`：language、toast 队列、globalLoading、canvasMode
  - `useDataStore`：缓存 profile、dashboard 数据（配合 React Query 可选）
- `LanguageProvider` 可迁移到 Zustand + `persist` 中间件，自动持久化到 localStorage。

### 3.2 表单状态规范化
**现状**：profile 页面手动管理每个字段的 `onChange`，BMI 计算在渲染时触发，表单验证缺失。

**优化方案**：
- 使用 `react-hook-form` 管理表单状态，减少不必要的重渲染。
- 使用 `zod` 定义 profile schema（如身高必须 > 0、年龄在 1-120 之间）。
- 将 BMI 计算放入 `useMemo`，避免每次渲染重复计算。

---

## 四、性能优化（P1-P2）

### 4.1 组件懒加载与代码分割
**现状**：
- Dashboard 的 `ReactECharts` 已动态导入，但 `MetabolicPathway`、`NutritionAlerts` 仍同步加载。
- `BioCanvas` 组件在首页始终挂载，即使非画布模式也在后台运行 `requestAnimationFrame`。
- `page.js` 单文件超过 300 行，包含首页所有区块。

**优化方案**：
- 将 `BioCanvas` 改为 `dynamic(() => import('@/components/BioCanvas'), { ssr: false })`，并仅在 `isCanvasMode` 为 true 时渲染。
- 非画布模式下完全卸载 `BioCanvas`（`{isCanvasMode && <BioCanvas />}`），停止动画循环与内存占用。
- 将首页拆分为独立区块组件：`HeroSection`、`FeatureGrid`、`CTASection`。
- Dashboard 各卡片独立动态导入，配合骨架屏。

### 4.2 Canvas 动画性能
**现状**：`BioCanvas` 在画布模式下每秒重绘 60 次，粒子数量、连线计算全部在主线程，移动端可能掉帧。

**优化方案**：
- 使用 `requestAnimationFrame` 时检测 `document.hidden`，页面不可见时暂停。
- 降低非激活状态的帧率：后台标签页降至 10fps 或暂停。
- 粒子连线使用空间分割（Quadtree 或网格）减少 O(n²) 计算。
- 对视网膜屏使用 `ctx.scale(dpr, dpr)` 并设置 `canvas.width/height` 为实际像素，避免模糊。
- 提供“减少动画”开关（`prefers-reduced-motion` 媒体查询）。

### 4.3 图片与资源优化
**现状**：项目没有任何 `<Image>` 组件使用，所有图标均为 lucide-react 的 SVG，没有头像上传与展示。

**优化方案**：
- 引入 `next/image` 处理用户头像、数据集封面等图片。
- 配置 `next.config.js` 的 `images.domains` 与 `formats: ['image/avif', 'image/webp']`。
- 图标按需导入（lucide-react 已较优，可维持）。

### 4.4 减少不必要的重渲染
**现状**：`page.js` 顶层 `useLanguage()` 导致整个首页在语言切换时重渲染；`Navbar` 每次路由变化都重新读取 localStorage。

**优化方案**：
- 将语言切换的影响范围隔离到文本渲染层，使用 `React.memo` 包装 `ScrollReveal`、`FeatureCard`。
- `Navbar` 使用 Zustand store 订阅 user，避免每次渲染都 `JSON.parse(localStorage.getItem('user'))`。

---

## 五、用户体验优化（P0-P1）

### 5.1 全局 Loading 与骨架屏
**现状**：Dashboard 只有一个居中的 Loader2 转圈，数据加载时整页空白。其他页面（genomic、microbiome 等）无加载状态。

**优化方案**：
- 创建 `PageLoader` 与 `SkeletonCard`、`SkeletonChart`、`SkeletonTable` 组件。
- Dashboard 各卡片独立骨架屏，避免整页空白。
- 路由切换时使用 Next.js `loading.tsx` 或全局 topbar（如 nprogress）。

### 5.2 Toast 通知系统
**现状**：操作成功/失败没有任何反馈。profile 保存后只在按钮上显示“Saved!”，缺少统一通知。

**优化方案**：
- 集成 `sonner` 或 `react-hot-toast`，封装 `toast.success()`、`toast.error()`、`toast.loading()`。
- API 层自动 toast 通用错误；业务层在保存成功、登录成功等场景 toast。

### 5.3 表单验证与错误提示
**现状**：
- login 页面仅依赖 HTML5 `required`，没有用户名长度、密码强度提示。
- profile 页面数字输入为空时会存为 `''`，可能触发后端类型错误。
- 没有实时错误提示。

**优化方案**：
- 使用 `react-hook-form + zod`：
  - 用户名：3-20 字符，仅允许字母数字下划线
  - 邮箱：标准邮箱格式
  - 密码：至少 8 位，包含字母和数字
  - 身高/体重/年龄：正数且在合理范围
- 错误提示显示在每个字段下方，并自动聚焦首个错误字段。

### 5.4 404 与错误页面
**现状**：访问不存在的路由会显示 Next.js 默认 404 页面，与项目风格不一致。

**优化方案**：
- 创建 `not-found.tsx`，提供返回首页的按钮与生物主题插画。
- 创建 `error.tsx`，捕获路由段错误，提供重试按钮。

### 5.5 全站国际化
**现状**：仅 `page.js`（首页）和 `i18n.js` 支持中英切换，其他页面（login、dashboard、profile 等）全部硬编码英文，切换语言后体验断裂。

**优化方案**：
- 扩展 `translations` 对象，按页面/模块分组：`common`、`home`、`auth`、`dashboard`、`profile`。
- 所有页面使用 `useLanguage()` 或 `useTranslation()` 读取文案。
- 将 `t` 默认值改为英文兜底，避免 key 缺失时白屏。
- 导航栏、错误提示、表单标签全部纳入翻译。

### 5.6 语言持久化
**现状**：`LanguageProvider` 初始状态硬编码 `'en'`，刷新后重置。

**优化方案**：
- 在 `useEffect` 中从 `localStorage` 读取 `metanutri-language`。
- 切换语言时写入 `localStorage`。
- 使用 Zustand `persist` 中间件自动同步。

### 5.7 移动端适配
**现状**：
- `Navbar` 有移动端菜单，但部分页面表格/图表在窄屏可能溢出。
- `MetabolicPathway` 的右侧信息面板在移动端与图表并列，可能挤在一起。
- 画布模式下全屏按钮在移动端可能被系统手势冲突。

**优化方案**：
- 所有表格使用 `overflow-x-auto` 包裹。
- Dashboard 图表使用 `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` 响应式布局。
- `MetabolicPathway` 移动端改为上下布局（图表在上，信息面板在下）。
- 画布模式增加明显的退出浮钮，支持下滑退出提示。

---

## 六、安全优化（P1-P2）

### 6.1 Token 存储安全
**现状**：`access_token` 与 `user` 均存储在 `localStorage`，XSS 脚本可直接读取。

**优化方案**：
- 短期方案：使用 `httpOnly` Cookie 存储 token，前端不再直接读取 token。
- 如必须使用 localStorage，则对 `innerHTML`、`dangerouslySetInnerHTML` 严格审查，并对用户输入做转义。
- 敏感操作（修改密码、删除数据）要求重新输入密码或二次验证。

### 6.2 CORS 与 API 安全
**现状**：后端 `CORSMiddleware(allow_origins=["*"])` 开放所有来源，生产环境极不安全。

**优化方案**：
- 生产环境 `allow_origins` 严格限制为前端域名。
- 前端 `next.config.js` rewrites 中的 `backend:8000` 在本地开发可用，生产应通过环境变量配置真实后端地址。
- API 添加 rate limiting（如后端使用 slowapi 或 redis 限流）。

### 6.3 安全响应头
**现状**：`next.config.js` 未配置任何安全头。

**优化方案**：
- 配置 `headers`：
  - `Content-Security-Policy`：限制脚本/样式来源
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- 画布模式使用全屏 API 时，注意 CSP 对全屏无影响，但避免使用 eval。

### 6.4 输入安全
**现状**：部分接口返回的数据直接渲染到 DOM（如 `alert.suggestions` 中的字符串），若后端未过滤可能触发 XSS。

**优化方案**：
- 对后端返回的文本使用 DOMPurify 或 React 默认转义（不使用 `dangerouslySetInnerHTML`）。
- 上传文件校验类型与大小，后端同样校验。

---

## 七、代码质量与规范（P2）

### 7.1 ESLint + Prettier + Git Hooks
**现状**：项目只有默认 `next lint`，没有自定义规则，代码风格不统一。

**优化方案**：
- 创建 `.eslintrc.json`：启用 `eslint:recommended`、`next/core-web-vitals`、`plugin:react-hooks/recommended`。
- 创建 `.prettierrc`：统一 `singleQuote`、`trailingComma`、`semi`。
- 安装 `husky` + `lint-staged`，在 `pre-commit` 时自动 lint 与 format。
- CI 中增加 `npm run lint` 与 `npm run build` 检查。

### 7.2 路径别名统一
**现状**：代码中混用 `@/lib/api`、`../components/TypeWriter`、`@/components/Navbar`。

**优化方案**：
- 统一使用 `@/` 别名。
- 配置 `jsconfig.json` 或 `tsconfig.json` 的 `paths`。
- lint 规则禁用相对路径超过两层的导入。

### 7.3 组件拆分
**现状**：
- `page.js` 300+ 行，包含 Hero、FeatureGrid、CTA。
- `dashboard/page.js` 260+ 行，包含多个图表与数据卡片。
- `MetabolicPathway.jsx` 300+ 行，逻辑与 UI 混杂。

**优化方案**：
- 按职责拆分：
  - `app/(home)/sections/HeroSection.tsx`
  - `app/(home)/sections/FeatureGrid.tsx`
  - `app/(home)/sections/CTASection.tsx`
  - `dashboard/components/HealthScoreCard.tsx`
  - `dashboard/components/RiskRadarCard.tsx`
  - `dashboard/components/BodyMetricsCard.tsx`
  - `metabolic-pathway/constants/pathways.ts`
  - `metabolic-pathway/hooks/usePathwayChart.ts`

### 7.4 常量与配置集中
**现状**：颜色、数值、选项数组散落在组件中，如 `goalOptions`、`restrictionOptions`、`activityOptions` 在 profile 页面硬编码。

**优化方案**：
- 创建 `constants/profile.ts`、`constants/dashboard.ts`。
- 将选项、阈值、颜色映射集中管理。

### 7.5 添加单元测试与 E2E 测试
**现状**：无任何测试。

**优化方案**：
- 使用 `Vitest` + `@testing-library/react` 测试关键 Hooks 与工具函数。
- 使用 `Playwright` 覆盖登录、导航、保存 profile 等关键流程。

---

## 八、功能完整性优化（P2）

### 8.1 用户头像上传
**现状**：Profile 页面使用固定 User 图标，没有头像。

**优化方案**：
- 添加头像上传组件，支持点击上传、拖拽上传、圆形裁剪预览。
- 后端新增 `/api/users/avatar` 接口。
- 头像更新后同步到 Navbar 与全局状态。

### 8.2 密码找回与修改
**现状**：登录页没有“忘记密码”入口，profile 页没有修改密码功能。

**优化方案**：
- 新增 `/forgot-password` 页面，输入邮箱发送重置链接。
- 新增 `/reset-password` 页面，通过 token 重置。
- profile 页增加“修改密码”卡片。

### 8.3 Dashboard 数据可视化增强
**现状**：图表配色固定，缺少筛选、下钻、导出。

**优化方案**：
- 为 ECharts 图表添加主题切换（明/暗）。
- 添加时间范围筛选器（近 7 天/30 天/90 天）。
- 支持图表数据导出 CSV/PNG。
- 风险雷达图增加历史对比（本次 vs 上次）。

### 8.4 数据集页面优化
**现状**：未读取数据集页面代码，但通常存在分页、搜索、筛选需求。

**优化方案**：
- 添加分页、关键词搜索、分类筛选。
- 下载进度显示。
- 已导入状态标记。

### 8.5 实时通知与 WebSocket
**现状**：所有数据都靠轮询或页面刷新。

**优化方案**：
- 对营养告警、任务完成等场景引入 WebSocket 或 Server-Sent Events 推送。
- 或使用 React Query 的 refetchInterval 做轮询兜底。

---

## 九、SEO 与可访问性（P2-P3）

### 9.1 页面级 Metadata
**现状**：仅 `layout.js` 有全局 title/description，各页面没有独立 SEO。

**优化方案**：
- 每个页面导出 `metadata` 对象（Next.js App Router 约定）。
- 例如 dashboard 页面：
  ```js
  export const metadata = {
    title: 'Dashboard | MetaNutri',
    description: 'Your personalized metabolic overview and AI nutrition insights.',
  };
  ```

### 9.2 Open Graph 与 社交分享
**现状**：缺少 og:image、twitter:card 等标签。

**优化方案**：
- 准备 1200x630 的 MetaNutri 封面图。
- 在根 layout 与首页配置 OG 标签。

### 9.3 可访问性（a11y）
**现状**：
- 画布模式快捷键 `C` 和语言切换 `Ctrl+Shift+L` 缺少 `aria-label`。
- 部分按钮只有图标没有文字说明。
- 颜色对比度需验证（如浅绿色文字在浅背景上）。

**优化方案**：
- 所有交互元素添加 `aria-label` 或可见文字。
- 画布模式提供屏幕阅读器友好的替代入口。
- 使用 `focus-visible` 替代 `focus`，确保键盘导航可见。
- 验证 WCAG 2.1 AA 对比度，必要时加深文字颜色。

---

## 十、当前已发现的具体代码问题清单

| 文件 | 问题 | 建议 |
|------|------|------|
| `lib/api.js` | 无响应拦截器、无超时、无重试 | 添加 interceptors.response 与 timeout |
| `app/page.js` | 单文件过大、硬编码多 | 拆分为 sections |
| `app/page.js` | `BioCanvas` 始终挂载 | 条件渲染 `{isCanvasMode && <BioCanvas />}` |
| `components/TypeWriter.js` | 使用 `em` 估算宽度，中文仍可能抖动 | 改用双容器或 `minWidth` + 文本预渲染 |
| `components/BioCanvas.jsx` | 未监听 `prefers-reduced-motion` | 添加媒体查询与暂停逻辑 |
| `lib/i18n.js` | 语言不持久化、仅首页使用 | 持久化 + 全页面翻译 |
| `components/Navbar.js` | 每次渲染 JSON.parse localStorage | 使用全局状态或 cookie |
| `app/login/page.js` | 无表单验证、错误提示简陋 | react-hook-form + zod |
| `app/dashboard/page.js` | 无错误边界、整页 loading | 独立卡片骨架屏 + ErrorBoundary |
| `app/profile/page.js` | BMI 计算在渲染中执行 | useMemo + 输入校验 |
| `app/metabolomics/page.js` 等 | 未读取，但大概率重复 token 检查 | 使用 ProtectedRoute |
| `backend/app/main.py` | CORS `allow_origins=["*"]` | 生产环境限制域名 |

---

## 十一、优先级总览

| 优先级 | 优化项 |
|--------|--------|
| **P0** | TypeScript 迁移、API 响应拦截与错误处理、全局认证状态、全站国际化、语言持久化、全局 Loading/骨架屏、Toast 通知、表单校验、错误边界 |
| **P1** | Zustand 状态管理、React Query 缓存、路由守卫 Middleware、BioCanvas 条件渲染与性能、移动端适配、Token 安全 |
| **P2** | 组件拆分、ESLint/Prettier/Husky、单元测试/E2E、头像上传、密码找回、数据可视化增强、SEO Metadata |
| **P3** | Open Graph、RTL 支持、WebSocket 实时通知、高级动画降级策略 |

---

## 十二、推荐的实施顺序

1. **第一阶段（2-3 天）**：认证/状态管理重构 + API 层封装 + 路由守卫 + 错误边界 + Toast
2. **第二阶段（2-3 天）**：全站国际化 + 语言持久化 + 表单校验 + Loading/骨架屏
3. **第三阶段（3-5 天）**：React Query 引入 + Dashboard 重构 + 组件拆分
4. **第四阶段（3-5 天）**：性能优化（Canvas 条件渲染、懒加载）+ 移动端适配 + 安全头
5. **第五阶段（持续）**：测试覆盖 + ESLint/Prettier + 头像/密码找回等功能扩展
