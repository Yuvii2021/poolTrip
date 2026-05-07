import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, TravelPackage, PackageRequest, UserRole, PackageWithDistanceResponse, FilterOptionsResponse, PackageFilters, BookingRequest, BookingResponse } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8091/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach Bearer token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 → clear auth
let logoutCallback: (() => void) | null = null;
export const setLogoutCallback = (cb: () => void) => { logoutCallback = cb; };

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
      logoutCallback?.();
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───
export const authAPI = {
  login: async (phone: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { phone, password });
    return data;
  },

  register: async (payload: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    Otp: string;
    role: UserRole;
    agencyName?: string;
    agencyDescription?: string;
    whatsappNumber?: string;
    city?: string;
  }): Promise<AuthResponse> => {
    if (!payload.Otp?.trim()) throw new Error('OTP is required');
    const body: Record<string, string> = {
      email: payload.email.trim(),
      password: payload.password,
      fullName: payload.fullName.trim(),
      phone: payload.phone.trim(),
      Otp: payload.Otp.trim(),
    };
    if (payload.whatsappNumber?.trim()) body.whatsappNumber = payload.whatsappNumber.trim();
    if (payload.agencyName?.trim()) body.agencyName = payload.agencyName.trim();
    if (payload.city?.trim()) body.city = payload.city.trim();
    const { data } = await api.post('/auth/register', body);
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  getUserById: async (id: number) => {
    const { data } = await api.get(`/auth/user/${id}`);
    return data;
  },

  updateCurrentUser: async (updates: { fullName?: string; email?: string; whatsappNumber?: string; bio?: string; city?: string }) => {
    const { data } = await api.put('/auth/me', updates);
    return data;
  },

  sendEmailOtp: async (email: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/email/send-otp', { email });
    return data;
  },

  verifyEmailOtp: async (otp: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/email/verify-otp', { otp });
    return data;
  },

  uploadProfilePhoto: async (uri: string, fileName: string, mimeType: string): Promise<{ profilePhoto: string | null }> => {
    const fd = new FormData();
    fd.append('photo', { uri, name: fileName, type: mimeType } as any);
    const { data } = await api.post('/auth/me/profile-photo', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  sendOtp: async (phone: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/send-otp', { phone });
    return data;
  },

  forgotPassword: async (phone: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/forgot-password', { phone });
    return data;
  },

  resetPassword: async (phone: string, otp: string, newPassword: string): Promise<{ message: string }> => {
    const { data } = await api.post('/auth/reset-password', { phone, otp, newPassword });
    return data;
  },
};

// ─── Helpers ───
function buildFilterParams(filters?: PackageFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
  if (filters.days !== undefined) params.append('days', filters.days.toString());
  if (filters.minDays !== undefined) params.append('minDays', filters.minDays.toString());
  if (filters.maxDays !== undefined) params.append('maxDays', filters.maxDays.toString());
  if (filters.transportation) params.append('transportation', filters.transportation);
  if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
  const str = params.toString();
  return str ? `?${str}` : '';
}

interface MediaAsset {
  uri: string;
  fileName: string;
  mimeType: string;
}

function buildPackageFormData(data: PackageRequest, mediaFiles?: MediaAsset[]): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (item !== undefined && item !== null && item !== '') {
          fd.append(`${key}[${i}]`, String(item));
        }
      });
    } else {
      fd.append(key, String(value));
    }
  }
  if (mediaFiles?.length) {
    mediaFiles.forEach((file) => {
      fd.append('media', { uri: file.uri, name: file.fileName, type: file.mimeType } as any);
    });
  }
  return fd;
}

// ─── Packages ───
export const packageAPI = {
  getAllPackages: async (filters?: PackageFilters): Promise<TravelPackage[]> => {
    const { data } = await api.get(`/packages${buildFilterParams(filters)}`);
    return data;
  },

  getFeaturedPackages: async (): Promise<TravelPackage[]> => {
    const { data } = await api.get('/packages/featured');
    return data;
  },

  getPackageById: async (id: number): Promise<TravelPackage> => {
    const { data } = await api.get(`/packages/${id}`);
    return data;
  },

  searchPackages: async (query: string): Promise<TravelPackage[]> => {
    const { data } = await api.get(`/packages/search?query=${encodeURIComponent(query)}`);
    return data;
  },

  searchPackagesNearby: async (origin: string, destination: string): Promise<PackageWithDistanceResponse[]> => {
    const { data } = await api.get(`/packages/search-nearby?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
    return data;
  },

  searchPackagesFromOrigin: async (origin: string): Promise<PackageWithDistanceResponse[]> => {
    const { data } = await api.get(`/packages/search-from-origin?origin=${encodeURIComponent(origin)}`);
    return data;
  },

  getPackagesByType: async (type: string, filters?: PackageFilters): Promise<TravelPackage[]> => {
    const { data } = await api.get(`/packages/type/${type}${buildFilterParams(filters)}`);
    return data;
  },

  getFilterOptions: async (): Promise<FilterOptionsResponse> => {
    const { data } = await api.get('/packages/filter-options');
    return data;
  },

  getMyPackages: async (): Promise<TravelPackage[]> => {
    const { data } = await api.get('/packages/my-packages');
    return data;
  },

  getPackagesByUserId: async (userId: number): Promise<TravelPackage[]> => {
    const { data } = await api.get(`/packages/user/${userId}`);
    return data;
  },

  createPackage: async (formData: PackageRequest, mediaFiles?: MediaAsset[]): Promise<TravelPackage> => {
    const fd = buildPackageFormData(formData, mediaFiles);
    const { data } = await api.post('/packages', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  updatePackage: async (id: number, formData: PackageRequest, mediaFiles?: MediaAsset[]): Promise<TravelPackage> => {
    const fd = buildPackageFormData(formData, mediaFiles);
    const { data } = await api.put(`/packages/${id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deletePackage: async (id: number): Promise<void> => {
    await api.delete(`/packages/${id}`);
  },
};

// ─── Bookings ───
export const bookingAPI = {
  createBooking: async (body: BookingRequest): Promise<BookingResponse> => {
    const { data } = await api.post('/bookings', body);
    return data;
  },

  approveBooking: async (bookingId: number): Promise<BookingResponse> => {
    const { data } = await api.post(`/bookings/${bookingId}/approve`);
    return data;
  },

  rejectBooking: async (bookingId: number): Promise<BookingResponse> => {
    const { data } = await api.post(`/bookings/${bookingId}/reject`);
    return data;
  },

  cancelBooking: async (bookingId: number): Promise<BookingResponse> => {
    const { data } = await api.post(`/bookings/${bookingId}/cancel`);
    return data;
  },

  getMyBookings: async (): Promise<BookingResponse[]> => {
    const { data } = await api.get('/bookings/my');
    return data;
  },

  getHostBookings: async (): Promise<BookingResponse[]> => {
    const { data } = await api.get('/bookings/host');
    return data;
  },

  getPendingHostBookings: async (): Promise<BookingResponse[]> => {
    const { data } = await api.get('/bookings/host/pending');
    return data;
  },

  getBookingStatus: async (packageId: number): Promise<BookingResponse | null> => {
    try {
      const { data } = await api.get(`/bookings/status/${packageId}`);
      if (data?.hasActiveBooking && data?.booking) return data.booking;
      return null;
    } catch {
      return null;
    }
  },

  rateBooking: async (bookingId: number, rating: number, review?: string): Promise<BookingResponse> => {
    const { data } = await api.post(`/bookings/${bookingId}/rate`, { rating, review });
    return data;
  },
};

export default api;
