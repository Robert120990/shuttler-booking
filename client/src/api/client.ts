import axios from 'axios';

const getBaseServerUrl = (): string => {
  const envUrl = (import.meta.env.VITE_SERVER_URL as string) || '';
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin.replace(/\/+$/, '');
  }
  return 'http://localhost:3001';
};

const SERVER_URL = getBaseServerUrl();
const API_URL = `${SERVER_URL}/api`;

export const getImageUrl = (path: string | undefined): string => {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBaseServerUrl()}${cleanPath}`;
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
