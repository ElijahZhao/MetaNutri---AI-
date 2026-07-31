'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ErrorBoundary from '@/components/ErrorBoundary';
import MetabolicPathway from '@/components/MetabolicPathway';
import NutritionAlerts from '@/components/NutritionAlerts';
import HealthScoreCard from '@/components/dashboard/HealthScoreCard';
import RiskRadarCard from '@/components/dashboard/RiskRadarCard';
import BodyMetricsCard from '@/components/dashboard/BodyMetricsCard';
import RecommendationsCard from '@/components/dashboard/RecommendationsCard';
import { GenomicCard, MicrobiomeCard, MetabolomicsCard } from '@/components/dashboard/OmicsCards';
import { userAPI, predictAPI, recommendationAPI, genomicAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { SkeletonDashboard } from '@/components/Skeleton';

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
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonDashboard />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{t.nutritionDashboard}</h1>
          <p className="text-slate-600">{t.personalizedOverview}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <HealthScoreCard risk={risk} />
          <RiskRadarCard risk={risk} />
          <BodyMetricsCard profile={profile} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RecommendationsCard recommendations={recommendations} />
          <NutritionAlerts />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <GenomicCard genomicData={genomicData} />
          <MicrobiomeCard />
          <MetabolomicsCard />
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
