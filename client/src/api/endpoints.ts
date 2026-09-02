import api from './client';
import type { Country, City, Shuttle, Booking, FAQ, User } from '../types';

export const countriesApi = {
  getAll: () => api.get<Country[]>('/countries'),
  getBySlug: (slug: string) => api.get<Country>(`/countries/${slug}`),
  create: (data: Partial<Country>) => api.post<Country>('/countries', data),
  update: (id: string, data: Partial<Country>) => api.put<Country>(`/countries/${id}`, data),
  delete: (id: string) => api.delete(`/countries/${id}`),
};

export const citiesApi = {
  getAll: () => api.get<City[]>('/cities'),
  getByCountry: (countrySlug: string) => api.get<City[]>(`/cities/country/${countrySlug}`),
  getBySlug: (slug: string) => api.get<City>(`/cities/${slug}`),
  create: (data: Partial<City>) => api.post<City>('/cities', data),
  update: (id: string, data: Partial<City>) => api.put<City>(`/cities/${id}`, data),
  delete: (id: string) => api.delete(`/cities/${id}`),
};

export const shuttlesApi = {
  getAll: () => api.get<Shuttle[]>('/shuttles'),
  getByCity: (citySlug: string) => api.get<{ departure: Shuttle[]; arrival: Shuttle[] }>(`/shuttles/city/${citySlug}`),
  getBySlug: (slug: string) => api.get<Shuttle>(`/shuttles/${slug}`),
  getFeatured: () => api.get<Shuttle[]>('/shuttles/featured'),
  create: (data: Partial<Shuttle>) => api.post<Shuttle>('/shuttles', data),
  update: (id: string, data: Partial<Shuttle>) => api.put<Shuttle>(`/shuttles/${id}`, data),
  delete: (id: string) => api.delete(`/shuttles/${id}`),
};

export const bookingsApi = {
  getAll: () => api.get<Booking[]>('/bookings'),
  getById: (id: string) => api.get<Booking>(`/bookings/${id}`),
  create: (data: Partial<Booking>) => api.post<Booking>('/bookings', data),
  update: (id: string, data: Partial<Booking>) => api.put<Booking>(`/bookings/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch<Booking>(`/bookings/${id}/status`, { status }),
};

export const faqsApi = {
  getAll: () => api.get<FAQ[]>('/faqs'),
  create: (data: Partial<FAQ>) => api.post<FAQ>('/faqs', data),
  update: (id: string, data: Partial<FAQ>) => api.put<FAQ>(`/faqs/${id}`, data),
  delete: (id: string) => api.delete(`/faqs/${id}`),
};

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User> & { password?: string }) => api.post<User>('/users', data),
  update: (id: string, data: Partial<User> & { password?: string }) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const authApi = {
  login: (email: string, password: string) => api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string }) => api.post<{ token: string; user: User }>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
};
