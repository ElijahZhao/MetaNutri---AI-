import axios from 'axios';
import { useAuthStore } from './store/authStore';
import type {
  ApiErrorLike,
  Dataset,
  DatasetList,
  DatasetStats,
  DeficiencyReport,
  Food,
  FoodScore,
  FoodScoreRequest,
  FoodSearchResult,
  GenomicAnalysis,
  GenomicEntry,
  GenomicEntryInput,
  GlucosePrediction,
  GlucosePredictionRequest,
  LoginCredentials,
  MealPlanRequest,
  MetabolomicsAnalysis,
  MetabolomicsEntry,
  MetabolomicsEntryInput,
  MicrobiomeAnalysis,
  MicrobiomeEntry,
  MicrobiomeEntryInput,
  NutrientAbsorptionPrediction,
  NutrientAbsorptionRequest,
  NutritionSummary,
  Recommendation,
  RegisterPayload,
  RiskAssessment,
  TianchiDatasetList,
  TokenResponse,
  User,
  UserProfile,
  UserProfileUpdate,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // The backend runs on a free tier that spins down when idle; the first request
  // after that can take well over the old 15s, surfacing as a confusing
  // "Login failed". Give cold starts room to finish.
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('metanutri-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

const ERROR_MESSAGES: Record<string, string> = {
  '400': '请求参数错误',
  '401': '登录已过期，请重新登录',
  '403': '权限不足，无法访问',
  '404': '请求的资源不存在',
  '408': '请求超时，请稍后重试',
  '422': '数据验证失败',
  '500': '服务器内部错误',
  '502': '网关错误',
  '503': '服务暂不可用',
  network: '网络连接失败，请检查网络',
  timeout: '请求超时，请稍后重试',
  unknown: '发生未知错误',
};

const getErrorMessage = (error: ApiErrorLike): string => {
  const status = error.response?.status;

  if (status && ERROR_MESSAGES[String(status)]) {
    const detail = error.response?.data?.detail || error.response?.data?.message;
    return detail || ERROR_MESSAGES[String(status)];
  }

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ERROR_MESSAGES.timeout;
  }

  if (!error.response) {
    return ERROR_MESSAGES.network;
  }

  return (
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.message ||
    ERROR_MESSAGES.unknown
  );
};

api.interceptors.response.use(
  (response) => response,
  (error: ApiErrorLike) => {
    const status = error.response?.status;

    if (status === 401) {
      const isAuthRequest =
        error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRequest) {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    error.userMessage = getErrorMessage(error);
    error.statusCode = status;
    error.isNetworkError = !error.response;
    error.isTimeout = error.code === 'ECONNABORTED' || !!error.message?.includes('timeout');

    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (data: LoginCredentials) => api.post<TokenResponse>('/api/auth/login', data),
  register: (data: RegisterPayload) => api.post<User>('/api/auth/register', data),
  me: () => api.get<User>('/api/users/me'),
  forgotPassword: (email: string) =>
    api.post<{ message: string; reset_token?: string | null; reset_url?: string | null }>(
      '/api/auth/forgot-password',
      { email }
    ),
  resetPassword: (token: string, newPassword: string) =>
    api.post<{ message: string }>('/api/auth/reset-password', { token, newPassword }),
};

export const userAPI = {
  getProfile: () => api.get<UserProfile>('/api/users/profile'),
  updateProfile: (data: UserProfileUpdate) => api.put<UserProfile>('/api/users/profile', data),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post<{ message: string }>('/api/users/change-password', { oldPassword, newPassword }),
};

export const foodAPI = {
  search: (q: string, params: Record<string, unknown> = {}) =>
    api.get<FoodSearchResult>('/api/foods/search', { params: { q, ...params } }),
  getById: (id: string) => api.get<Food>(`/api/foods/${id}`),
};

export const genomicAPI = {
  upload: (data: GenomicEntryInput[]) => api.post<GenomicEntry[]>('/api/genomic/upload', data),
  getUserData: () => api.get<GenomicEntry[]>('/api/genomic/user'),
  analyze: () => api.post<GenomicAnalysis>('/api/genomic/analysis'),
};

export const microbiomeAPI = {
  upload: (data: MicrobiomeEntryInput[]) =>
    api.post<MicrobiomeEntry[]>('/api/microbiome/upload', data),
  getUserData: () => api.get<MicrobiomeEntry[]>('/api/microbiome/user'),
  analyze: () => api.post<MicrobiomeAnalysis>('/api/microbiome/analysis'),
};

export const metabolomicsAPI = {
  upload: (data: MetabolomicsEntryInput[]) =>
    api.post<MetabolomicsEntry[]>('/api/metabolomics/upload', data),
  getUserData: () => api.get<MetabolomicsEntry[]>('/api/metabolomics/user'),
  analyze: () => api.post<MetabolomicsAnalysis>('/api/metabolomics/analysis'),
  delete: (id: string) => api.delete<{ message: string }>(`/api/metabolomics/${id}`),
};

export const recommendationAPI = {
  getPersonalized: () => api.get<Recommendation[]>('/api/recommendations/personalized'),
  foodScore: (data: FoodScoreRequest) =>
    api.post<FoodScore>('/api/recommendations/food-score', data),
  mealPlan: (data: MealPlanRequest) =>
    api.post<Recommendation>('/api/recommendations/meal-plan', data),
};

export const predictAPI = {
  glucoseResponse: (data: GlucosePredictionRequest) =>
    api.post<GlucosePrediction>('/api/predict/glucose-response', data),
  nutrientAbsorption: (data: NutrientAbsorptionRequest) =>
    api.post<NutrientAbsorptionPrediction>('/api/predict/nutrient-absorption', data),
  riskAssessment: () => api.get<RiskAssessment>('/api/predict/risk-assessment'),
};

export const datasetAPI = {
  list: () => api.get<DatasetList>('/api/datasets'),
  categories: () => api.get<Array<{ category: string; count: number }>>('/api/datasets/categories'),
  download: (datasetId: string) =>
    api.post<{ message: string }>(`/api/datasets/download/${datasetId}`),
  downloadAll: () => api.post<{ message: string }>('/api/datasets/download'),
  import: (datasetId: string) => api.post<{ message: string }>(`/api/datasets/import/${datasetId}`),
  stats: () => api.get<DatasetStats>('/api/datasets/stats'),
  tianchiList: () => api.get<TianchiDatasetList>('/api/datasets/tianchi'),
  tianchiSearch: (keyword: string, category?: string) =>
    api.get<Dataset[]>('/api/datasets/tianchi/search', { params: { keyword, category } }),
  tianchiDetail: (datasetId: string) => api.get<Dataset>(`/api/datasets/tianchi/${datasetId}`),
};

export const nutritionAlertAPI = {
  getDeficiencies: () => api.get<DeficiencyReport>('/api/nutrition-alerts/deficiencies'),
  getSummary: () => api.get<NutritionSummary>('/api/nutrition-alerts/summary'),
};

export const importExportAPI = {
  importData: (dataType: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ message: string }>(`/api/import-export/import/${dataType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
  exportData: (dataType: string, format = 'json') =>
    api.get<unknown>(`/api/import-export/export/${dataType}?format=${format}`),
  getTemplate: (dataType: string) => api.get<unknown>(`/api/import-export/templates/${dataType}`),
};
