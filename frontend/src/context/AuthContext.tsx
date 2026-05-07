import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthResponse, User, UserRole } from '../types';
import { authAPI } from '../services/api';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();

    const handleForcedLogout = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        try {
          const me = await authAPI.getCurrentUser();
          const merged = { ...JSON.parse(storedUser), ...me };
          localStorage.setItem('user', JSON.stringify(merged));
          setUser(merged);
        } catch {
          // 401 means token is expired/invalid — clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    const response = await authAPI.login(phone, password);
    handleAuthResponse(response);
    // Hydrate extra profile fields
    try {
      const me = await authAPI.getCurrentUser();
      setUser(prev => {
        const merged = { ...(prev || {}), ...me };
        localStorage.setItem('user', JSON.stringify(merged));
        return merged as User;
      });
    } catch {
      // ignore
    }
  };

  const register = async (data: RegisterData) => {
    const response = await authAPI.register(data);
    handleAuthResponse(response);
    // Hydrate extra profile fields
    try {
      const me = await authAPI.getCurrentUser();
      setUser(prev => {
        const merged = { ...(prev || {}), ...me };
        localStorage.setItem('user', JSON.stringify(merged));
        return merged as User;
      });
    } catch {
      // ignore
    }
  };

  const handleAuthResponse = (response: AuthResponse) => {
    const userData: User = {
      id: response.userId,
      email: response.email,
      fullName: response.fullName,
      phone: response.phone,
      role: response.role,
      agencyName: response.agencyName,
      whatsappNumber: response.whatsappNumber,
    };

    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setToken(response.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const me = await authAPI.getCurrentUser();
      setUser(prev => {
        const merged = { ...(prev || {}), ...me };
        localStorage.setItem('user', JSON.stringify(merged));
        return merged as User;
      });
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


