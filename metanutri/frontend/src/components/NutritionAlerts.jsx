'use client';
import { useEffect, useState } from 'react';
import { nutritionAlertAPI } from '@/lib/api';
import { AlertTriangle, AlertCircle, CheckCircle, Loader2, TrendingUp } from 'lucide-react';

export default function NutritionAlerts() {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await nutritionAlertAPI.getDeficiencies();
      setAlerts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  if (!alerts || alerts.status === 'no_data') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Nutrition Alerts</h2>
        <p className="text-sm text-slate-500">{alerts?.message || 'Generate meal plans to see nutrition deficiency alerts.'}</p>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'moderate': return 'bg-amber-50 border-amber-200 text-amber-800';
      default: return 'bg-emerald-50 border-emerald-200 text-emerald-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'moderate': return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default: return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Nutrition Alerts</h2>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-emerald-600">{alerts.overall_score}</span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-slate-500" />
        <span className="text-sm text-slate-600">{alerts.overall_assessment}</span>
        <span className="text-xs text-slate-400">• {alerts.analysis_period}</span>
      </div>

      {alerts.high_risk_count > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800">
            {alerts.high_risk_count} high-risk deficiency{alerts.high_risk_count > 1 ? 'ies' : 'y'} detected
          </p>
        </div>
      )}

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {alerts.alerts.slice(0, 6).map((alert, i) => (
          <div key={i} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {getSeverityIcon(alert.severity)}
                <span className="font-medium text-sm">{alert.nutrient}</span>
              </div>
              <span className="text-xs font-medium">{alert.percentage}%</span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full ${
                  alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(alert.percentage, 100)}%` }}
              />
            </div>
            <p className="text-xs opacity-80">
              {alert.current_value} / {alert.reference_value} {alert.nutrient.toLowerCase().includes('calories') ? 'kcal' : 'mg/g'}
            </p>
            {alert.severity !== 'low' && (
              <div className="mt-2 flex flex-wrap gap-1">
                {alert.suggestions.slice(0, 3).map((food, j) => (
                  <span key={j} className="px-2 py-0.5 text-xs bg-white/70 rounded-full">{food}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {alerts.top_priorities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h3 className="text-sm font-medium text-slate-700 mb-2">Top Priorities</h3>
          <div className="flex flex-wrap gap-2">
            {alerts.top_priorities.map((priority, i) => (
              <span key={i} className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                {priority.nutrient}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
