import bcrypt from "bcrypt";
import { prisma } from "#/prisma.js";

/**
 * REGISTER USER
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Name, email, and password are required",
        code: 400,
        errors: ["Missing required fields"],
      });
    }

    // =========================
    // CHECK DUPLICATE EMAIL
    // =========================
    const existingUser = await prisma.account.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "Email already exists",
        code: 409,
        errors: ["Email already exists"],
      });
    }

    // =========================
    // HASH PASSWORD
    // =========================
    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================
    // CREATE USER
    // =========================
    const user = await prisma.account.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "Applicant",
      },
    });

    // =========================
    // REMOVE SENSITIVE DATA
    // =========================
    const { password: _, ...safeUser } = user;
    // =========================
    // RESPONSE
    // =========================
    return res.status(201).json({
      status: "success",
      message: "Account Created successfully",
      code: 201,
      data: safeUser,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * FETCH USERS ACCOUNT
 */
export const getUsers = async (req, res) => {
  console.log("lll")
  try {
    const users = await prisma.account.findMany();

    if (!users.length) {
      return res.status(404).json({
        status: "error",
        message: "No users found",
        code: 404,
        data: [],
        errors: ["Empty user list"],
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Users fetched successfully",
      code: 200,
      data: users,
    });

  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch users",
      code: 500,
      errors: [error.message],
    });
  }
};