import axios from 'axios';
import { useAuthStore } from './store/authStore';
import { isBackendWarm } from './backendWarmup';
import type {
  ApiErrorLike,
  DatasetList,
  DatasetStats,
  DeficiencyReport,
  FoodScore,
  FoodScoreRequest,
  FoodSearchResult,
  GenomicAnalysis,
  GenomicEntry,
  GenomicEntryInput,
  GlucosePrediction,
  GlucosePredictionRequest,
  LoginCredentials,
  LoginResponse,
  MealPlanRequest,
  MetabolomicsAnalysis,
  MetabolomicsEntry,
  MetabolomicsEntryInput,
  MicrobiomeAnalysis,
  MicrobiomeEntry,
  MicrobiomeEntryInput,
  NutrientAbsorptionPrediction,
  NutrientAbsorptionRequest,
  Recommendation,
  RegisterPayload,
  RiskAssessment,
  TianchiDatasetList,
  User,
  UserProfile,
  UserProfileUpdate,
} from '@/types';

const api = axios.create({
  // Deliberately relative: the browser calls /api/* on the app's own origin and
  // next.config.ts rewrites proxy it to the backend. Same-origin is what makes
  // the httpOnly auth cookies first-party (and visible to middleware).
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  // The backend runs on a free tier that spins down when idle; the first request
  // after that can take well over the old 15s, surfacing as a confusing
  // "Login failed". Give cold starts room to finish.
  timeout: 60000,
});

// Endpoints that must never trigger the silent-refresh flow: a 401 from these is
// a real credential failure, not an expired session.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

const isAuthEndpoint = (url?: string) => !!url && AUTH_ENDPOINTS.some((p) => url.includes(p));

/**
 * Exchange the httpOnly refresh cookie for a fresh session. Concurrent 401s
 * share one in-flight request so a burst of failing calls only refreshes once.
 */
let refreshRequest: Promise<void> | null = null;

const refreshSession = (): Promise<void> => {
  if (!refreshRequest) {
    // Use bare axios (not `api`) to avoid recursing through this interceptor.
    refreshRequest = axios
      .post('/api/auth/refresh', {}, { withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
};

const clearSessionAndRedirect = () => {
  useAuthStore.getState().clearSession();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
};

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

// Shown instead of a bare timeout/network error while the free-tier backend is
// still waking: the request likely failed because the container was booting.
const COLD_START_MESSAGE = '后端服务正在启动（免费实例冷启动，通常需要 30–60 秒），请稍候重试。';

/**
 * Collapse FastAPI's `detail` into a plain string. Request-validation failures
 * return an array of `{ msg, loc }` objects; passing that array straight to
 * `toast.error` would hand React an array of objects as a child and throw.
 */
const normaliseDetail = (detail: unknown): string | undefined => {
  if (typeof detail === 'string') {
    return detail.trim() || undefined;
  }
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) =>
        typeof item === 'string'
          ? item
          : item && typeof item === 'object' && 'msg' in item
            ? String((item as { msg?: unknown }).msg ?? '')
            : ''
      )
      .filter(Boolean);
    return messages.length ? messages.join('；') : undefined;
  }
  return undefined;
};

const getErrorMessage = (error: ApiErrorLike): string => {
  const status = error.response?.status;
  const detail =
    normaliseDetail(error.response?.data?.detail) ??
    normaliseDetail(error.response?.data?.message);

  if (status && ERROR_MESSAGES[String(status)]) {
    return detail || ERROR_MESSAGES[String(status)];
  }

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return isBackendWarm() ? ERROR_MESSAGES.timeout : COLD_START_MESSAGE;
  }

  if (!error.response) {
    return isBackendWarm() ? ERROR_MESSAGES.network : COLD_START_MESSAGE;
  }

  return detail || error.message || ERROR_MESSAGES.unknown;
};

type RetriableConfig = ApiErrorLike['config'] & { _retried?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: ApiErrorLike) => {
    const status = error.response?.status;
    const config = error.config as RetriableConfig | undefined;

    if (status === 401 && config && !isAuthEndpoint(config.url)) {
      if (!config._retried) {
        config._retried = true;
        try {
          await refreshSession();
          // Replay the original request with the freshly minted access cookie.
          return api(config);
        } catch {
          clearSessionAndRedirect();
        }
      } else {
        // Refresh already ran and the retry still 401'd: the session is gone.
        clearSessionAndRedirect();
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
  login: (data: LoginCredentials) => api.post<LoginResponse>('/api/auth/login', data),
  register: (data: RegisterPayload) => api.post<User>('/api/auth/register', data),
  logout: () => api.post<{ message: string }>('/api/auth/logout'),
  me: () => api.get<User>('/api/users/me'),
  forgotPassword: (email: string) =>
    api.post<{ message: string; reset_token?: string | null; reset_url?: string | null }>(
      '/api/auth/forgot-password',
      { email }
    ),
  // The backend pydantic models use snake_case (`new_password`); sending
  // camelCase made these endpoints reject every call with a 422.
  resetPassword: (token: string, newPassword: string) =>
    api.post<{ message: string }>('/api/auth/reset-password', {
      token,
      new_password: newPassword,
    }),
};

export const userAPI = {
  getProfile: () => api.get<UserProfile>('/api/users/profile'),
  updateProfile: (data: UserProfileUpdate) => api.put<UserProfile>('/api/users/profile', data),
  // See authAPI.resetPassword: the backend expects `old_password`/`new_password`.
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post<{ message: string }>('/api/users/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    }),
};

export const foodAPI = {
  search: (q: string, params: Record<string, unknown> = {}) =>
    api.get<FoodSearchResult>('/api/foods/search', { params: { q, ...params } }),
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
  download: (datasetId: string) =>
    api.post<{ message: string }>(`/api/datasets/download/${datasetId}`),
  downloadAll: () => api.post<{ message: string }>('/api/datasets/download'),
  import: (datasetId: string) => api.post<{ message: string }>(`/api/datasets/import/${datasetId}`),
  stats: () => api.get<DatasetStats>('/api/datasets/stats'),
  tianchiList: () => api.get<TianchiDatasetList>('/api/datasets/tianchi'),
};

export const nutritionAlertAPI = {
  getDeficiencies: () => api.get<DeficiencyReport>('/api/nutrition-alerts/deficiencies'),
};
