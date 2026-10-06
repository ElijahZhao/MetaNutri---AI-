import type { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

/**
 * 受保护区域的统一外壳。
 *
 * 导航栏与登录守卫都在这里统一挂载，页面自身不再重复包裹
 * `<Navbar />` / `<ProtectedRoute>`，`loading.tsx` 也能共享同一外壳。
 * 路由组目录名带括号，不影响 URL。
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        {children}
      </div>
    </ProtectedRoute>
  );
}
