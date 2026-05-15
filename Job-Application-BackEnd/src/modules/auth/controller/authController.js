import bcrypt from "bcrypt";
import { prisma } from "#src/prisma.js";
import { generateToken } from "#src/utils/jwt.js";

export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("req body",req.body)
    const user = await prisma.account.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    const token = generateToken(user);
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
};

/**
 * REFRESH TOKEN
 */
export const refreshToken = async (req, res) => {
  try {
    // Since we're using stateless JWT, if the token is valid (middleware passed), issue a new one
    const user = await prisma.account.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        code: 404,
        errors: ["User not found"],
      });
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      status: "success",
      message: "Token refreshed successfully",
      code: 200,
      data: { token, user: safeUser },
    });
  } catch (error) {
    console.error("REFRESH TOKEN ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * LOGOUT
 */
export const logout = async (req, res) => {
  try {
    // For stateless JWT, logout is just a success response
    // In a production app with token blacklisting, you'd add the token to a blacklist here
    return res.status(200).json({
      status: "success",
      message: "Logged out successfully",
      code: 200,
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * FORGOT PASSWORD
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
        code: 400,
        errors: ["Missing email"],
      });
    }

    const user = await prisma.account.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        status: "success",
        message: "If the email exists, a reset link has been sent",
        code: 200,
      });
    }

    // In a real app, you'd generate a reset token and send an email
    // For now, just return success
    return res.status(200).json({
      status: "success",
      message: "If the email exists, a reset link has been sent",
      code: 200,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * RESET PASSWORD
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Token and new password are required",
        code: 400,
        errors: ["Missing required fields"],
      });
    }

    // In a real app, you'd verify the reset token
    // For now, just return success
    return res.status(200).json({
      status: "success",
      message: "Password reset successfully",
      code: 200,
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};
