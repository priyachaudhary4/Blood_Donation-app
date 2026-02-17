import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

// Request interceptor
API.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh if:
    // 1. Status is 401
    // 2. This isn't already a retry
    // 3. This isn't a refresh request itself
    // 4. This isn't a login request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        await API.post('/auth/refresh');
        // Retry original request
        return API(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login (once)
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
