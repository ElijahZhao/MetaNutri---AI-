"use client";
import { Dna, Brain, Microscope, Shield, Zap, Activity } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { useLanguage } from '@/lib/i18n';

const FEATURES = [
  {
    icon: Dna,
    colorClass: 'emerald',
    titleKey: 'feature1Title',
    descKey: 'feature1Desc',
    delay: 'md:delay-100',
  },
  {
    icon: Brain,
    colorClass: 'blue',
    titleKey: 'feature2Title',
    descKey: 'feature2Desc',
    delay: 'md:delay-200',
  },
  {
    icon: Microscope,
    colorClass: 'amber',
    titleKey: 'feature3Title',
    descKey: 'feature3Desc',
    delay: 'md:delay-300',
  },
  {
    icon: Shield,
    colorClass: 'purple',
    titleKey: 'feature4Title',
    descKey: 'feature4Desc',
    delay: 'md:delay-400',
  },
  {
    icon: Zap,
    colorClass: 'cyan',
    titleKey: 'feature5Title',
    descKey: 'feature5Desc',
    delay: 'md:delay-500',
  },
  {
    icon: Activity,
    colorClass: 'pink',
    titleKey: 'feature6Title',
    descKey: 'feature6Desc',
    delay: 'md:delay-600',
  },
];

const colorMap = {
  emerald: {
    icon: 'text-emerald-600 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    bg: 'from-emerald-100 to-emerald-50',
    hoverShadow: 'hover:shadow-emerald-500/20',
    hoverBorder: 'hover:border-emerald-300/90',
    hoverText: 'group-hover:text-emerald-700',
    gradient: 'from-emerald-50/0 via-emerald-50/50 to-emerald-100/50',
    blob: 'bg-emerald-400/10',
  },
  blue: {
    icon: 'text-blue-600 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    bg: 'from-blue-100 to-blue-50',
    hoverShadow: 'hover:shadow-blue-500/20',
    hoverBorder: 'hover:border-blue-300/90',
    hoverText: 'group-hover:text-blue-700',
    gradient: 'from-blue-50/0 via-blue-50/50 to-blue-100/50',
    blob: 'bg-blue-400/10',
  },
  amber: {
    icon: 'text-amber-600 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    bg: 'from-amber-100 to-amber-50',
    hoverShadow: 'hover:shadow-amber-500/20',
    hoverBorder: 'hover:border-amber-300/90',
    hoverText: 'group-hover:text-amber-700',
    gradient: 'from-amber-50/0 via-amber-50/50 to-amber-100/50',
    blob: 'bg-amber-400/10',
  },
  purple: {
    icon: 'text-purple-600 group-hover:drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]',
    bg: 'from-purple-100 to-purple-50',
    hoverShadow: 'hover:shadow-purple-500/20',
    hoverBorder: 'hover:border-purple-300/90',
    hoverText: 'group-hover:text-purple-700',
    gradient: 'from-purple-50/0 via-purple-50/50 to-purple-100/50',
    blob: 'bg-purple-400/10',
  },
  cyan: {
    icon: 'text-cyan-600 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]',
    bg: 'from-cyan-100 to-cyan-50',
    hoverShadow: 'hover:shadow-cyan-500/20',
    hoverBorder: 'hover:border-cyan-300/90',
    hoverText: 'group-hover:text-cyan-700',
    gradient: 'from-cyan-50/0 via-cyan-50/50 to-cyan-100/50',
    blob: 'bg-cyan-400/10',
  },
  pink: {
    icon: 'text-pink-600 group-hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]',
    bg: 'from-pink-100 to-pink-50',
    hoverShadow: 'hover:shadow-pink-500/20',
    hoverBorder: 'hover:border-pink-300/90',
    hoverText: 'group-hover:text-pink-700',
    gradient: 'from-pink-50/0 via-pink-50/50 to-pink-100/50',
    blob: 'bg-pink-400/10',
  },
};

function FeatureCard({ feature }) {
  const { t } = useLanguage();
  const c = colorMap[feature.colorClass];
  const Icon = feature.icon;

  return (
    <ScrollReveal className={feature.delay}>
      <div className={`group relative p-8 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/80 border-b-slate-300/60 shadow-xl shadow-slate-300/50 hover:shadow-2xl ${c.hoverShadow} ${c.hoverBorder} hover:bg-white/95 transition-all duration-500 hover:-translate-y-1 hover:-translate-y-2 overflow-hidden`}>
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
        <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white/40 to-transparent opacity-60" />
        <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        <div className={`absolute top-0 right-0 w-32 h-32 ${c.blob} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`} />
        <div className="relative">
          <div className={`w-14 h-14 bg-gradient-to-br ${c.bg} rounded-xl flex items-center justify-center mb-6 shadow-md shadow-slate-200/50 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
            <Icon className={`w-7 h-7 ${c.icon} transition-shadow duration-300`} />
          </div>
          <h3 className={`text-xl font-semibold text-slate-900 mb-3 ${c.hoverText} transition-colors`}>{t[feature.titleKey]}</h3>
          <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
            {t[feature.descKey]}
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function FeatureGrid() {
  const { t } = useLanguage();

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {t.whyTitle}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {t.whySubtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((f) => (
            <FeatureCard key={f.titleKey} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
