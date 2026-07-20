'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, LogOut, User, Menu, X, Globe } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguage } from '@/lib/i18n';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { t, language, toggleLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/dashboard', label: t.dashboard },
    { href: '/genomic', label: t.genomicData },
    { href: '/microbiome', label: t.microbiome },
    { href: '/metabolomics', label: t.metabolomics },
    { href: '/datasets', label: 'Datasets' },
    { href: '/recommendations', label: 'Recommendations' },
    { href: '/predict', label: 'Predictions' },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
              <Activity className="w-6 h-6" />
              MetaNutri
            </Link>
            {user && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              aria-label={language === 'en' ? t.switchToChinese : t.switchToEnglish}
            >
              <Globe className="w-4 h-4" />
              {language === 'en' ? '中文' : 'EN'}
            </button>
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/profile"
                  className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <User className="w-4 h-4" />
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  {t.logout}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
                >
                  {t.login}
                </Link>
              </div>
            )}
            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && user && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-2 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                pathname === link.href
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
          >
            {t.logout}
          </button>
        </div>
      )}
    </nav>
  );
}
