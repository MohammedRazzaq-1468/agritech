import axios from 'axios';
import { supabase } from './supabase.js';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const baseURL = rawBaseUrl.endsWith('/api/v1') 
  ? rawBaseUrl 
  : (rawBaseUrl.endsWith('/api') ? `${rawBaseUrl}/v1` : `${rawBaseUrl.replace(/\/+$/, '')}/api/v1`);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Supabase JWT token
api.interceptors.request.use(async (config) => {
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        return config;
      }
    } catch (err) {
      console.warn('Failed to retrieve Supabase session for API request', err);
    }
  }

  // Fallback dev token stored in localStorage for offline/sandbox testing
  const devToken = localStorage.getItem('agrismart_dev_token');
  if (devToken) {
    config.headers.Authorization = `Bearer ${devToken}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorResponse = error.response?.data || {
      success: false,
      message: error.message || 'Network error occurred',
      error: { code: 'NETWORK_ERROR', details: [error.message] }
    };
    return Promise.reject(errorResponse);
  }
);

export default api;

