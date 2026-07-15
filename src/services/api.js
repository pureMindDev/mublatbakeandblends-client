import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/* ── Request interceptor — attach JWT token to every request ── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("mublat_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response interceptor — handle 401 globally ── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      /* Token expired or invalid — clear storage and redirect to admin login */
      localStorage.removeItem("mublat_token");
      localStorage.removeItem("mublat_admin");
      localStorage.removeItem("mublat_admin_auth");
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin";
      }
    }
    return Promise.reject(error);
  }
);

export default api;