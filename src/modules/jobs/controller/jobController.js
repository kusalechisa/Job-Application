import { prisma } from "#/prisma.js";

/**
 * CREATE JOB (Admin only)
 */
export const createJob = async (req, res) => {
  try {
    const { title, description, company, location, salary } = req.body;
    const postedById = req.user.id; // from auth middleware

    if (!title || !description || !company || !location) {
      return res.status(400).json({
        status: "error",
        message: "Title, description, company, and location are required",
        code: 400,
        errors: ["Missing required fields"],
      });
    }

    const user = await prisma.account.findUnique({ where: { id: postedById } });
    if (!user || user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can post jobs",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

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