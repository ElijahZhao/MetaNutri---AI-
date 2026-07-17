'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { userAPI, predictAPI, recommendationAPI } from '@/lib/api';
import { Activity, TrendingUp, ShieldAlert, Utensils, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [risk, setRisk] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [profileRes, riskRes, recRes] = await Promise.all([
        userAPI.getProfile().catch(() => ({ data: null })),
        predictAPI.riskAssessment(),
        recommendationAPI.getPersonalized(),
      ]);
      setProfile(profileRes.data);
      setRisk(riskRes.data);
      setRecommendations(recRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

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
        data: [{ value: risk ? 1 - risk.overall_risk_score : 0.8, name: 'Health Score' }],
      },
    ],
  };

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
            name: 'Risk Profile',
            areaStyle: { color: 'rgba(239, 68, 68, 0.2)' },
            lineStyle: { color: '#ef4444' },
            itemStyle: { color: '#ef4444' },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Nutrition Dashboard</h1>
          <p className="text-slate-600">Your personalized metabolic overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Health Score</p>
                <p className="text-xl font-bold text-slate-900">
                  {risk ? ((1 - risk.overall_risk_score) * 100).toFixed(0) : '--'}%
                </p>
              </div>
            </div>
            <ReactECharts option={gaugeOption} style={{ height: 160 }} />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Risk Profile</p>
                <p className="text-xl font-bold text-slate-900">Assessment</p>
              </div>
            </div>
            <ReactECharts option={radarOption} style={{ height: 180 }} />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Body Metrics</p>
                <p className="text-xl font-bold text-slate-900">
                  {profile ? `${profile.weight_kg} kg` : 'Not set'}
                </p>
              </div>
            </div>
            {profile ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Age</span>
                  <span className="font-medium">{profile.age} years</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Height</span>
                  <span className="font-medium">{profile.height_cm} cm</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-600">BMI</span>
                  <span className="font-medium">
                    {((profile.weight_kg / (profile.height_cm / 100) ** 2)).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Activity</span>
                  <span className="font-medium capitalize">{profile.activity_level || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Complete your profile to see metrics.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Utensils className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Recent Recommendations</h2>
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
              <p className="text-sm text-slate-500">No recommendations yet. Generate a meal plan to get started.</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-slate-900">Health Suggestions</h2>
            </div>
            {risk && risk.suggestions.length > 0 ? (
              <ul className="space-y-3">
                {risk.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Run a risk assessment to see personalized suggestions.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
