import { test, expect, type Page, type Route } from '@playwright/test';

// 前端通过相对路径 /api/* 访问后端（同源，由 next.config.ts rewrites 代理），
// 因此这里用 page.route 打桩即可，无需处理 CORS 预检。
const fulfillJson = (route: Route, status: number, body: unknown) =>
  route.fulfill({
    status,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

// 列表类端点必须返回数组，否则页面在 .map 上会抛错。
const ARRAY_ENDPOINTS: string[] = [
  '/api/recommendations/personalized',
  '/api/genomic/user',
  '/api/microbiome/user',
  '/api/metabolomics/user',
  '/api/datasets',
];

// 返回结构与各 hook / 卡片消费的字段保持一致（见 lib/hooks.ts 与 dashboard 卡片）。
const JSON_ENDPOINTS: Array<[RegExp, unknown]> = [
  // 登录响应只带元数据：JWT 由后端以 httpOnly Cookie 下发，前端读不到。
  [/\/api\/auth\/login/, { token_type: 'bearer', expires_in: 1800 }],
  [/\/api\/users\/me/, { id: 1, username: 'demo', email: 'demo@example.com' }],
  [/\/api\/users\/profile/, { age: 30, height_cm: 175, weight_kg: 70, activity_level: 'moderate' }],
  [
    /\/api\/predict\/risk-assessment/,
    {
      overall_risk_score: 0.22,
      diabetes_risk: 0.25,
      obesity_risk: 0.3,
      cardiovascular_risk: 0.18,
    },
  ],
  // NutritionAlerts 消费的是对象（alerts.alerts / top_priorities），不是数组；
  // 返回 no_data 形状走安全分支（见 backend/app/api/nutrition_alerts.py）。
  [
    /\/api\/nutrition-alerts\/deficiencies/,
    {
      status: 'no_data',
      message: 'No food intake data available.',
      alerts: [],
      overall_score: null,
    },
  ],
];

// 打桩后端，让用例不依赖 Render 实例（可能正在冷启动，也不应把 CI 绑到生产）。
async function mockApi(page: Page) {
  await page.route('**/api/**', async (route) => {
    const { pathname } = new URL(route.request().url());

    if (ARRAY_ENDPOINTS.some((path) => pathname.startsWith(path))) {
      return fulfillJson(route, 200, []);
    }

    const match = JSON_ENDPOINTS.find(([pattern]) => pattern.test(pathname));
    return fulfillJson(route, 200, match ? match[1] : {});
  });
}

test('landing page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toContainText('MetaNutri');
});

test('unauthenticated visitors are redirected from /dashboard to /login', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
});

test('login lands on the dashboard without a blank screen', async ({ page }) => {
  // 回归保护：登录成功后曾因 i18n 键名冲突（对象被当 React child）整页白屏。
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await mockApi(page);
  await page.goto('/login');

  // 真实环境里这个 Cookie 由 /api/auth/login 的 Set-Cookie 下发；打桩路由无法
  // 触发中间件，所以手动种下访问 Cookie，模拟已建立会话。
  const origin = new URL(page.url()).origin;
  await page.context().addCookies([
    { name: 'metanutri_access', value: 'e2e-token', url: origin },
  ]);

  await page.locator('input[type="text"]').fill('demo');
  await page.locator('input[type="password"]').fill('Demo1234!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Nutrition Dashboard' })).toBeVisible();
  // BodyMetricsCard 曾用 t.activity（对象）渲染，这里确保标签正常显示。
  await expect(page.getByText('Activity', { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
