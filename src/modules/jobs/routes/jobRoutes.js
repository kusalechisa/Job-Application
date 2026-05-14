import express from "express";
import { verifyToken } from "#/middleware/auth.js";
import { createJob, getJobs } from "../controller/jobController.js";

const router = express.Router();

// Public job routes
router.get("/", getJobs);

// Protected job routes
router.use(verifyToken);
router.post("/", createJob); // Admin

export default router;