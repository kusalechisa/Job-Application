import express from "express";
import { getUsers, register, getMe, updateMe, changePassword, createUser, getUserById, updateUserById } from "#src/modules/accounts/controller/userController.js";
import { verifyToken } from "#src/middleware/auth.js";

const router = express.Router();

/**
 * @openapi
 * /api/users/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register new account
 *     description: Create a new applicant or admin account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/register", register);

// Protected routes
router.use(verifyToken);
router.get("/", getUsers); // Admin
router.post("/", createUser); // Admin
router.get("/me", getMe);
router.put("/me", updateMe);
router.put("/me/password", changePassword);
router.get("/:id", getUserById); // Admin
router.put("/:id", updateUserById); // Admin

export default router;