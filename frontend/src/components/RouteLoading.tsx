import Navbar from '@/components/Navbar';
import type { ReactNode } from 'react';

/**
 * 路由级加载骨架的统一外壳：带导航栏 + 标题占位 + 内容区骨架。
 * 供各 `app/**\/loading.tsx` 复用，避免每个路由重复写外壳。
 */
export default function RouteLoading({
  children,
  containerClassName = 'max-w-7xl',
}: {
  children?: ReactNode;
  containerClassName?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className={`${containerClassName} mx-auto px-4 sm:px-6 lg:px-8 py-8`}
        aria-busy="true"
        aria-live="polite"
      >
        <div className="mb-8 space-y-3">
          <div className="h-7 w-56 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-80 bg-slate-200 rounded animate-pulse" />
        </div>
        {children}
      </main>
    </div>
  );
}
