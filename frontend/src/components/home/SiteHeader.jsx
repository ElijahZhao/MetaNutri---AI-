"use client";
import Link from 'next/link';
import { Activity, Globe, Maximize2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function SiteHeader({ onEnterCanvas }) {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
          <Activity className="w-6 h-6" />
          MetaNutri
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onEnterCanvas}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
            title={language === 'en' ? 'Canvas Mode (C)' : '画布模式 (C)'}
          >
            <Maximize2 className="w-4 h-4" />
            {language === 'en' ? 'Canvas' : '画布'}
          </button>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
            title={`${language === 'en' ? 'Switch to Chinese' : '切换到英文'} (Ctrl+Shift+L)`}
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'EN' : '中文'}
          </button>
          <Link
            href="/login"
            className="group px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-500/30 relative overflow-hidden"
          >
            <span className="relative z-10">{t.getStarted}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Link>
        </div>
      </div>
    </header>
  );
}
