import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('devboard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginAttempt = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLoginAttempt) {
      localStorage.removeItem('devboard_token');
      if (window.location.pathname !== '/login') {
        sessionStorage.setItem('devboard_return_to', window.location.pathname);
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
