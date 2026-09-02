import axios from 'axios';

const rawServerUrl = (import.meta.env.VITE_SERVER_URL as string) || '';
const SERVER_URL = rawServerUrl ? rawServerUrl.replace(/\/+$/, '') : 'http://localhost:3001';
const API_URL = `${SERVER_URL}/api`;

export const getImageUrl = (path: string | undefined): string => {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SERVER_URL}${cleanPath}`;
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-retry GET requests when server is performing a cold start
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (config && config.method?.toUpperCase() === 'GET') {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < 3) {
        config.__retryCount += 1;
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return api(config);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
