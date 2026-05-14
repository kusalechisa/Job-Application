import express from "express";
import { verifyToken } from "#/middleware/auth.js";
import {
  getApplicationsForJob,
  getApplicationDetails,
  updateApplicationStatus,
  downloadApplicantsExcel,
} from "../controller/applicationController.js";

const router = express.Router();
router.use(verifyToken);

router.get("/:jobId/applications", getApplicationsForJob);
router.get("/applications/:applicationId", getApplicationDetails);
router.put("/applications/:applicationId/status", updateApplicationStatus);
router.get("/:jobId/applications/download", downloadApplicantsExcel);

export default router;
