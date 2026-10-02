import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  // vitest 4 起转换器改为 oxc，TS / TSX 与 automatic JSX runtime 均为默认行为，
  // 不再需要此前为 esbuild 编写的 loader 配置。
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    css: false,
  },
});
