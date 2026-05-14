import express from "express";
import { verifyToken } from "#/middleware/auth.js";
import { getJobStats, getApplicationStats } from "../controller/statsController.js";

const router = express.Router();
router.use(verifyToken);

router.get("/jobs", getJobStats);
router.get("/applications", getApplicationStats);

export default router;