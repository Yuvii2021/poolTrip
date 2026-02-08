import axios from 'axios';
import { AuthResponse, TravelPackage, PackageRequest, UserRole, PackageWithDistanceResponse, FilterOptionsResponse, PackageFilters } from '../types';

const API_BASE_URL = 'http://localhost:8090/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    
    // Log the request payload (without password) for debugging
    console.log('Sending registration request:', { ...requestPayload, password: '***' });
    console.log('OTP value:', requestPayload.Otp, 'Type:', typeof requestPayload.Otp, 'Length:', requestPayload.Otp?.length);
    console.log('Full payload JSON:', JSON.stringify(requestPayload, null, 2));
    
    const response = await api.post('/auth/register', requestPayload);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
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

// Package APIs
export const packageAPI = {
  getAllPackages: async (filters?: PackageFilters): Promise<TravelPackage[]> => {
    const params = new URLSearchParams();
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.days !== undefined) params.append('days', filters.days.toString());
    if (filters?.transportation) params.append('transportation', filters.transportation);
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    
    const url = params.toString() ? `/packages?${params.toString()}` : '/packages';
    const response = await api.get(url);
    return response.data;
  },

  getFeaturedPackages: async (): Promise<TravelPackage[]> => {
    const response = await api.get('/packages/featured');
    return response.data;
  },

  getPackageById: async (id: number): Promise<TravelPackage> => {
    const response = await api.get(`/packages/${id}`);
    return response.data;
  },

  searchPackages: async (query: string): Promise<TravelPackage[]> => {
    const response = await api.get(`/packages/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Search packages by origin and destination, sorted by distance and itinerary match
  searchPackagesNearby: async (origin: string, destination: string): Promise<PackageWithDistanceResponse[]> => {
    const response = await api.get(`/packages/search-nearby?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
    return response.data;
  },

  // Search all packages sorted by distance from user's origin
  searchPackagesFromOrigin: async (origin: string): Promise<PackageWithDistanceResponse[]> => {
    const response = await api.get(`/packages/search-from-origin?origin=${encodeURIComponent(origin)}`);
    return response.data;
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
    const response = await api.get(url);
    return response.data;
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
    if (filters?.transportation) params.append('transportation', filters.transportation);
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    
    const response = await api.get(
      `/packages/type/${type}/originLat/${originLat}/originLong/${originLong}?${params.toString()}`
    );
    return response.data;
  },

  getFilterOptions: async (): Promise<FilterOptionsResponse> => {
    const response = await api.get('/packages/filter-options');
    return response.data;
  },

  getMyPackages: async (): Promise<TravelPackage[]> => {
    const response = await api.get('/packages/my-packages');
    return response.data;
  },

  createPackage: async (data: PackageRequest): Promise<TravelPackage> => {
    const response = await api.post('/packages', data);
    return response.data;
  },

  updatePackage: async (id: number, data: PackageRequest): Promise<TravelPackage> => {
    const response = await api.put(`/packages/${id}`, data);
    return response.data;
  },

  deletePackage: async (id: number): Promise<void> => {
    await api.delete(`/packages/${id}`);
  },
};

export default api;


