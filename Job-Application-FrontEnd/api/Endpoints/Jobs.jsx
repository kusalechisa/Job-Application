// api/Endpoints/Jobs.jsx
import api from "../axiosInstance.jsx";

export const getJobs = (params) => api.get("/jobs", { params });
export const getJobById = (jobId) => api.get(`/jobs/${jobId}`);
export const createJob = (data) => api.post("/jobs", data);
export const updateJob = (jobId, data) => api.put(`/jobs/${jobId}`, data);
export const deleteJob = (jobId) => api.delete(`/jobs/${jobId}`);

export const createApplicantProfile = (formData) => {
  console.log("Creating applicant profile");
  return api.post("/jobs/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getApplicantProfile = () => {
  console.log("Fetching applicant profile");
  return api.get("/jobs/profile");
};

export const updateApplicantProfile = (formData) => {
  console.log("Updating applicant profile");
  return api.put("/jobs/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const applyForJob = (jobId) => api.post("/jobs/apply", { jobId });
export const getMyApplications = () => api.get("/jobs/applications/my");
