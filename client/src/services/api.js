import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:4000/api' : '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Allow FormData requests to set their own Content-Type (multipart with boundary)
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export default api;
