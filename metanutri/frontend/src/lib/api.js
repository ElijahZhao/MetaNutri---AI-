import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

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
