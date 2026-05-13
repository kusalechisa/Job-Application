import express from "express";
import { login } from "#/modules/auth/controller/authController.js";
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User Authentication management APIs
 */
router.post("/login", login);
export default router;
