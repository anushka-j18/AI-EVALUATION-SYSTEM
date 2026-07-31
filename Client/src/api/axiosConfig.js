import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5001";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    // If a header was explicitly provided in the API call, respect it
    if (config.headers && config.headers.Authorization) {
      return config;
    }

    // Check if URL contains /admin/ (handles baseURL resolution)
    if (config.url && config.url.includes("/admin/")) {
      const adminToken = localStorage.getItem("adminToken");
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        return config;
      }
    }

    // Default to standard token for teacher/other routes
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // We shouldn't globally redirect on 401 because background auth checks 
    // (/auth/me or /admin/auth/me) fail intentionally for the other role.
    // The Contexts will handle setting the user state to null safely.
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL, SERVER_URL };
