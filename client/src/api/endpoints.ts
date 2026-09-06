import api from './client';
import type { Country, City, Shuttle, Booking, FAQ, User, Hostel, Review, ReviewStats, ManifestData, PublicSettings } from '../types';

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

export const hostelsApi = {
  getAll: () => api.get<Hostel[]>('/hostels'),
  getByCity: (cityIdentifier: string) => api.get<Hostel[]>(`/hostels/city/${cityIdentifier}`),
  create: (data: Partial<Hostel>) => api.post<Hostel>('/hostels', data),
  update: (id: string, data: Partial<Hostel>) => api.put<Hostel>(`/hostels/${id}`, data),
  delete: (id: string) => api.delete(`/hostels/${id}`),
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
  getManifest: (date: string, shuttleId?: string) =>
    api.get<ManifestData>(`/bookings/manifest?date=${encodeURIComponent(date)}${shuttleId ? `&shuttle_id=${encodeURIComponent(shuttleId)}` : ''}`),
  create: (data: Partial<Booking>) => api.post<Booking>('/bookings', data),
  update: (id: string, data: Partial<Booking>) => api.put<Booking>(`/bookings/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch<Booking & { mailResult?: any }>(`/bookings/${id}/status`, { status }),
  updateBoarding: (id: string, boarding_status: 'pending' | 'boarded' | 'no_show') =>
    api.patch<Booking>(`/bookings/${id}/boarding`, { boarding_status }),
  resendNotification: (id: string, status?: string) => api.post<{ success: boolean; mailResult: any; booking: Booking }>(`/bookings/${id}/notify`, { status }),
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

export const settingsApi = {
  getAll: () => api.get<Record<string, string>>('/settings'),
  getPublic: () => api.get<PublicSettings>('/settings/public'),
  update: (data: Record<string, any>) => api.post<{ message: string; settings: Record<string, string> }>('/settings', data),
  testSmtp: (data: Record<string, any>) => api.post<{ success: boolean; message: string }>('/settings/test-smtp', data, { timeout: 35000 }),
};

export const paymentsApi = {
  paypalCreateOrder: (data: { bookingData: any; currency?: string }) =>
    api.post<{ orderID: string; simulated?: boolean }>('/payments/paypal/create-order', data),
  paypalCaptureOrder: (orderId: string, bookingData?: any) =>
    api.post<{ success: boolean; details: any; simulated?: boolean }>('/payments/paypal/capture-order', { orderId, bookingData }),
  wompiCreateCheckout: (data: { bookingData: any; currency?: string }) =>
    api.post<{ reference: string; amountInCents: number; currency: string; publicKey: string; env: string; simulated?: boolean }>('/payments/wompi/create-checkout', data),
  wompiConfirm: (data: { transactionId: string; reference: string; bookingData?: any }) =>
    api.post<{ success: boolean; transaction: any; simulated?: boolean }>('/payments/wompi/confirm', data),
  payOnArrival: (data: { bookingData: any }) =>
    api.post<{ success: boolean; instructions: string }>('/payments/pay-on-arrival', data),
};

export const reviewsApi = {
  getByShuttle: (shuttleId: string) => api.get<{ reviews: Review[]; stats: ReviewStats }>(`/reviews/shuttle/${shuttleId}`),
  create: (shuttleId: string, data: { user_name: string; user_email?: string; rating: number; comment: string }) =>
    api.post<{ message: string; review: Review; updatedStats: { rating: number; review_count: number } }>(`/reviews/shuttle/${shuttleId}`, data),
  getAllAdmin: (params?: { shuttle_id?: string; rating?: number; status?: string }) =>
    api.get<{ reviews: Review[]; metrics: { totalReviews: number; averageRating: number; fiveStarReviews: number; approvedReviews: number } }>('/reviews', { params }),
  createAdmin: (data: { shuttle_id: string; user_name: string; user_email?: string; rating: number; comment: string }) =>
    api.post<{ message: string; review: Review }>('/reviews/admin', data),
  updateStatus: (id: string, status: 'approved' | 'hidden') =>
    api.patch<{ message: string; id: string; status: string }>(`/reviews/${id}/status`, { status }),
  delete: (id: string) => api.delete<{ message: string }>(`/reviews/${id}`),
};


