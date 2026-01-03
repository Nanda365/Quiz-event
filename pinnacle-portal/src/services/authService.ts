import api from '../lib/api';
import { User } from '../types';

export const register = async (userData: Omit<User, 'id'>) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const login = async (credentials: Omit<User, 'id' | 'name'>) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const logout = async () => { // Make it async
  try {
    await api.post('/auth/logout'); // Call the backend logout endpoint
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    // No client-side redirection here. The calling component (useAuth hook) will handle navigation.
  }
};

export const forgotPassword = async (email: string, name: string, newPassword: string) => {
  try {
    const response = await api.post('/auth/forgot-password', { email, name, newPassword });
    return { success: true, ...response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'An unexpected error occurred' };
  }
};
