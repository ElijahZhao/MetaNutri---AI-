import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

type LinkProps = {
  href?: unknown;
  children?: React.ReactNode;
} & Record<string, unknown>;

// next/link 在单元测试里不需要真实路由，替换成普通 <a> 即可。
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: LinkProps) =>
    React.createElement(
      'a',
      { href: typeof href === 'string' ? href : '#', ...rest },
      children
    ),
}));

// next/navigation 的 hooks 依赖 App Router 运行时，单元测试里用桩替代。
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
});
