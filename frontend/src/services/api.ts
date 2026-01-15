import axios from 'axios';
import { AuthResponse, TravelPackage, PackageRequest, UserRole } from '../types';

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
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: UserRole;
    agencyName?: string;
    agencyDescription?: string;
    whatsappNumber?: string;
    city?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Package APIs
export const packageAPI = {
  getAllPackages: async (): Promise<TravelPackage[]> => {
    const response = await api.get('/packages');
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

  getPackagesByType: async (type: string): Promise<TravelPackage[]> => {
    const response = await api.get(`/packages/type/${type}`);
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


