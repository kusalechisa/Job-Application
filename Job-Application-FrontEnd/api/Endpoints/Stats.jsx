import api from "../axiosInstance.jsx";

export const getJobStats = () => api.get("/stats/jobs");
export const getApplicationStats = () => api.get("/stats/applications");
