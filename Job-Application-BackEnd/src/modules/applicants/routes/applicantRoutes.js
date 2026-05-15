import express from "express";
import { verifyToken } from "#/middleware/auth.js";
import {
  applyForJob,
  getMyApplications,
  createApplicantProfile,
  getApplicantProfile,
  updateApplicantProfile,
} from "../controller/applicantController.js";

const router = express.Router();
router.use(verifyToken);

router.post("/profile", createApplicantProfile); // Create applicant profile
router.get("/profile", getApplicantProfile); // Get applicant profile
router.put("/profile", updateApplicantProfile); // Update applicant profile

router.post("/apply", applyForJob);
router.get("/applications/my", getMyApplications);

export default router;
