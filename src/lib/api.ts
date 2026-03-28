import { CONFIG } from "../../config/config";
import axios from "axios";

const api = axios.create({
  baseURL: CONFIG.API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    "Content-Type": undefined,
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("Request timed out");
    }

    // Handle 401 Unauthorized errors
    // Note: 401 errors during auth checks (like /profile) are expected when not logged in
    // The UserContext will handle these silently
    // Only log 401 for non-auth-check endpoints if needed
    if (error.response?.status === 401 && !error.config?.url?.includes("/profile")) {
      // Log 401 for other endpoints (not profile/auth checks)
      console.warn("Unauthorized request - authentication may be expired");
    }

    return Promise.reject(error);
  }
);

const sanctum = axios.create({
  baseURL: CONFIG.SANCTUM_API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    "Content-Type": undefined,
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
});

export { api, sanctum };
