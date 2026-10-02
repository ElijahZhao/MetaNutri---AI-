'use client';
import { useEffect } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import MetabolicPathway from '@/components/MetabolicPathway';
import NutritionAlerts from '@/components/NutritionAlerts';
import HealthScoreCard from '@/components/dashboard/HealthScoreCard';
import RiskRadarCard from '@/components/dashboard/RiskRadarCard';
import BodyMetricsCard from '@/components/dashboard/BodyMetricsCard';
import RecommendationsCard from '@/components/dashboard/RecommendationsCard';
import { GenomicCard, MicrobiomeCard, MetabolomicsCard } from '@/components/dashboard/OmicsCards';
import { useProfile, useRiskAssessment, useRecommendations, useGenomicData } from '@/lib/hooks';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import type { ApiErrorLike } from '@/types';
import { SkeletonCard, SkeletonChart } from '@/components/Skeleton';

function DashboardContent() {
  const { t } = useLanguage();
  const profileQuery = useProfile();
  const riskQuery = useRiskAssessment();
  const recommendationsQuery = useRecommendations();
  const genomicQuery = useGenomicData();

  const error =
    profileQuery.error || riskQuery.error || recommendationsQuery.error || genomicQuery.error;

  useEffect(() => {
    if (error) {
      toast.error((error as ApiErrorLike).userMessage || t.error || 'Failed to load data');
    }
  }, [error, t]);

  const profile = profileQuery.data ?? null;
  const risk = riskQuery.data ?? null;
  const recommendations = recommendationsQuery.data ?? [];
  const genomicData = genomicQuery.data ?? [];
  const userGenes: string[] = genomicData.map((d) => d.gene_name).filter(Boolean);

  return (
    <>
      <main id="main-content" tabIndex={-1} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{t.nutritionDashboard}</h1>
          <p className="text-slate-600">{t.personalizedOverview}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {riskQuery.isLoading ? <SkeletonChart /> : <HealthScoreCard risk={risk} />}
          {riskQuery.isLoading ? <SkeletonChart /> : <RiskRadarCard risk={risk} />}
          {profileQuery.isLoading ? <SkeletonCard /> : <BodyMetricsCard profile={profile} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {recommendationsQuery.isLoading ? (
            <SkeletonCard />
          ) : (
            <RecommendationsCard recommendations={recommendations} />
          )}
          <NutritionAlerts />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {genomicQuery.isLoading ? <SkeletonCard /> : <GenomicCard genomicData={genomicData} />}
          <MicrobiomeCard />
          <MetabolomicsCard />
        </div>

        {genomicQuery.isLoading ? <SkeletonChart /> : <MetabolicPathway userGenes={userGenes} />}
      </main>
    </>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
