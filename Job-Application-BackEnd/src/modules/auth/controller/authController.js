import bcrypt from "bcrypt";
import { prisma } from "#src/prisma.js";
import { generateToken } from "#src/utils/jwt.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Configure Gmail transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // false for 587, true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('✗ Gmail configuration error:', error.message);
    console.error('Please check your EMAIL_USER and EMAIL_PASS in .env');
  } else {
    console.log('✓ Gmail is ready to send emails');
  }
});

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
 * FORGOT PASSWORD - Generate reset token and send email via Gmail
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

    console.log('📧 Processing forgot password for:', email);

    // Find user by email
    const user = await prisma.account.findUnique({ 
      where: { email },
      include: { applicant: true }
    });
    
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Hash the token for storage
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      
      // Store token in database with expiry (1 hour)
      await prisma.account.update({
        where: { email },
        data: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
        }
      });
      
      // Create reset URL
      const frontendUrl = process.env.FRONTEND_URL || 'https://job-application-a-mesob.vercel.app';
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
      
      // Get user's name
      const userName = user.applicant?.firstName || user.name || 'User';
      
      // Log reset link for development
      console.log('\n🔐 =========================================');
      console.log('PASSWORD RESET LINK:');
      console.log(resetUrl);
      console.log('=========================================\n');
      
      // Professional email HTML template
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .header {
              text-align: center;
              padding: 30px 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px 10px 0 0;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
            }
            .content {
              background-color: white;
              padding: 40px 30px;
              border-radius: 0 0 10px 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .button {
              display: inline-block;
              padding: 14px 35px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important;
              text-decoration: none;
              border-radius: 50px;
              margin: 25px 0;
              font-weight: bold;
              text-align: center;
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-2px);
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
              margin-top: 20px;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              font-size: 14px;
            }
            .link {
              word-break: break-all;
              background-color: #f3f4f6;
              padding: 10px;
              border-radius: 5px;
              font-family: monospace;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>We received a request to reset your password for your Job Portal account associated with <strong>${email}</strong>.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Your Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <div class="link">
                ${resetUrl}
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Note:</strong> This link will expire in <strong>1 hour</strong> for your security. If you didn't request this password reset, please ignore this email.
              </div>
              
              <p>For security reasons, never share this link with anyone. Our team will never ask for your password.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <p style="font-size: 14px; color: #666;">
                Need help? Contact our support team at support@jobportal.com
              </p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
              <p>123 Business Street, Suite 100, City, State 12345</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Plain text version for email clients that don't support HTML
      const emailText = `
        PASSWORD RESET REQUEST
        
        Hello ${userName},
        
        We received a request to reset your password for your Job Portal account associated with ${email}.
        
        Click this link to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email. Your password will remain unchanged.
        
        For security reasons, never share this link with anyone.
        
        ---
        This is an automated message, please do not reply.
        © ${new Date().getFullYear()} Job Portal
      `;
      
      // Send email via Gmail
      try {
        const mailOptions = {
          from: `"Job Portal" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: '🔐 Password Reset Request - Job Portal',
          html: emailHtml,
          text: emailText,
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✓ Password reset email sent successfully to:', email);
        console.log('📧 Message ID:', info.messageId);
        
      } catch (emailError) {
        console.error('✗ Failed to send email:', emailError.message);
        if (emailError.message.includes('Invalid login')) {
          console.error('⚠️ Gmail authentication failed. Please check your EMAIL_USER and EMAIL_PASS in .env');
        }
        // Still return success to user for security
      }
    } else {
      console.log('User not found with email:', email);
    }
    
    // Always return success (security best practice - don't reveal if user exists)
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
 * RESET PASSWORD - Verify token and update password
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

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 6 characters",
        code: 400,
        errors: ["Password too short"],
      });
    }

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid reset token
    const user = await prisma.account.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date() // Token not expired
        }
      }
    });
    
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired reset token",
        code: 400,
        errors: ["Token is invalid or has expired. Please request a new password reset."],
      });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user's password and clear reset token fields
    await prisma.account.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });
    
    console.log('✓ Password reset successfully for user:', user.email);
    
    return res.status(200).json({
      status: "success",
      message: "Password reset successfully. You can now login with your new password.",
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