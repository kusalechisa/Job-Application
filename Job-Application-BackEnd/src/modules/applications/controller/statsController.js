import { prisma } from "#src/prisma.js";

/**
 * GET JOB STATS (Admin)
 */
export const getJobStats = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can view stats",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const totalJobs = await prisma.job.count();
    const totalApplications = await prisma.application.count();

    const statusCounts = await prisma.application.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const stats = {
      totalJobs,
      totalApplications,
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {}),
    };

    return res.status(200).json({
      status: "success",
      message: "Job stats fetched successfully",
      code: 200,
      data: stats,
    });
  } catch (error) {
    console.error("GET JOB STATS ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * GET APPLICATION STATS (Admin)
 */
export const getApplicationStats = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can view stats",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const applicationsByJob = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    const statusCounts = await prisma.application.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const stats = {
      applicationsByJob,
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {}),
    };

    return res.status(200).json({
      status: "success",
      message: "Application stats fetched successfully",
      code: 200,
      data: stats,
    });
  } catch (error) {
    console.error("GET APPLICATION STATS ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};