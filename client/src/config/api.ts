import axios from 'axios';

// Configuration for API endpoints
export const config = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL,
  API_ENDPOINTS: {
    AUTH: {
      GOOGLE: "/auth/google",
      LOGOUT: "/auth/logout",
    },
    USER: {
      PROFILE: "/user/profile",
    },
    PROBLEMS: {
      BASE: "/problems",
      USER_PROBLEMS: "/user-problems",
    },
  },
} as const;

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  withCredentials: true, // Include cookies for session-based auth
});

// Add request interceptor to include token in Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might be expired, clear it
      localStorage.removeItem('authToken');
      // Optionally redirect to login
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default config;
