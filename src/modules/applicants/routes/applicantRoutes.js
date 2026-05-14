import express from "express";
import { verifyToken } from "#/middleware/auth.js";
import {
  applyForJob,
  getMyApplications,
} from "../controller/applicantController.js";

const router = express.Router();
router.use(verifyToken);

router.post("/apply", applyForJob);
router.get("/applications/my", getMyApplications);

export default router;
