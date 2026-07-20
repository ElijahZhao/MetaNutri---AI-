'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import MetabolicPathway from '@/components/MetabolicPathway';
import NutritionAlerts from '@/components/NutritionAlerts';
import { userAPI, predictAPI, recommendationAPI, genomicAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { Activity, TrendingUp, ShieldAlert, Utensils, Loader2, Dna, Microscope, Apple } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

function DashboardContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [risk, setRisk] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [genomicData, setGenomicData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router, isAuthenticated]);

  const fetchData = async () => {
    try {
      const [profileRes, riskRes, recRes, genomicRes] = await Promise.all([
        userAPI.getProfile().catch(() => ({ data: null })),
        predictAPI.riskAssessment(),
        recommendationAPI.getPersonalized(),
        genomicAPI.getUserData().catch(() => ({ data: [] })),
      ]);
      setProfile(profileRes.data);
      setRisk(riskRes.data);
      setRecommendations(recRes.data);
      setGenomicData(genomicRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.userMessage || t.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const userGenes = genomicData.map(d => d.gene_name).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-500">{t.loading || 'Loading...'}</p>
        </div>
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
        data: [{ value: risk ? 1 - risk.overall_risk_score : 0.8, name: t.healthScore }],
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
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{t.nutritionDashboard}</h1>
          <p className="text-slate-600">{t.personalizedOverview}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

          <NutritionAlerts />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Dna className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-slate-900">{t.genomicData}</h3>
            </div>
            <div className="space-y-2">
              {genomicData.length > 0 ? (
                genomicData.slice(0, 3).map((d) => (
                  <div key={d.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-sm">
                    <span className="font-medium text-slate-700">{d.gene_name}</span>
                    <span className="text-slate-500 text-xs">{d.snp_id || 'N/A'}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">{t.addData || 'Add data to see analysis'}</p>
              )}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Microscope className="w-5 h-5 text-cyan-600" />
              <h3 className="font-semibold text-slate-900">{t.microbiome}</h3>
            </div>
            <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
              <p className="text-sm text-slate-600">{t.diversityIndex}</p>
              <p className="text-2xl font-bold text-slate-900">--</p>
              <p className="text-xs text-slate-500 mt-1">{t.addData || 'Add microbiome data to see analysis'}</p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Apple className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-slate-900">{t.metabolomics}</h3>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <p className="text-sm text-slate-600">{t.activePathways}</p>
              <p className="text-2xl font-bold text-slate-900">--</p>
              <p className="text-xs text-slate-500 mt-1">{t.addData || 'Add metabolomics data to see analysis'}</p>
            </div>
          </div>
        </div>

        <MetabolicPathway userGenes={userGenes} />
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
