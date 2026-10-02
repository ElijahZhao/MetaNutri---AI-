import type { ReactNode } from 'react';

/**
 * 路由级加载骨架的统一外壳：标题占位 + 内容区骨架。
 * 供 `app/(app)/**\/loading.tsx` 复用；导航栏与 `min-h-screen` 背景由
 * `(app)/layout.tsx` 统一提供，这里只负责内容区。
 */
export default function RouteLoading({
  children,
  containerClassName = 'max-w-7xl',
}: {
  children?: ReactNode;
  containerClassName?: string;
}) {
  return (
    <>
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
    </>
  );
}
