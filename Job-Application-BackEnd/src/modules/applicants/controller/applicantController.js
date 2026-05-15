import { prisma } from "#/prisma.js";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
    }
  }
});

/**
 * CREATE APPLICANT PROFILE
 */
export const createApplicantProfile = [
  upload.single('resume'),
  async (req, res) => {
    try {
      const accountId = req.user.id;
      const { phone, address, gender } = req.body;

      if (req.user.role !== "Applicant") {
        return res.status(403).json({
          status: "error",
          message: "Only applicants can create profiles",
          code: 403,
          errors: ["Unauthorized"],
        });
      }

      // Check if profile already exists
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

      let resume = req.body.resume; // text resume
      if (req.file) {
        resume = req.file.path; // file path
      }

      const profile = await prisma.applicant.create({
        data: {
          accountId,
          phone,
          address,
          gender,
          resume,
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
  }
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
      },
    });

    if (!profile) {
      return res.status(404).json({
        status: "error",
        message: "Applicant profile not found. Please create your profile first.",
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
  upload.single('resume'),
  async (req, res) => {
    try {
      const accountId = req.user.id;
      const { phone, address, gender } = req.body;

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
          message: "Applicant profile not found. Please create your profile first.",
          code: 404,
          errors: ["Profile not found"],
        });
      }

      let resume = req.body.resume; // text resume
      if (req.file) {
        resume = req.file.path; // file path
      }

      const updatedProfile = await prisma.applicant.update({
        where: { accountId },
        data: {
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(gender !== undefined && { gender }),
          ...(resume !== undefined && { resume }),
        },
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
  }
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
        message: "Applicant profile not found. Please create your profile first.",
        code: 404,
        errors: ["Applicant profile not found"],
      });
    }

    if (!applicant.resume) {
      return res.status(400).json({
        status: "error",
        message: "Resume not found in profile. Please update your profile with a resume.",
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
        resume: applicant.resume, // Use resume from profile
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
