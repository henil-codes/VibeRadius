import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL

// Create axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies in requests
})

// Add response interceptor for handling 401 errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/auth/login' // Redirect to login page
        }
        return Promise.reject(error)
    }
)

export const authService = {
    login: async (Credentials) => {
        return await apiClient.post('/auth/login', Credentials);
    },

    register: async (userData) => {
        return await apiClient.post('/auth/register', userData);
    },

    logout: async () => {
        return await apiClient.post('/auth/logout');
    },

    verifyToken: async () => {
        return await apiClient.get('/auth/verify-token');
    },

    getCurrentUser: async (userId) => {
        return await apiClient.get('/auth/me');
    },

    forgotPassword: async (email) => {
        return await apiClient.post('/auth/forgot-password', {email});
    },

    resetPassword: async (token, password) => {
        return await apiClient.post(`/auth/reset-password/`, {token, password})
    }
}

export default apiClient;