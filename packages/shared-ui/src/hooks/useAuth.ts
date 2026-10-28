import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../utils/api';
import type { User } from '../types';

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout, setUser } = useAuthStore();

  useEffect(() => {
    // Verify token and fetch user data on mount
    const verifyAuth = async () => {
      if (token && !user) {
        try {
          const response = await apiClient.get<{ user: User }>('/auth/profile');
          setUser(response.data.user);
        } catch (error) {
          logout();
        }
      }
    };

    verifyAuth();
  }, [token, user, setUser, logout]);

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  };
};
