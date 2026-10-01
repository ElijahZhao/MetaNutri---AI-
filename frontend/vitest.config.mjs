import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  // 项目里部分组件是 .js 后缀但含 JSX（如 Navbar.js / i18n.js）。Next/SWC 默认支持，
  // 但 Vite 只会把 .jsx 当 JSX，所以这里显式让 src 下的 .js 走 jsx loader。
  esbuild: {
    jsx: 'automatic',
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    css: false,
  },
});
