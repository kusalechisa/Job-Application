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
 * APPLY FOR JOB (Applicant)
 */
export const applyForJob = [
  upload.single('resume'),
  async (req, res) => {
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
        return res.status(403).json({
          status: "error",
          message: "Applicant profile not found",
          code: 403,
          errors: ["Applicant profile not found"],
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

      let resume = req.body.resume; // text resume
      if (req.file) {
        resume = req.file.path; // file path
      }

      const application = await prisma.application.create({
        data: {
          jobId,
          applicantId: applicant.id,
          resume,
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
  }
];
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
