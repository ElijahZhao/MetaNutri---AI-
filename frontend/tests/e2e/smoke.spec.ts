import { test, expect, type Page, type Route } from '@playwright/test';

// 跨域请求（默认后端 http://localhost:8000）在浏览器里受 CORS 约束，
// 因此 fulfill 时必须回带 CORS 头，并处理预检 OPTIONS。
const CORS_HEADERS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'access-control-allow-headers': 'authorization,content-type',
};

const fulfillJson = (route: Route, status: number, body: unknown) =>
  route.fulfill({
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
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
  [/\/api\/auth\/login/, { access_token: 'e2e-token', token_type: 'bearer' }],
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
    const request = route.request();
    if (request.method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: CORS_HEADERS });
    }

    const { pathname } = new URL(request.url());

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

  await page.locator('input[type="text"]').fill('demo');
  await page.locator('input[type="password"]').fill('Demo1234!');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Nutrition Dashboard' })).toBeVisible();
  // BodyMetricsCard 曾用 t.activity（对象）渲染，这里确保标签正常显示。
  await expect(page.getByText('Activity', { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
