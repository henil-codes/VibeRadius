import axios from "axios";
import useAuthStore from "../store/authStore.js";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const shouldNotCheckAuth = (url) => {
  const noAuthPaths = ["/auth/login", "/auth/register", "/api/auth/refresh-token"];
  return noAuthPaths.some((path) => url.includes(path));
}

// Response interceptor - runs after every response
apiClient.interceptors.response.use(
  (response) => {
    // 200 OK
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.warn("Unauthorized request, token expired or missing.");

      const originalRequest = error.config;

      // Prevent infinite loops by checking if this is a retry
      if (!originalRequest._retried && !shouldNotCheckAuth(originalRequest.url)) {
        originalRequest._retried = true;
        console.log("Attempting to refresh token...", originalRequest.url);

        try {
          const result = await useAuthStore.getState().refreshToken();

          if (result.success) {
            // Retry the original request with refreshed token
            return apiClient(originalRequest);
          }
        } catch (e) {
          console.error("Error during token refresh:", e);
          // Redirect to login on token refresh failure
          window.location.href = "/auth/login";
        }
      }

      // Redirect to login if token refresh failed
      window.location.href = "/auth/login";
    }

    if (error.response?.status === 500) {
      console.error("Server error:", error.response.data);
    }

    // This allows your local try/catch to see the error too.
    return Promise.reject(error);
  }
)

export default apiClient;