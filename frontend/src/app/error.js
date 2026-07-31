'use client';
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 px-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-rose-200/40 rounded-full blur-3xl animate-pulse" />
          </div>
          <div className="relative w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Something went wrong</h2>
        <p className="text-slate-600 mb-8">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
