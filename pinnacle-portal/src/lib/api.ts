import axios from 'axios';

const api = axios.create({
  baseURL: 'https://quiz-event-backend.onrender.com/api',
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('pinnacle_user');
    if (stored) {
      try {
        const { token } = JSON.parse(stored);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage or set auth header', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Only redirect if not on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
