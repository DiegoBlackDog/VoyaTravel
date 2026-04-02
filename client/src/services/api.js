import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:4000/api' : '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Allow FormData requests to set their own Content-Type (multipart with boundary)
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // axios 1.x uses AxiosHeaders — must use .delete() not delete operator
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
    } else {
      delete config.headers['Content-Type'];
    }
  }
  return config;
});

export default api;
