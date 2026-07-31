"use client";
import dynamic from 'next/dynamic';
import { Activity } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export default function HealthScoreCard({ risk }) {
  const { t } = useLanguage();

  const gaugeOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 1,
        splitNumber: 5,
        itemStyle: { color: '#10b981' },
        progress: { show: true, width: 18 },
        pointer: { show: false },
        axisLine: { lineStyle: { width: 18 } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 28,
          offsetCenter: [0, '30%'],
          formatter: (value) => `${(value * 100).toFixed(0)}%`,
          color: '#334155',
        },
        data: [{ value: risk ? 1 - risk.overall_risk_score : 0.8, name: t.healthScore }],
      },
    ],
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Activity className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{t.healthScore}</p>
          <p className="text-xl font-bold text-slate-900">
            {risk ? ((1 - risk.overall_risk_score) * 100).toFixed(0) : '--'}%
          </p>
        </div>
      </div>
      <ReactECharts option={gaugeOption} style={{ height: 160 }} />
    </div>
  );
}
