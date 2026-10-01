'use client';
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  userAPI,
  predictAPI,
  recommendationAPI,
  genomicAPI,
  microbiomeAPI,
  metabolomicsAPI,
  datasetAPI,
  nutritionAlertAPI,
} from './api';
import type {
  DatasetList,
  DeficiencyReport,
  GenomicEntry,
  MetabolomicsEntry,
  MicrobiomeEntry,
  Recommendation,
  RiskAssessment,
  UserProfile,
  UserProfileUpdate,
} from '@/types';

const queryKeys = {
  profile: ['profile'] as const,
  risk: ['risk-assessment'] as const,
  recommendations: ['recommendations'] as const,
  genomic: ['genomic'] as const,
  microbiome: ['microbiome'] as const,
  metabolomics: ['metabolomics'] as const,
  datasets: ['datasets'] as const,
  alerts: ['nutrition-alerts'] as const,
};

type QueryOptions<TData> = Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>;

export function useProfile(options: QueryOptions<UserProfile> = {}) {
  return useQuery<UserProfile>({
    queryKey: queryKeys.profile,
    queryFn: () => userAPI.getProfile().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserProfileUpdate) => userAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useRiskAssessment(options: QueryOptions<RiskAssessment> = {}) {
  return useQuery<RiskAssessment>({
    queryKey: queryKeys.risk,
    queryFn: () => predictAPI.riskAssessment().then((res) => res.data),
    ...options,
  });
}

export function useRecommendations(options: QueryOptions<Recommendation[]> = {}) {
  return useQuery<Recommendation[]>({
    queryKey: queryKeys.recommendations,
    queryFn: () => recommendationAPI.getPersonalized().then((res) => res.data),
    ...options,
  });
}

export function useGenomicData(options: QueryOptions<GenomicEntry[]> = {}) {
  return useQuery<GenomicEntry[]>({
    queryKey: queryKeys.genomic,
    queryFn: () => genomicAPI.getUserData().then((res) => res.data),
    ...options,
  });
}

export function useMicrobiomeData(options: QueryOptions<MicrobiomeEntry[]> = {}) {
  return useQuery<MicrobiomeEntry[]>({
    queryKey: queryKeys.microbiome,
    queryFn: () => microbiomeAPI.getUserData().then((res) => res.data),
    ...options,
  });
}

export function useMetabolomicsData(options: QueryOptions<MetabolomicsEntry[]> = {}) {
  return useQuery<MetabolomicsEntry[]>({
    queryKey: queryKeys.metabolomics,
    queryFn: () => metabolomicsAPI.getUserData().then((res) => res.data),
    ...options,
  });
}

export function useDatasets(options: QueryOptions<DatasetList> = {}) {
  return useQuery<DatasetList>({
    queryKey: queryKeys.datasets,
    queryFn: () => datasetAPI.list().then((res) => res.data),
    ...options,
  });
}

export function useNutritionAlerts(options: QueryOptions<DeficiencyReport> = {}) {
  return useQuery<DeficiencyReport>({
    queryKey: queryKeys.alerts,
    queryFn: () => nutritionAlertAPI.getDeficiencies().then((res) => res.data),
    ...options,
  });
}
