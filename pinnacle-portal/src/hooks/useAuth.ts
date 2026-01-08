import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, AuthState } from "@/types";
import * as authService from '../services/authService'; // Import authService

const STORAGE_KEY = "pinnacle_user";

export const useAuth = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored);
        if (user && token) {
          return { user, isAuthenticated: true, isLoading: false, token, isAuthResolved: true };
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    return { user: null, isAuthenticated: false, isLoading: true, token: null, isAuthResolved: false };
  });

  useEffect(() => {
    // This effect runs once after the initial render to signal that the initial auth state determination is complete.
    // It transitions from the initial loading state to a resolved state.
    setAuthState(prev => ({ ...prev, isLoading: false, isAuthResolved: true }));
  }, []);

  // Effect to set isLoading to false and isAuthResolved to true after initial check




  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { token, user: loggedInUser } = await authService.login({ email, password });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: loggedInUser }));
      setAuthState({ user: loggedInUser, isAuthenticated: true, isLoading: false, token, isAuthResolved: true });
      return { success: true };
    } catch (err: any) {
      setAuthState(prev => ({ ...prev, isLoading: false, isAuthResolved: true }));
      return { success: false, error: err.message || "Login failed" };
    }
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    college: string,
    state: string,
    mobile: string,
    password: string,
    interestedCategories: string[]
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { token, user: registeredUser } = await authService.register({ name, email, college, state, mobile, password, interestedCategories });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: registeredUser }));
      setAuthState({ user: registeredUser, isAuthenticated: true, isLoading: false, token, isAuthResolved: true });
      return { success: true };
    } catch (err: any) {
      setAuthState(prev => ({ ...prev, isLoading: false, isAuthResolved: true })); // Ensure isLoading is reset on error
      return { success: false, error: err.response?.data?.message || err.message || err.error || "Registration failed" };
    }
  }, []);

  const logout = useCallback(async () => { // Make it async
    try {
      await authService.logout(); // Call the backend logout endpoint
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      setAuthState({ user: null, isAuthenticated: false, isLoading: false, token: null, isAuthResolved: true });
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return { ...authState, login, register, logout, token: authState.token };
};
