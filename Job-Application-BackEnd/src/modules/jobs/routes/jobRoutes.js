import express from "express";
import { verifyToken } from "#src/middleware/auth.js";
import { createJob, getJobs, getJobById, updateJob, deleteJob } from "../controller/jobController.js";

const router = express.Router();

// Public job routes
router.get("/", getJobs);
router.get("/:jobId", getJobById);

// Protected job routes
router.use(verifyToken);
router.post("/", createJob); // Admin
router.put("/:jobId", updateJob); // Admin
router.delete("/:jobId", deleteJob); // Admin

export default router;