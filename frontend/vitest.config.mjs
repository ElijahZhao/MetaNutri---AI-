import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  // 源码统一走 `tsx` loader（它是 JS / JSX / TS / TSX 的超集），覆盖 src 与根目录的
  // setup / 配置文件；node_modules 交给 Vite 预打包处理，不做二次转换。
  esbuild: {
    jsx: 'automatic',
    loader: 'tsx',
    include: /\.[cm]?[jt]sx?$/,
    exclude: [/node_modules/],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    css: false,
  },
});
