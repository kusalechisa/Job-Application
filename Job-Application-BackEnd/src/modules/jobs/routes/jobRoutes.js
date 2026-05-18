import express from "express";
import { verifyToken, optionalVerifyToken } from "#src/middleware/auth.js";
import { createJob, getJobs, getJobById, updateJob, deleteJob } from "../controller/jobController.js";

const router = express.Router();

// Public job routes (optional auth for role-based visibility)
router.get("/", optionalVerifyToken, getJobs);
router.get("/:jobId", optionalVerifyToken, getJobById);

// Protected job routes
router.use(verifyToken);
router.post("/", createJob); // Admin
router.put("/:jobId", updateJob); // Admin
router.delete("/:jobId", deleteJob); // Admin

export default router;