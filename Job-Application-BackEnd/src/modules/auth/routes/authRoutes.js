import express from "express";
import { login, refreshToken, logout, forgotPassword, resetPassword } from "#src/modules/auth/controller/authController.js";
import { verifyToken } from "#src/middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User Authentication management APIs
 */
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.use(verifyToken);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
