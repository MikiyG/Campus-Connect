// src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',   // ← match your backend port + /api prefix
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',  // better for production
  timeout: 10000,                         // optional: fail after 10s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add request interceptor (very useful later for JWT)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or use context / cookie
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor (handle 401, show toast, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // logout user, redirect to login, etc.
      console.warn('Unauthorized – token expired?');
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;