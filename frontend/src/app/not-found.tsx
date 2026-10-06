'use client';
import Link from 'next/link';
import { Activity, Home, Compass } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 bg-emerald-200/40 rounded-full blur-3xl animate-pulse" />
          </div>
          <div className="relative flex items-center justify-center gap-4">
            <Activity className="w-16 h-16 text-emerald-500" />
            <span className="text-8xl font-extrabold text-slate-200 select-none">404</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">{t.notFound}</h1>
        <p className="text-slate-600 mb-10">{t.notFoundDesc}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <Home className="w-5 h-5" />
            {t.goHome}
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-all"
          >
            <Compass className="w-5 h-5" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
