import api from "../axiosInstance.jsx";

export const getJobs = (params) => api.get("/jobs", { params });
export const applyForJob = (jobId) => api.post("/jobs/apply", { jobId });
export const getMyApplications = () => api.get("/jobs/applications/my");
export const createApplicantProfile = (formData) => api.post("/jobs/profile", formData);
export const getApplicantProfile = () => api.get("/jobs/profile");
