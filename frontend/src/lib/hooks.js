"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const queryKeys = {
  profile: ['profile'],
  risk: ['risk-assessment'],
  recommendations: ['recommendations'],
  genomic: ['genomic'],
  microbiome: ['microbiome'],
  metabolomics: ['metabolomics'],
  datasets: ['datasets'],
  alerts: ['nutrition-alerts'],
};

export function useProfile(options = {}) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => userAPI.getProfile().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => userAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useRiskAssessment(options = {}) {
  return useQuery({
    queryKey: queryKeys.risk,
    queryFn: () => predictAPI.riskAssessment().then((res) => res.data),
    ...options,
  });
}

export function useRecommendations(options = {}) {
  return useQuery({
    queryKey: queryKeys.recommendations,
    queryFn: () => recommendationAPI.getPersonalized().then((res) => res.data),
    ...options,
  });
}

export function useGenomicData(options = {}) {
  return useQuery({
    queryKey: queryKeys.genomic,
    queryFn: () => genomicAPI.getUserData().then((res) => res.data),
    ...options,
  });
}

export function useMicrobiomeData(options = {}) {
  return useQuery({
    queryKey: queryKeys.microbiome,
    queryFn: () => microbiomeAPI.getUserData().then((res) => res.data),
    ...options,
  });
}

export function useMetabolomicsData(options = {}) {
  return useQuery({
    queryKey: queryKeys.metabolomics,
    queryFn: () => metabolomicsAPI.getUserData().then((res) => res.data),
    ...options,
  });
}

export function useDatasets(options = {}) {
  return useQuery({
    queryKey: queryKeys.datasets,
    queryFn: () => datasetAPI.list().then((res) => res.data),
    ...options,
  });
}

export function useNutritionAlerts(options = {}) {
  return useQuery({
    queryKey: queryKeys.alerts,
    queryFn: () => nutritionAlertAPI.getSummary().then((res) => res.data),
    ...options,
  });
}
