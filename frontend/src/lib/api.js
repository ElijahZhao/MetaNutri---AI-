import axios from 'axios';
import { useAuthStore } from './store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    const message = error.response?.data?.detail || 
                    error.response?.data?.message || 
                    error.message || 
                    'Something went wrong';
    
    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  me: () => api.get('/api/users/me'),
};

export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
};

export const foodAPI = {
  search: (q, params = {}) => api.get('/api/foods/search', { params: { q, ...params } }),
  getById: (id) => api.get(`/api/foods/${id}`),
};

export const genomicAPI = {
  upload: (data) => api.post('/api/genomic/upload', data),
  getUserData: () => api.get('/api/genomic/user'),
  analyze: () => api.post('/api/genomic/analysis'),
};

export const microbiomeAPI = {
  upload: (data) => api.post('/api/microbiome/upload', data),
  getUserData: () => api.get('/api/microbiome/user'),
  analyze: () => api.post('/api/microbiome/analysis'),
};

export const metabolomicsAPI = {
  upload: (data) => api.post('/api/metabolomics/upload', data),
  getUserData: () => api.get('/api/metabolomics/user'),
  analyze: () => api.get('/api/metabolomics/analysis'),
  delete: (id) => api.delete(`/api/metabolomics/${id}`),
};

export const recommendationAPI = {
  getPersonalized: () => api.get('/api/recommendations/personalized'),
  foodScore: (data) => api.post('/api/recommendations/food-score', data),
  mealPlan: (data) => api.post('/api/recommendations/meal-plan', data),
};

export const predictAPI = {
  glucoseResponse: (data) => api.post('/api/predict/glucose-response', data),
  nutrientAbsorption: (data) => api.post('/api/predict/nutrient-absorption', data),
  riskAssessment: () => api.get('/api/predict/risk-assessment'),
};

export const datasetAPI = {
  list: () => api.get('/api/datasets'),
  categories: () => api.get('/api/datasets/categories'),
  download: (datasetId) => api.post(`/api/datasets/download/${datasetId}`),
  downloadAll: () => api.post('/api/datasets/download'),
  import: (datasetId) => api.post(`/api/datasets/import/${datasetId}`),
  stats: () => api.get('/api/datasets/stats'),
  tianchiList: () => api.get('/api/datasets/tianchi'),
  tianchiSearch: (keyword, category) => api.get('/api/datasets/tianchi/search', { params: { keyword, category } }),
  tianchiDetail: (datasetId) => api.get(`/api/datasets/tianchi/${datasetId}`),
};

export const nutritionAlertAPI = {
  getDeficiencies: () => api.get('/api/nutrition-alerts/deficiencies'),
  getSummary: () => api.get('/api/nutrition-alerts/summary'),
};

export const importExportAPI = {
  importData: (dataType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/import-export/import/${dataType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
  exportData: (dataType, format = 'json') => api.get(`/api/import-export/export/${dataType}?format=${format}`),
  getTemplate: (dataType) => api.get(`/api/import-export/templates/${dataType}`),
};
