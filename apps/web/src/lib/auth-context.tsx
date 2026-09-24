'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole } from '@apna-school/shared-types';
import { dictionaries, LocaleKey } from './i18n/dictionary';
import { fetchApi } from './api-client';

export interface UserState {
  userId: string;
  tenantId: string;
  tenantCode: string;
  name?: string;
  nameEn?: string;
  nameGu?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  permissions: string[];
  schoolNameEn: string;
  schoolNameGu: string;
  schoolLogo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  currentAcademicYearId?: string;
  currentFinancialYearId?: string;
}

export interface RegisterPayload {
  name: string;
  mobile: string;
  email?: string;
  password: string;
  schoolNameGu: string;
  schoolNameEn?: string;
  district?: string;
  taluka?: string;
  diseCode?: string;
  otp: string;
}

interface AuthContextType {
  user: UserState | null;
  locale: LocaleKey;
  t: typeof dictionaries.gu;
  isLoading: boolean;
  setLocale: (l: LocaleKey) => void;
  setUser: (u: UserState | null) => void;
  login: (identifier: string, password: string, tenantCode?: string) => Promise<any>;
  sendOtp: (identifier: string, purpose?: 'REGISTRATION' | 'LOGIN' | 'FORGOT_PASSWORD', metadata?: any) => Promise<any>;
  verifyOtp: (identifier: string, otp: string, purpose?: string) => Promise<any>;
  register: (payload: RegisterPayload) => Promise<any>;
  resetPassword: (identifier: string, otp: string, newPassword: string) => Promise<any>;
  logout: () => void;
}

const defaultUser: UserState = {
  userId: 'demo-user-id',
  tenantId: 'demo-tenant-id',
  tenantCode: 'SSVM',
  email: 'admin@ssvm.edu.in',
  role: UserRole.SCHOOL_ADMIN,
  permissions: [],
  schoolNameEn: 'Shree Saraswati Vidya Mandir',
  schoolNameGu: 'શ્રી સરસ્વતી વિદ્યા મંદિર',
  primaryColor: '#007ed4',
  secondaryColor: '#EEAA00',
  currentAcademicYearId: 'ay-2026-27',
  currentFinancialYearId: 'fy-2026-27',
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  locale: 'gu',
  t: dictionaries.gu,
  isLoading: false,
  setLocale: () => {},
  setUser: () => {},
  login: async () => {},
  sendOtp: async () => {},
  verifyOtp: async () => {},
  register: async () => {},
  resetPassword: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState | null>(defaultUser);
  const [locale, setLocaleState] = useState<LocaleKey>('gu');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage and validate session
  useEffect(() => {
    const savedLocale = localStorage.getItem('apna_locale') as LocaleKey;
    if (savedLocale && (savedLocale === 'gu' || savedLocale === 'en')) {
      setLocaleState(savedLocale);
    }

    const token = localStorage.getItem('apna_token');
    const savedUser = localStorage.getItem('apna_user');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }

    if (token) {
      // Validate session with backend API
      fetchApi('/auth/me')
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('apna_user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          // Keep existing cached user if network temporarily unavailable
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const setLocale = (l: LocaleKey) => {
    setLocaleState(l);
    localStorage.setItem('apna_locale', l);
    if (user && user.userId) {
      fetchApi('/auth/locale', {
        method: 'PATCH',
        body: JSON.stringify({ locale: l }),
      }).catch(() => {});
    }
  };

  const login = async (identifier: string, password: string, tenantCode?: string) => {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, tenantCode }),
    });

    if (res.success && res.data?.token) {
      localStorage.setItem('apna_token', res.data.token);
      localStorage.setItem('apna_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.message || 'લૉગીન કરવામાં ક્ષતિ આવી.');
  };

  const sendOtp = async (identifier: string, purpose: 'REGISTRATION' | 'LOGIN' | 'FORGOT_PASSWORD' = 'REGISTRATION', metadata?: any) => {
    const res = await fetchApi('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, purpose, metadata }),
    });
    return res.data;
  };

  const verifyOtp = async (identifier: string, otp: string, purpose = 'REGISTRATION') => {
    const res = await fetchApi('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp, purpose }),
    });
    return res.data;
  };

  const register = async (payload: RegisterPayload) => {
    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data?.token) {
      localStorage.setItem('apna_token', res.data.token);
      localStorage.setItem('apna_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.message || 'રજીસ્ટ્રેશનમાં ક્ષતિ આવી.');
  };

  const resetPassword = async (identifier: string, otp: string, newPassword: string) => {
    const res = await fetchApi('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp, newPassword }),
    });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('apna_token');
    localStorage.removeItem('apna_user');
    setUser(null);
    window.location.href = '/login';
  };

  const t = dictionaries[locale] || dictionaries.gu;

  return (
    <AuthContext.Provider
      value={{
        user,
        locale,
        t,
        isLoading,
        setLocale,
        setUser,
        login,
        sendOtp,
        verifyOtp,
        register,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

