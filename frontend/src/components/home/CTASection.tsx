"use client";
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { useLanguage } from '@/lib/i18n';

export default function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {t.ctaSectionTitle}
          </h2>
          <p className="text-emerald-100 text-lg mb-10">
            {t.ctaSectionSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-emerald-600 bg-white rounded-xl hover:bg-emerald-50 transition-all hover:shadow-xl overflow-hidden"
            >
              <span className="relative z-10">{t.ctaFree}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
            <Link
              href="/datasets"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-white/10 border border-white/30 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm overflow-hidden"
            >
              <span className="relative z-10">{t.ctaExplore}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
