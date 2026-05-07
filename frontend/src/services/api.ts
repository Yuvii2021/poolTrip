import axios from 'axios';
import { AuthResponse, TravelPackage, PackageRequest, UserRole, PackageWithDistanceResponse, FilterOptionsResponse, PackageFilters, BookingRequest, BookingResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8091/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const inflightGetRequests = new Map<string, Promise<unknown>>();

function dedupeGet<T>(key: string, requester: () => Promise<T>): Promise<T> {
  const existing = inflightGetRequests.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const request = requester().finally(() => {
    inflightGetRequests.delete(key);
  });

  inflightGetRequests.set(key, request as Promise<unknown>);
  return request;
}

function getWithDedupe<T>(url: string): Promise<T> {
  const token = localStorage.getItem('token') ?? 'guest';
  return dedupeGet(`${token}::${url}`, async () => {
    const response = await api.get(url);
    return response.data as T;
  });
}

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-logout on 401 (expired/invalid JWT)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: async (phone: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { phone, password });
    return response.data;
  },

  register: async (data: {
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
    // Ensure Otp is not empty
    if (!data.Otp || data.Otp.trim().length === 0) {
      throw new Error('OTP is required');
    }
    
    // Prepare the request payload - ensure Otp is included and matches backend DTO exactly
    const requestPayload: any = {
      email: data.email.trim(),
      password: data.password,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      Otp: data.Otp.trim(), // Ensure OTP is trimmed and included - must match backend field name exactly
    };
    
    // Add whatsappNumber only if provided and not empty
    if (data.whatsappNumber && data.whatsappNumber.trim().length > 0) {
      requestPayload.whatsappNumber = data.whatsappNumber.trim();
    }
    
    const response = await api.post('/auth/register', requestPayload);
    return response.data;
  },

  getCurrentUser: async (): Promise<any> => {
    return getWithDedupe<any>('/auth/me');
  },

  getUserById: async (id: number): Promise<any> => {
    return getWithDedupe<any>(`/auth/user/${id}`);
  },

  updateCurrentUser: async (updates: { fullName?: string; email?: string; whatsappNumber?: string; bio?: string }) => {
    const response = await api.put('/auth/me', updates);
    return response.data;
  },

  sendEmailOtp: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/email/send-otp', { email });
    return response.data;
  },

  verifyEmailOtp: async (otp: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/email/verify-otp', { otp });
    return response.data;
  },

  uploadProfilePhoto: async (file: File): Promise<{ profilePhoto: string | null }> => {
    const fd = new FormData();
    fd.append('photo', file);
    const response = await api.post('/auth/me/profile-photo', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  sendOtp: async (phone: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/send-otp', { phone });
    return response.data;
  },

  forgotPassword: async (phone: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password', { phone });
    return response.data;
  },

  resetPassword: async (phone: string, otp: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', { phone, otp, newPassword });
    return response.data;
  },
};

// Helper: builds a multipart FormData from a PackageRequest + optional media files
function buildPackageFormData(data: PackageRequest, mediaFiles?: File[]): FormData {
  const fd = new FormData();

  // Dynamically append all fields from the request object
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      // Arrays use indexed keys for Spring @ModelAttribute binding
      value.forEach((item, i) => {
        if (item !== undefined && item !== null && item !== '') {
          fd.append(`${key}[${i}]`, String(item));
        }
      });
    } else {
      fd.append(key, String(value));
    }
  }

  // New media files (images + videos) to upload
  if (mediaFiles && mediaFiles.length > 0) {
    mediaFiles.forEach((file) => fd.append('media', file));
  }

  return fd;
}

// Package APIs
export const packageAPI = {
  getAllPackages: async (filters?: PackageFilters): Promise<TravelPackage[]> => {
    const params = new URLSearchParams();
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.days !== undefined) params.append('days', filters.days.toString());
    if (filters?.minDays !== undefined) params.append('minDays', filters.minDays.toString());
    if (filters?.maxDays !== undefined) params.append('maxDays', filters.maxDays.toString());
    if (filters?.transportation) params.append('transportation', filters.transportation);
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    
    const url = params.toString() ? `/packages?${params.toString()}` : '/packages';
    return getWithDedupe(url);
  },

  getFeaturedPackages: async (): Promise<TravelPackage[]> => {
    return getWithDedupe('/packages/featured');
  },

  getPackageById: async (id: number): Promise<TravelPackage> => {
    return getWithDedupe(`/packages/${id}`);
  },

  searchPackages: async (query: string): Promise<TravelPackage[]> => {
    return getWithDedupe(`/packages/search?query=${encodeURIComponent(query)}`);
  },

  // Search packages by origin and destination, sorted by proximity
  searchPackagesNearby: async (
    origin: string,
    destination: string,
    coords?: {
      originLat?: number;
      originLong?: number;
      destinationLat?: number;
      destinationLong?: number;
    },
  ): Promise<PackageWithDistanceResponse[]> => {
    const params = new URLSearchParams();
    params.append('origin', origin);
    params.append('destination', destination);
    if (coords?.originLat !== undefined) params.append('originLat', String(coords.originLat));
    if (coords?.originLong !== undefined) params.append('originLong', String(coords.originLong));
    if (coords?.destinationLat !== undefined) params.append('destinationLat', String(coords.destinationLat));
    if (coords?.destinationLong !== undefined) params.append('destinationLong', String(coords.destinationLong));
    return getWithDedupe(`/packages/search-nearby?${params.toString()}`);
  },

  // Search all packages sorted by distance from user's origin
  searchPackagesFromOrigin: async (
    origin: string,
    coords?: { originLat?: number; originLong?: number },
  ): Promise<PackageWithDistanceResponse[]> => {
    const params = new URLSearchParams();
    params.append('origin', origin);
    if (coords?.originLat !== undefined) params.append('originLat', String(coords.originLat));
    if (coords?.originLong !== undefined) params.append('originLong', String(coords.originLong));
    return getWithDedupe(`/packages/search-from-origin?${params.toString()}`);
  },

  getPackagesByType: async (type: string, filters?: PackageFilters): Promise<TravelPackage[]> => {
    const params = new URLSearchParams();
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.days !== undefined) params.append('days', filters.days.toString());
    if (filters?.minDays !== undefined) params.append('minDays', filters.minDays.toString());
    if (filters?.maxDays !== undefined) params.append('maxDays', filters.maxDays.toString());
    if (filters?.transportation) params.append('transportation', filters.transportation);
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    
    const url = params.toString() ? `/packages/type/${type}?${params.toString()}` : `/packages/type/${type}`;
    return getWithDedupe(url);
  },

  getPackagesByTypeAndOrigin: async (
    type: string,
    originLat: number,
    originLong: number,
    filters?: PackageFilters
  ): Promise<TravelPackage[]> => {
    const params = new URLSearchParams();
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.days !== undefined) params.append('days', filters.days.toString());
    if (filters?.minDays !== undefined) params.append('minDays', filters.minDays.toString());
    if (filters?.maxDays !== undefined) params.append('maxDays', filters.maxDays.toString());
    if (filters?.transportation) params.append('transportation', filters.transportation);
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    
    return getWithDedupe(
      `/packages/type/${type}/originLat/${originLat}/originLong/${originLong}?${params.toString()}`
    );
  },

  getFilterOptions: async (): Promise<FilterOptionsResponse> => {
    return getWithDedupe('/packages/filter-options');
  },

  getMyPackages: async (): Promise<TravelPackage[]> => {
    return getWithDedupe('/packages/my-packages');
  },

  getPackagesByUserId: async (userId: number): Promise<TravelPackage[]> => {
    return getWithDedupe(`/packages/user/${userId}`);
  },

  createPackage: async (data: PackageRequest, mediaFiles?: File[]): Promise<TravelPackage> => {
    const formData = buildPackageFormData(data, mediaFiles);
    const response = await api.post('/packages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updatePackage: async (id: number, data: PackageRequest, mediaFiles?: File[]): Promise<TravelPackage> => {
    const formData = buildPackageFormData(data, mediaFiles);
    const response = await api.put(`/packages/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deletePackage: async (id: number): Promise<void> => {
    await api.delete(`/packages/${id}`);
  },
};

// Newsletter / Subscribe
export const subscribeAPI = {
  subscribe: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/subscribe', { email });
    return response.data;
  },
};

// Booking APIs
export const bookingAPI = {
  createBooking: async (data: BookingRequest): Promise<BookingResponse> => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  approveBooking: async (bookingId: number): Promise<BookingResponse> => {
    const response = await api.post(`/bookings/${bookingId}/approve`);
    return response.data;
  },

  rejectBooking: async (bookingId: number): Promise<BookingResponse> => {
    const response = await api.post(`/bookings/${bookingId}/reject`);
    return response.data;
  },

  cancelBooking: async (bookingId: number): Promise<BookingResponse> => {
    const response = await api.post(`/bookings/${bookingId}/cancel`);
    return response.data;
  },

  getMyBookings: async (): Promise<BookingResponse[]> => {
    return getWithDedupe('/bookings/my');
  },

  getHostBookings: async (): Promise<BookingResponse[]> => {
    return getWithDedupe('/bookings/host');
  },

  getPendingHostBookings: async (): Promise<BookingResponse[]> => {
    return getWithDedupe('/bookings/host/pending');
  },

  getBookingStatus: async (packageId: number): Promise<BookingResponse | null> => {
    try {
      const response = await api.get(`/bookings/status/${packageId}`);
      if (response.data?.hasActiveBooking && response.data?.booking) {
        return response.data.booking;
      }
      return null;
    } catch {
      return null;
    }
  },

  rateBooking: async (bookingId: number, rating: number, review?: string): Promise<BookingResponse> => {
    const response = await api.post(`/bookings/${bookingId}/rate`, { rating, review });
    return response.data;
  },
};

export default api;


