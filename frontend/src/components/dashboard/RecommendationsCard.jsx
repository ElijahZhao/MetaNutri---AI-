"use client";
import { Utensils } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function RecommendationsCard({ recommendations }) {
  const { t } = useLanguage();

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Utensils className="w-5 h-5 text-emerald-600" />
        <h2 className="text-lg font-semibold text-slate-900">{t.recentRecommendations}</h2>
      </div>
      {recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.slice(0, 5).map((rec) => (
            <div key={rec.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-slate-800 capitalize">
                  {rec.recommendation_type?.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500">
                  {rec.confidence_score ? `${(rec.confidence_score * 100).toFixed(0)}% match` : ''}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{rec.explanation}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{t.noRecommendations}</p>
      )}
    </div>
  );
}
