import type { ReactNode } from 'react';

/**
 * 未登录页面（登录 / 找回密码）的统一外壳：
 * 居中 + 渐变背景，页面内容只需返回表单卡片本身。
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
