import api from "../axiosInstance.jsx";

export const login = (data) => api.post("/auth/login", data);
export const logout = () => api.post("/auth/logout");
export const refreshToken = () => api.post("/auth/refresh");
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);
export const resetPassword = (data) => api.post("/auth/reset-password", data);
export const register = (data) => api.post("/users/register", data);
