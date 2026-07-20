'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { predictAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'react-hot-toast';
import { Brain, Activity, Pill, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

function PredictContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [glucose, setGlucose] = useState(null);
  const [nutrient, setNutrient] = useState(null);
  const [loadingGlucose, setLoadingGlucose] = useState(false);
  const [loadingNutrient, setLoadingNutrient] = useState(false);
  const [nutrientForm, setNutrientForm] = useState({ nutrient: 'Iron', amount_mg: 18 });

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
  }, [router, isAuthenticated]);

  const predictGlucose = async () => {
    setLoadingGlucose(true);
    try {
      const res = await predictAPI.glucoseResponse({ user_id: 'me', food_ids: [] });
      setGlucose(res.data);
    } catch (e) { 
      console.error(e); 
      toast.error(e.userMessage || 'Failed to predict glucose response');
    } finally { setLoadingGlucose(false); }
  };

  const predictNutrient = async (e) => {
    e.preventDefault();
    setLoadingNutrient(true);
    try {
      const res = await predictAPI.nutrientAbsorption({ user_id: 'me', nutrient: nutrientForm.nutrient, amount_mg: nutrientForm.amount_mg });
      setNutrient(res.data);
    } catch (e) { 
      console.error(e); 
      toast.error(e.userMessage || 'Failed to predict nutrient absorption');
    } finally { setLoadingNutrient(false); }
  };

  const glucoseOption = glucose ? {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: glucose.predicted_glucose_curve.map(d => `${d.time}m`), name: 'Time' },
    yAxis: { type: 'value', name: 'Glucose (mg/dL)', min: 60 },
    series: [{
      data: glucose.predicted_glucose_curve.map(d => d.glucose),
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(16, 185, 129, 0.2)' },
      lineStyle: { color: '#10b981', width: 3 },
      itemStyle: { color: '#10b981' },
      markPoint: { data: [{ type: 'max', name: 'Peak' }] },
    }],
  } : {};

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-emerald-600" />
            AI Predictions
          </h1>
          <p className="text-slate-600">Run metabolic models to predict responses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500" />
                Glucose Response Prediction
              </h2>
              <button onClick={predictGlucose} disabled={loadingGlucose} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-60">
                {loadingGlucose && <Loader2 className="w-4 h-4 animate-spin" />}
                Predict
              </button>
            </div>
            {glucose ? (
              <div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-500">Peak Glucose</p>
                    <p className="text-lg font-bold text-slate-900">{glucose.peak_glucose.toFixed(0)}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-500">Time to Peak</p>
                    <p className="text-lg font-bold text-slate-900">{glucose.time_to_peak}m</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-500">HbA1c Est.</p>
                    <p className="text-lg font-bold text-slate-900">{glucose.aic_score}%</p>
                  </div>
                </div>
                <ReactECharts option={glucoseOption} style={{ height: 280 }} />
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-slate-500">Click Predict to simulate a glucose curve based on your profile.</div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-500" />
              Nutrient Absorption
            </h2>
            <form onSubmit={predictNutrient} className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nutrient</label>
                  <select value={nutrientForm.nutrient} onChange={(e) => setNutrientForm({ ...nutrientForm, nutrient: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option>Iron</option><option>Calcium</option><option>Vitamin C</option><option>Vitamin D</option><option>Zinc</option><option>Magnesium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (mg)</label>
                  <input type="number" value={nutrientForm.amount_mg} onChange={(e) => setNutrientForm({ ...nutrientForm, amount_mg: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <button type="submit" disabled={loadingNutrient} className="w-full py-2.5 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                {loadingNutrient && <Loader2 className="w-4 h-4 animate-spin" />}
                Predict Absorption
              </button>
            </form>
            {nutrient && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-blue-600">Absorption Rate</p>
                    <p className="text-xl font-bold text-blue-800">{(nutrient.absorption_rate * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Bioavailability</p>
                    <p className="text-xl font-bold text-blue-800">{nutrient.bioavailability_score}</p>
                  </div>
                </div>
                <p className="text-sm text-blue-800">{nutrient.recommendation}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PredictPage() {
  return (
    <ErrorBoundary>
      <PredictContent />
    </ErrorBoundary>
  );
}
