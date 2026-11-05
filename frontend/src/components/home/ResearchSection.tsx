"use client";
import { ArrowUpRight, FileText } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { useLanguage } from '@/lib/i18n';

/**
 * 落地页的「研究线」区块。
 *
 * 目的：访客通常不读论文、也不翻仓库代码，这里用最少的文字说清项目做了什么、
 * 结论是什么、结论能去哪里核（DOI + 公开仓库）。
 */

const PAPERS = [
  {
    id: 'ppgr',
    title:
      'Measurement Reliability Confounds Cross-Regime Comparisons of Postprandial Glucose Prediction: Evidence from Bidirectional Cross-Cohort Transfer',
    doi: '10.21203/rs.3.rs-11558064/v1',
    href: 'https://doi.org/10.21203/rs.3.rs-11558064/v1',
    metaKey: 'researchPaper1Meta',
  },
  {
    id: 'nutriqa',
    title:
      'NutriQA: A Traceable RAG Question-Answering Benchmark and Empirical Study on Official Chinese Nutrition Data',
    doi: '10.21203/rs.3.rs-11565315/v1',
    href: 'https://doi.org/10.21203/rs.3.rs-11565315/v1',
    metaKey: 'researchPaper2Meta',
  },
] as const;

const STATS = [
  {
    valueKey: 'researchStat1Value',
    labelKey: 'researchStat1Label',
    delay: 'md:delay-100',
  },
  {
    valueKey: 'researchStat2Value',
    labelKey: 'researchStat2Label',
    delay: 'md:delay-200',
  },
  {
    valueKey: 'researchStat3Value',
    labelKey: 'researchStat3Label',
    delay: 'md:delay-300',
  },
] as const;

const LINKS = [
  {
    labelKey: 'researchLinkPlatform',
    href: 'https://github.com/ElijahZhao/MetaNutri---AI-',
  },
  {
    labelKey: 'researchLinkRag',
    href: 'https://github.com/ElijahZhao/MetaNutri-Ai-RAG',
  },
  {
    labelKey: 'researchLinkPpgr',
    href: 'https://github.com/ElijahZhao/MetaNutri-Ai-ppgr-predictor',
  },
] as const;

export default function ResearchSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-emerald-50/40 via-white to-white">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-emerald-600 font-semibold tracking-[0.2em] text-xs uppercase mb-4">
              {t.researchEyebrow}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {t.researchTitle}
            </h2>
            <p className="text-slate-600 max-w-3xl mx-auto">{t.researchSubtitle}</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {STATS.map((stat) => (
            <ScrollReveal key={stat.valueKey} className={stat.delay}>
              <div className="h-full p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/80 border-b-slate-300/60 shadow-lg shadow-slate-300/40 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-2">
                  {t[stat.valueKey]}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{t[stat.labelKey]}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {PAPERS.map((paper) => (
            <ScrollReveal key={paper.id} className="md:delay-100">
              <article className="h-full p-7 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/80 border-b-slate-300/60 shadow-lg shadow-slate-300/40 flex flex-col">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center mb-5 shadow-md shadow-slate-200/50">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2 leading-snug">
                  {paper.title}
                </h3>
                <p className="text-sm text-slate-600 mb-5">{t[paper.metaKey]}</p>
                <a
                  href={paper.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  <span className="font-mono">{paper.doi}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 sm:gap-8">
            <span className="text-sm text-slate-500 text-center sm:text-left">
              {t.researchLinksLabel}
            </span>
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors"
              >
                {t[link.labelKey]}
                <ArrowUpRight className="w-4 h-4" />
              </a>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
