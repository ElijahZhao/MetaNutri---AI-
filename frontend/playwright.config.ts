import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT || 3000);
const BASE_URL = process.env.E2E_BASE_URL || `http://127.0.0.1:${PORT}`;
// 设置 E2E_BASE_URL 时直接跑已部署的环境，不再本地拉起 server。
const useExternalServer = Boolean(process.env.E2E_BASE_URL);

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: useExternalServer
    ? undefined
    : {
        // `next start` 与 `output: 'standalone'` 不兼容，改为启动生成的
        // server（与 Docker 镜像走同一入口）。需先执行 `npm run build`。
        command: 'npm run start:standalone',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: { PORT: String(PORT) },
      },
});
