import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const SERVER_URL = 'http://localhost:3001';

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
