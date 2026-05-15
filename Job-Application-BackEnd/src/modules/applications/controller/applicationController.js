import { prisma } from "#src/prisma.js";
import ExcelJS from "exceljs";
import { sendStatusNotification } from "#src/utils/email.js";

/**
 * GET APPLICATIONS FOR A JOB (Admin)
 */
export const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.query;

    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can view applications",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const where = { jobId };
    if (status) {
      where.status = status;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        applicant: {
          include: {
            account: {
              select: { id: true, name: true, email: true },
            },
          },
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
 * GET ALL APPLICATIONS (Admin)
 */
export const getAllApplications = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can view all applications",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const applications = await prisma.application.findMany({
      include: {
        applicant: {
          include: {
            account: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        job: {
          select: { id: true, title: true, company: true },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return res.status(200).json({
      status: "success",
      message: "All applications fetched successfully",
      code: 200,
      data: applications,
    });
  } catch (error) {
    console.error("GET ALL APPLICATIONS ERROR:", error);
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
        applicant: {
          include: {
            account: true,
          },
        },
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

    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can update application status",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

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
      include: {
        applicant: {
          include: {
            account: { select: { name: true, email: true } },
          },
        },
        job: { select: { title: true, company: true } },
      },
    });

    sendStatusNotification({
      applicantEmail: application.applicant.account.email,
      applicantName: application.applicant.account.name,
      jobTitle: application.job.title,
      company: application.job.company,
      status,
    }).catch((err) => console.error("Email notification failed:", err.message));

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
 * WITHDRAW APPLICATION (Applicant)
 */
export const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (req.user.role !== "Applicant") {
      return res.status(403).json({
        status: "error",
        message: "Only applicants can withdraw applications",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { accountId: req.user.id },
    });

    if (!applicant) {
      return res.status(404).json({
        status: "error",
        message: "Applicant profile not found",
        code: 404,
        errors: ["Applicant profile not found"],
      });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { applicant: true },
    });

    if (!application) {
      return res.status(404).json({
        status: "error",
        message: "Application not found",
        code: 404,
        errors: ["Application not found"],
      });
    }

    if (application.applicantId !== applicant.id) {
      return res.status(403).json({
        status: "error",
        message: "You can only withdraw your own applications",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    if (application.status === "Accepted") {
      return res.status(400).json({
        status: "error",
        message: "Cannot withdraw an accepted application",
        code: 400,
        errors: ["Application already accepted"],
      });
    }

    await prisma.application.delete({ where: { id: applicationId } });

    return res.status(200).json({
      status: "success",
      message: "Application withdrawn successfully",
      code: 200,
    });
  } catch (error) {
    console.error("WITHDRAW APPLICATION ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * UPDATE APPLICATION (Applicant)
 */
export const updateApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { resume } = req.body;

    if (req.user.role !== "Applicant") {
      return res.status(403).json({
        status: "error",
        message: "Only applicants can update applications",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { accountId: req.user.id },
    });

    if (!applicant) {
      return res.status(404).json({
        status: "error",
        message: "Applicant profile not found",
        code: 404,
        errors: ["Applicant profile not found"],
      });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { applicant: true },
    });

    if (!application) {
      return res.status(404).json({
        status: "error",
        message: "Application not found",
        code: 404,
        errors: ["Application not found"],
      });
    }

    if (application.applicantId !== applicant.id) {
      return res.status(403).json({
        status: "error",
        message: "You can only update your own applications",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    if (application.status !== "Applied") {
      return res.status(400).json({
        status: "error",
        message: "Can only update applications with 'Applied' status",
        code: 400,
        errors: ["Application status not eligible for update"],
      });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { resume },
    });

    return res.status(200).json({
      status: "success",
      message: "Application updated successfully",
      code: 200,
      data: updatedApplication,
    });
  } catch (error) {
    console.error("UPDATE APPLICATION ERROR:", error);
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
        applicant: {
          include: {
            account: true,
          },
        },
        job: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Applicants");

    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Applied At", key: "appliedAt", width: 20 },
      { header: "Resume", key: "resume", width: 50 },
    ];

    applications.forEach((app) => {
      worksheet.addRow({
        name: app.applicant.account.name,
        email: app.applicant.account.email,
        status: app.status,
        appliedAt: app.appliedAt.toISOString().split("T")[0],
        resume: app.resume || "",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=applicants_${jobId}.xlsx`
    );

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
