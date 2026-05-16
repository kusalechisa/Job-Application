import api from "../axiosInstance.jsx";

export const getAllApplications = () => api.get("/jobs/applications");
export const getApplicationsForJob = (jobId, params) =>
  api.get(`/jobs/${jobId}/applications`, { params });
export const getApplicationDetails = (applicationId) =>
  api.get(`/jobs/applications/${applicationId}`);
export const updateApplicationStatus = (applicationId, status) =>
  api.put(`/jobs/applications/${applicationId}/status`, { status });
export const withdrawApplication = (applicationId) =>
  api.put(`/jobs/applications/${applicationId}/withdraw`);
export const updateApplication = (applicationId, data) =>
  api.put(`/jobs/applications/${applicationId}`, data);
export const downloadApplicantsExcel = (jobId) =>
  api.get(`/jobs/${jobId}/applications/download`, { responseType: "blob" });
export const getAdvancedAnalytics = () => api.get("/jobs/analytics");
export const getDashboardData = () => api.get("/jobs/dashboard");
