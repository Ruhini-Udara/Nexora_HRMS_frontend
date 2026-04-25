import axios from 'axios';

/**
 * Centralized Axios instance for API requests.
 * Includes base URL and default headers.
 */
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        // We import useAuthStore dynamically to avoid circular dependencies
        // or issues during SSR if not handled carefully
        const token = typeof window !== 'undefined' 
            ? JSON.parse(localStorage.getItem('nexora-auth-storage') || '{}')?.state?.token 
            : null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // You can centralize logging or global error alerts here
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        console.error('API Error:', message);
        return Promise.reject(error);
    }
);

export default api;
