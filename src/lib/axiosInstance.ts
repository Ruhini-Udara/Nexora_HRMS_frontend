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
        const storage = typeof window !== 'undefined' ? localStorage.getItem('nexora-auth-storage') : null;
        let token = null;
        if (storage) {
            try {
                const parsed = JSON.parse(storage);
                token = parsed.state?.token;
            } catch (e) {
                console.error("Error parsing auth storage", e);
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`[AXIOS REQUEST] ${config.method?.toUpperCase()} ${config.url} | Token: ${token.substring(0, 10)}...`);
        } else {
            console.warn(`[AXIOS REQUEST] ${config.method?.toUpperCase()} ${config.url} | NO TOKEN FOUND`);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            console.warn(`[AXIOS 403 ERROR] URL: ${error.config?.url}`, {
                data: error.response?.data,
                headers: error.config?.headers
            });
        }
        if (error.response?.status >= 500) {
            console.error(`[AXIOS ${error.response?.status} ERROR] URL: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                data: error.response?.data,
                message: error.message
            });
        }
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        console.warn('API Warning:', message);
        return Promise.reject(error);
    }
);

export default api;
