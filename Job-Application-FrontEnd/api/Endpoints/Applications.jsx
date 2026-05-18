import api from "../axiosInstance.jsx";
import { normalizeApplicationStatus } from "../../src/lib/applicationStatus.js";

export const getAllApplications = () => api.get("/jobs/applications");
export const getApplicationsForJob = (jobId, params) =>
  api.get(`/jobs/${jobId}/applications`, { params });
export const getApplicationDetails = (applicationId) =>
  api.get(`/jobs/applications/${applicationId}`);
export const updateApplicationStatus = (applicationId, statusInput) => {
  const status = normalizeApplicationStatus(statusInput);
  if (!status) {
    return Promise.reject(
      new Error("Invalid application status value."),
    );
  }
  return api.put(`/jobs/applications/${applicationId}/status`, { status });
};
export const withdrawApplication = (applicationId) =>
  api.put(`/jobs/applications/${applicationId}/withdraw`);
export const updateApplication = (applicationId, data) =>
  api.put(`/jobs/applications/${applicationId}`, data);
export const downloadApplicantsExcel = (jobId) =>
  api.get(`/jobs/${jobId}/applications/download`, { responseType: "blob" });
export const getAdvancedAnalytics = () => api.get("/jobs/analytics");
export const getDashboardData = () => api.get("/jobs/dashboard");
