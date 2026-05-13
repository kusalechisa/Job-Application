import { prisma } from "#/prisma.js";
import ExcelJS from "exceljs";

/**
 * CREATE JOB (Admin only)
 */
export const createJob = async (req, res) => {
  try {
    const { title, description, company, location, salary } = req.body;
    const postedById = req.user.id; // from auth middleware

    // Validation
    if (!title || !description || !company || !location) {
      return res.status(400).json({
        status: "error",
        message: "Title, description, company, and location are required",
        code: 400,
        errors: ["Missing required fields"],
      });
    }

    // Check if user is admin
    const user = await prisma.account.findUnique({ where: { id: postedById } });
    if (!user || user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can post jobs",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        title,
        description,
        company,
        location,
        salary,
        postedById,
      },
    });

    return res.status(201).json({
      status: "success",
      message: "Job created successfully",
      code: 201,
      data: job,
    });
  } catch (error) {
    console.error("CREATE JOB ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * GET ALL JOBS
 */
export const getJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        postedBy: {
          select: { name: true, email: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Jobs fetched successfully",
      code: 200,
      data: jobs,
    });
  } catch (error) {
    console.error("GET JOBS ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * APPLY FOR JOB (Applicant)
 */
export const applyForJob = async (req, res) => {
  try {
    const { jobId, resume } = req.body;
    const applicantId = req.user.id;

    // Validation
    if (!jobId) {
      return res.status(400).json({
        status: "error",
        message: "Job ID is required",
        code: 400,
        errors: ["Missing job ID"],
      });
    }

    // Check if job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
        code: 404,
        errors: ["Job not found"],
      });
    }

    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: { jobId, applicantId },
    });
    if (existingApplication) {
      return res.status(409).json({
        status: "error",
        message: "Already applied for this job",
        code: 409,
        errors: ["Duplicate application"],
      });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        applicantId,
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
};

/**
 * GET APPLICATIONS FOR A JOB (Admin)
 */
export const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can view applications",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        applicant: {
          select: { id: true, name: true, email: true },
        },
        job: {
          select: { title: true, company: true },
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
    console.error("GET APPLICATIONS ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * GET APPLICATION DETAILS (Admin)
 */
export const getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can view application details",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        applicant: true,
        job: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        status: "error",
        message: "Application not found",
        code: 404,
        errors: ["Application not found"],
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Application details fetched successfully",
      code: 200,
      data: application,
    });
  } catch (error) {
    console.error("GET APPLICATION DETAILS ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * UPDATE APPLICATION STATUS (Admin)
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can update application status",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    // Validate status
    const validStatuses = ["Applied", "Reviewed", "Accepted", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status",
        code: 400,
        errors: ["Status must be one of: Applied, Reviewed, Accepted, Rejected"],
      });
    }

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    return res.status(200).json({
      status: "success",
      message: "Application status updated successfully",
      code: 200,
      data: application,
    });
  } catch (error) {
    console.error("UPDATE APPLICATION STATUS ERROR:", error);
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
    const applicantId = req.user.id;

    const applications = await prisma.application.findMany({
      where: { applicantId },
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

/**
 * DOWNLOAD APPLICANTS FOR JOB AS EXCEL (Admin)
 */
export const downloadApplicantsExcel = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can download applicants data",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        applicant: true,
        job: true,
      },
    });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Applicants");

    // Add headers
    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Applied At", key: "appliedAt", width: 20 },
      { header: "Resume", key: "resume", width: 50 },
    ];

    // Add data
    applications.forEach((app) => {
      worksheet.addRow({
        name: app.applicant.name,
        email: app.applicant.email,
        status: app.status,
        appliedAt: app.appliedAt.toISOString().split("T")[0], // Date only
        resume: app.resume || "",
      });
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=applicants_${jobId}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("DOWNLOAD APPLICANTS EXCEL ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};