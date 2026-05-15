import axios from "axios";
import { baseUrl } from "./baseUrl.jsx";

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthToken(null);
      if (!window.location.pathname.match(/^\/(login|register|forgot-password|reset-password)?$/)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
