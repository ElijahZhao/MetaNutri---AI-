"use client";
import { TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function BodyMetricsCard({ profile }) {
  const { t } = useLanguage();

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{t.bodyMetrics}</p>
          <p className="text-xl font-bold text-slate-900">
            {profile ? `${profile.weight_kg} kg` : t.notSet || 'Not set'}
          </p>
        </div>
      </div>
      {profile ? (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-600">{t.age}</span>
            <span className="font-medium">{profile.age} years</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-600">{t.height}</span>
            <span className="font-medium">{profile.height_cm} cm</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-600">{t.bmi}</span>
            <span className="font-medium">
              {((profile.weight_kg / (profile.height_cm / 100) ** 2)).toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">{t.activity}</span>
            <span className="font-medium capitalize">{profile.activity_level || 'N/A'}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">{t.completeProfile}</p>
      )}
    </div>
  );
}
