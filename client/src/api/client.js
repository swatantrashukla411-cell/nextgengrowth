import axios from 'axios';

const API = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ngg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 Unauthorized globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user details to logout
      localStorage.removeItem('ngg_token');
      localStorage.removeItem('ngg_user');
      
      // Prevent infinite redirect loops if we are already on login page
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?error=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
