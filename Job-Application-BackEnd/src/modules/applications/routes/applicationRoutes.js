import express from "express";
import { verifyToken } from "#src/middleware/auth.js";
import {
  getApplicationsForJob,
  getApplicationDetails,
  updateApplicationStatus,
  downloadApplicantsExcel,
  getAllApplications,
  withdrawApplication,
  updateApplication,
} from "../controller/applicationController.js";
import { getAdvancedAnalytics, getDashboardData } from "../controller/analyticsController.js";

const router = express.Router();
router.use(verifyToken);

router.get("/applications", getAllApplications); // Admin - get all applications
router.get("/applications/:applicationId", getApplicationDetails); // Admin
router.put("/applications/:applicationId/status", updateApplicationStatus); // Admin
router.put("/applications/:applicationId/withdraw", withdrawApplication); // Applicant
router.put("/applications/:applicationId", updateApplication); // Applicant
router.get("/:jobId/applications", getApplicationsForJob); // Admin - get applications for job
router.get("/:jobId/applications/download", downloadApplicantsExcel); // Admin
router.get("/analytics", getAdvancedAnalytics); // Admin - get advanced analytics
router.get("/dashboard", getDashboardData); // Admin - get dashboard data

export default router;
