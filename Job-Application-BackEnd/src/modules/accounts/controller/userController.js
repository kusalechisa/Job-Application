import bcrypt from "bcrypt";
import { prisma } from "#src/prisma.js";

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

    // Note: Applicant profile will be created separately when user fills out their profile

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
 * FETCH USERS ACCOUNT (Admin) — optional applicant filters: cgpaMin/Max, exitExamMin/Max
 */
export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can list users",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const q = req.query;
    const toFloat = (v) => {
      if (v === undefined || v === null || v === "") return null;
      const n = Number.parseFloat(String(v));
      return Number.isNaN(n) ? null : n;
    };

    const cgpaMin = toFloat(q.cgpaMin);
    const cgpaMax = toFloat(q.cgpaMax);
    const exitExamMin = toFloat(q.exitExamMin);
    const exitExamMax = toFloat(q.exitExamMax);

    const applicantWhere = {};
    if (cgpaMin != null || cgpaMax != null) {
      applicantWhere.cgpa = {};
      if (cgpaMin != null) applicantWhere.cgpa.gte = cgpaMin;
      if (cgpaMax != null) applicantWhere.cgpa.lte = cgpaMax;
    }
    if (exitExamMin != null || exitExamMax != null) {
      applicantWhere.exitExamScore = {};
      if (exitExamMin != null) applicantWhere.exitExamScore.gte = exitExamMin;
      if (exitExamMax != null) applicantWhere.exitExamScore.lte = exitExamMax;
    }

    const where =
      Object.keys(applicantWhere).length > 0
        ? { applicant: { is: applicantWhere } }
        : {};

    const users = await prisma.account.findMany({
      where,
      include: {
        applicant: {
          select: {
            cgpa: true,
            exitExamScore: true,
            _count: { select: { applications: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const safeUsers = users.map(({ password, ...u }) => u);

    return res.status(200).json({
      status: "success",
      message: "Users fetched successfully",
      code: 200,
      data: safeUsers,
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

/**
 * GET CURRENT USER PROFILE
 */
export const getMe = async (req, res) => {
  try {
    const user = await prisma.account.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        code: 404,
        errors: ["User not found"],
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User profile fetched successfully",
      code: 200,
      data: user,
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * UPDATE CURRENT USER PROFILE
 */
export const updateMe = async (req, res) => {
  try {
    const { name, email } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await prisma.account.findFirst({
        where: { email, id: { not: req.user.id } },
      });
      if (existingUser) {
        return res.status(409).json({
          status: "error",
          message: "Email already exists",
          code: 409,
          errors: ["Email already exists"],
        });
      }
      updateData.email = email;
    }

    const user = await prisma.account.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      code: 200,
      data: user,
    });
  } catch (error) {
    console.error("UPDATE ME ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * CHANGE PASSWORD
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Current password and new password are required",
        code: 400,
        errors: ["Missing required fields"],
      });
    }

    const user = await prisma.account.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        code: 404,
        errors: ["User not found"],
      });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({
        status: "error",
        message: "Current password is incorrect",
        code: 401,
        errors: ["Invalid current password"],
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.account.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      status: "success",
      message: "Password changed successfully",
      code: 200,
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * CREATE USER (Admin only)
 */
export const createUser = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can create users",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Name, email, and password are required",
        code: 400,
        errors: ["Missing required fields"],
      });
    }

    const existingUser = await prisma.account.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "Email already exists",
        code: 409,
        errors: ["Email already exists"],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.account.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "Applicant",
      },
    });

    // Note: Applicant profile will be created separately when user fills out their profile

    const { password: _, ...safeUser } = user;
    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      code: 201,
      data: safeUser,
    });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * GET USER BY ID (Admin only)
 */
export const getUserById = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can view user details",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const { id } = req.params;
    const user = await prisma.account.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        code: 404,
        errors: ["User not found"],
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User fetched successfully",
      code: 200,
      data: user,
    });
  } catch (error) {
    console.error("GET USER BY ID ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * UPDATE USER BY ID (Admin only)
 */
export const updateUserById = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can update users",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const { id } = req.params;
    const { name, email, role } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) {
      const existingUser = await prisma.account.findFirst({
        where: { email, id: { not: id } },
      });
      if (existingUser) {
        return res.status(409).json({
          status: "error",
          message: "Email already exists",
          code: 409,
          errors: ["Email already exists"],
        });
      }
      updateData.email = email;
    }
    if (role) updateData.role = role;

    const user = await prisma.account.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      code: 200,
      data: user,
    });
  } catch (error) {
    console.error("UPDATE USER BY ID ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};