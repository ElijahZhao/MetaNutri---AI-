"use client";
import dynamic from 'next/dynamic';
import { ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export default function RiskRadarCard({ risk }) {
  const { t } = useLanguage();

  const radarOption = {
    radar: {
      indicator: [
        { name: 'Diabetes', max: 1 },
        { name: 'Obesity', max: 1 },
        { name: 'Cardiovascular', max: 1 },
      ],
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: risk ? [risk.diabetes_risk, risk.obesity_risk, risk.cardiovascular_risk] : [0.3, 0.3, 0.3],
            name: t.riskProfile,
            areaStyle: { color: 'rgba(239, 68, 68, 0.2)' },
            lineStyle: { color: '#ef4444' },
            itemStyle: { color: '#ef4444' },
          },
        ],
      },
    ],
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{t.riskProfile}</p>
          <p className="text-xl font-bold text-slate-900">Assessment</p>
        </div>
      </div>
      <ReactECharts option={radarOption} style={{ height: 180 }} />
    </div>
  );
}
