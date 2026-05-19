import api from "../axiosInstance.jsx";

export const getUsers = (params) => api.get("/users", { params });
export const createUser = (data) => api.post("/users", data);
export const getMe = () => api.get("/users/me");
export const updateMe = (data) => api.put("/users/me", data);
export const changePassword = (data) => api.put("/users/me/password", data);
export const getUserById = (id) => api.get(`/users/${id}`);
export const updateUserById = (id, data) => api.put(`/users/${id}`, data);
export const importUsers = (data) => api.post("/users/import", data);
