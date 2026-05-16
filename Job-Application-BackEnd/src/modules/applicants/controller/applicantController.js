import fs from "fs";
import { prisma } from "#src/prisma.js";
import multer from "multer";
import path from "path";
import {
  buildApplicantProfileData,
  buildApplicantUpdateData,
} from "#src/modules/applicants/utils/applicantProfileUtils.js";

const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "profilePicture") {
        const dir = "uploads/profile-pictures/";
        ensureDir(dir);
        cb(null, dir);
        return;
      }
      const dir = "uploads/resumes/";
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
      );
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "profilePicture") {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase(),
      );
      const mimetype = allowedTypes.test(file.mimetype);
      if (mimetype && extname) return cb(null, true);
      return cb(
        new Error(
          "Only JPEG, PNG, GIF, and WEBP images are allowed for profile pictures",
        ),
      );
    }

    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    return cb(
      new Error("Only PDF, DOC, DOCX, and TXT files are allowed for resumes"),
    );
  },
});

const profileUpload = upload.fields([
  { name: "resume", maxCount: 1 },
  { name: "profilePicture", maxCount: 1 },
]);

/**
 * CREATE APPLICANT PROFILE
 */
export const createApplicantProfile = [
  profileUpload,
  async (req, res) => {
    try {
      const accountId = req.user.id;

      if (req.user.role !== "Applicant") {
        return res.status(403).json({
          status: "error",
          message: "Only applicants can create profiles",
          code: 403,
          errors: ["Unauthorized"],
        });
      }

      const existingProfile = await prisma.applicant.findUnique({
        where: { accountId },
      });

      if (existingProfile) {
        return res.status(409).json({
          status: "error",
          message: "Applicant profile already exists",
          code: 409,
          errors: ["Profile already exists"],
        });
      }

      const profileData = buildApplicantProfileData(req.body, req.files);

      const profile = await prisma.applicant.create({
        data: {
          accountId,
          ...profileData,
        },
      });

      return res.status(201).json({
        status: "success",
        message: "Applicant profile created successfully",
        code: 201,
        data: profile,
      });
    } catch (error) {
      console.error("CREATE APPLICANT PROFILE ERROR:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        code: 500,
        errors: [error.message],
      });
    }
  },
];

/**
 * GET APPLICANT PROFILE
 */
export const getApplicantProfile = async (req, res) => {
  try {
    const accountId = req.user.id;

    if (req.user.role !== "Applicant") {
      return res.status(403).json({
        status: "error",
        message: "Only applicants can view their profile",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const profile = await prisma.applicant.findUnique({
      where: { accountId },
      include: {
        account: {
          select: { name: true, email: true },
        },
        education: true,
      },
    });

    if (!profile) {
      return res.status(404).json({
        status: "error",
        message:
          "Applicant profile not found. Please create your profile first.",
        code: 404,
        errors: ["Profile not found"],
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Applicant profile fetched successfully",
      code: 200,
      data: profile,
    });
  } catch (error) {
    console.error("GET APPLICANT PROFILE ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * UPDATE APPLICANT PROFILE
 */
export const updateApplicantProfile = [
  profileUpload,
  async (req, res) => {
    try {
      const accountId = req.user.id;

      if (req.user.role !== "Applicant") {
        return res.status(403).json({
          status: "error",
          message: "Only applicants can update their profile",
          code: 403,
          errors: ["Unauthorized"],
        });
      }

      const profile = await prisma.applicant.findUnique({
        where: { accountId },
      });

      if (!profile) {
        return res.status(404).json({
          status: "error",
          message:
            "Applicant profile not found. Please create your profile first.",
          code: 404,
          errors: ["Profile not found"],
        });
      }

      const updateData = buildApplicantUpdateData(req.body, req.files);

      const updatedProfile = await prisma.applicant.update({
        where: { accountId },
        data: updateData,
      });

      return res.status(200).json({
        status: "success",
        message: "Applicant profile updated successfully",
        code: 200,
        data: updatedProfile,
      });
    } catch (error) {
      console.error("UPDATE APPLICANT PROFILE ERROR:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        code: 500,
        errors: [error.message],
      });
    }
  },
];

/**
 * APPLY FOR JOB (Applicant)
 */
export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const accountId = req.user.id;

    if (req.user.role !== "Applicant") {
      return res.status(403).json({
        status: "error",
        message: "Only applicants can apply for jobs",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { accountId },
    });

    if (!applicant) {
      return res.status(404).json({
        status: "error",
        message:
          "Applicant profile not found. Please create your profile first.",
        code: 404,
        errors: ["Applicant profile not found"],
      });
    }

    if (!applicant.resume) {
      return res.status(400).json({
        status: "error",
        message:
          "Resume not found in profile. Please update your profile with a resume.",
        code: 400,
        errors: ["Resume required"],
      });
    }

    if (!jobId) {
      return res.status(400).json({
        status: "error",
        message: "Job ID is required",
        code: 400,
        errors: ["Missing job ID"],
      });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
        code: 404,
        errors: ["Job not found"],
      });
    }

    const existingApplication = await prisma.application.findFirst({
      where: { jobId, applicantId: applicant.id },
    });
    if (existingApplication) {
      return res.status(409).json({
        status: "error",
        message: "Already applied for this job",
        code: 409,
        errors: ["Duplicate application"],
      });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        applicantId: applicant.id,
        resume: applicant.resume,
      },
    });

    return res.status(201).json({
      status: "success",
      message: "Application submitted successfully",
      code: 201,
      data: application,
    });
  } catch (error) {
    console.error("APPLY FOR JOB ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * GET MY APPLICATIONS (Applicant)
 */
export const getMyApplications = async (req, res) => {
  try {
    const accountId = req.user.id;

    if (req.user.role !== "Applicant") {
      return res.status(403).json({
        status: "error",
        message: "Only applicants can view their applications",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { accountId },
      select: { id: true },
    });

    if (!applicant) {
      return res.status(404).json({
        status: "error",
        message: "Applicant profile not found",
        code: 404,
        errors: ["Applicant profile not found"],
      });
    }

    const applications = await prisma.application.findMany({
      where: { applicantId: applicant.id },
      include: {
        job: {
          select: { id: true, title: true, company: true, location: true },
        },
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Applications fetched successfully",
      code: 200,
      data: applications,
    });
  } catch (error) {
    console.error("GET MY APPLICATIONS ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};
