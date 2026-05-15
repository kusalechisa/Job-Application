import api from "../axiosInstance.jsx";

export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/users/register", data);
export const logout = () => api.post("/auth/logout");