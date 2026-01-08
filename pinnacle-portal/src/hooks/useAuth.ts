import { useState, useCallback, useEffect } from "react";
import { User, AuthState } from "@/types";
import * as authService from '../services/authService'; // Import authService

const STORAGE_KEY = "pinnacle_user";

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored);
        if (user && token) {
          return { user, isAuthenticated: true, isLoading: false, token }; // Set isLoading to false here
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    return { user: null, isAuthenticated: false, isLoading: true, token: null }; // Default isLoading to true
  });



  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { token, user: loggedInUser } = await authService.login({ email, password });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: loggedInUser }));
      setAuthState({ user: loggedInUser, isAuthenticated: true, isLoading: false, token });
      return { success: true };
    } catch (err: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
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
      setAuthState({ user: registeredUser, isAuthenticated: true, isLoading: false, token });
      return { success: true };
    } catch (err: any) {
      setAuthState(prev => ({ ...prev, isLoading: false })); // Ensure isLoading is reset on error
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
      setAuthState({ user: null, isAuthenticated: false, isLoading: false, token: null });
    }
  }, []);

  return { ...authState, login, register, logout, token: authState.token };
};
