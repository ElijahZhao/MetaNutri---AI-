'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Activity, LogOut, User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/genomic', label: 'Genomic' },
    { href: '/microbiome', label: 'Microbiome' },
    { href: '/metabolomics', label: 'Metabolomics' },
    { href: '/datasets', label: 'Datasets' },
    { href: '/recommendations', label: 'Recommendations' },
    { href: '/predict', label: 'Predictions' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl">
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
          <div className="flex items-center gap-4">
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-slate-600 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-emerald-600 transition-colors"
                >
                  Login
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
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
