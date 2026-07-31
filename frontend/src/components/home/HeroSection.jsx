"use client";
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import TypeWriter from '@/components/TypeWriter';
import ScrollReveal from '@/components/ScrollReveal';
import SpotlightTitle from '@/components/SpotlightTitle';
import { useLanguage } from '@/lib/i18n';

export default function HeroSection() {
  const { t, language } = useLanguage();

  return (
    <section className="py-20 px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-blue-50/50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="max-w-4xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-8 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <TypeWriter texts={[t.tagline, t.tagline2, t.tagline3]} speed={80} delay={2500} />
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            {language === 'en' ? 'Build Your' : '构建您的'}
            <SpotlightTitle
              className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500"
              color="rgba(34, 211, 238, 0.7)"
              intensity={0.6}
              speed={4}
              delay={1500}
            >
              {language === 'en' ? 'Metabolic Digital Twin' : '代谢数字孪生'}
            </SpotlightTitle>
          </h1>
        </ScrollReveal>

        <ScrollReveal className="mt-8">
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </ScrollReveal>

        <ScrollReveal className="mt-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 overflow-hidden"
            >
              <span className="relative z-10">{t.cta1}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/30 to-emerald-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-emerald-300 transition-all hover:shadow-lg relative overflow-hidden"
            >
              <span className="relative z-10">{t.cta2}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
