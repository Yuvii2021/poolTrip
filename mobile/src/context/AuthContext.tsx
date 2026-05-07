import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, User, UserRole } from '../types';
import { authAPI, setLogoutCallback } from '../services/api';

interface RegisterData {
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
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
    setLogoutCallback(() => {
      setToken(null);
      setUser(null);
    });
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await AsyncStorage.multiGet(['token', 'user']);
      if (storedToken[1] && storedUser[1]) {
        setToken(storedToken[1]);
        const parsed = JSON.parse(storedUser[1]);
        setUser(parsed);
        try {
          const me = await authAPI.getCurrentUser();
          const merged = { ...parsed, ...me };
          await AsyncStorage.setItem('user', JSON.stringify(merged));
          setUser(merged);
        } catch {
          await AsyncStorage.multiRemove(['token', 'user']);
          setToken(null);
          setUser(null);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthResponse = useCallback(async (response: AuthResponse) => {
    const userData: User = {
      id: response.userId,
      email: response.email,
      fullName: response.fullName,
      phone: response.phone,
      role: response.role,
      agencyName: response.agencyName,
      whatsappNumber: response.whatsappNumber,
    };
    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setToken(response.token);
    setUser(userData);
  }, []);

  const hydrateProfile = useCallback(async () => {
    try {
      const me = await authAPI.getCurrentUser();
      setUser(prev => {
        const merged = { ...(prev || {}), ...me } as User;
        AsyncStorage.setItem('user', JSON.stringify(merged));
        return merged;
      });
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const response = await authAPI.login(phone, password);
    await handleAuthResponse(response);
    await hydrateProfile();
  }, [handleAuthResponse, hydrateProfile]);

  const register = useCallback(async (data: RegisterData) => {
    const response = await authAPI.register(data);
    await handleAuthResponse(response);
    await hydrateProfile();
  }, [handleAuthResponse, hydrateProfile]);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    await hydrateProfile();
  }, [hydrateProfile]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
