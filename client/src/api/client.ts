import axios from 'axios';

export const getBaseServerUrl = (): string => {
  const isBrowser = typeof window !== 'undefined';
  const isLocalhostHost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const rawEnvUrl = (import.meta.env.VITE_SERVER_URL as string) || '';
  
  if (rawEnvUrl) {
    let cleanUrl = rawEnvUrl.replace(/\/+$/, '');
    const isEnvLocalhost = cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1');

    // Upgrade HTTP to HTTPS if page is loaded via HTTPS (prevents Mixed Content blocking on mobile)
    if (isBrowser && window.location.protocol === 'https:' && cleanUrl.startsWith('http://')) {
      cleanUrl = cleanUrl.replace(/^http:\/\//i, 'https://');
    }

    // Only return envUrl if we're on localhost or if envUrl is a remote URL
    if (!isBrowser || isLocalhostHost || !isEnvLocalhost) {
      return cleanUrl;
    }
  }

  // When deployed in production on a real domain/IP, fallback to the current origin
  if (isBrowser && !isLocalhostHost) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return 'http://localhost:3001';
};

export const getImageUrl = (path: string | undefined): string => {
  if (!path) return '/placeholder.jpg';
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && path.startsWith('http://')) {
      return path.replace(/^http:\/\//i, 'https://');
    }
    return path;
  }
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBaseServerUrl()}${cleanPath}`;
};

const api = axios.create({
  baseURL: `${getBaseServerUrl()}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const isBrowser = typeof window !== 'undefined';
  const isLocalhostHost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // Ensure production requests never attempt to hit localhost
  if (isBrowser && !isLocalhostHost) {
    if (!config.baseURL || config.baseURL.includes('localhost') || config.baseURL.includes('127.0.0.1')) {
      config.baseURL = `${window.location.origin.replace(/\/+$/, '')}/api`;
    }
    if (window.location.protocol === 'https:' && config.baseURL?.startsWith('http://')) {
      config.baseURL = config.baseURL.replace(/^http:\/\//i, 'https://');
    }
  }

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

