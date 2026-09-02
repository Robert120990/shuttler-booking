import axios from 'axios';

const SERVER_URL = (import.meta.env.VITE_SERVER_URL as string) || 'http://localhost:3001';
const API_URL = `${SERVER_URL}/api`;

export const getImageUrl = (path: string | undefined): string => {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http')) return path;
  return `${SERVER_URL}${path}`;
};

const api = axios.create({
  baseURL: API_URL,
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

export default api;
