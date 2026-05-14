import express from "express";
import { verifyToken } from "#/middleware/auth.js";
import {
  createJob,
  getJobs,
  applyForJob,
  getApplicationsForJob,
  getApplicationDetails,
  updateApplicationStatus,
  getMyApplications,
  downloadApplicantsExcel,
} from "../controller/jobController.js";

const router = express.Router();

// Public routes
router.get("/", getJobs);

// Protected routes
router.use(verifyToken);

// Job management
router.post("/", createJob); // Admin
router.post("/apply", applyForJob); // Applicant

// Applications
router.get("/applications/my", getMyApplications); // Applicant
router.get("/:jobId/applications", getApplicationsForJob); // Admin
router.get("/applications/:applicationId", getApplicationDetails); // Admin
router.put("/applications/:applicationId/status", updateApplicationStatus); // Admin
router.get("/:jobId/applications/download", downloadApplicantsExcel); // Admin

export default router;