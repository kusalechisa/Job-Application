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
        salary: salary ? salary.toString() : null,
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
    const { search, location, company, page = 1, limit = 10 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const jobs = await prisma.job.findMany({
      where,
      skip,
      take,
      include: {
        postedBy: {
          select: { name: true, email: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    const total = await prisma.job.count({ where });

    return res.status(200).json({
      status: "success",
      message: "Jobs fetched successfully",
      code: 200,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
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
 * GET SINGLE JOB
 */
export const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        postedBy: {
          select: { name: true, email: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
        code: 404,
        errors: ["Job not found"],
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Job fetched successfully",
      code: 200,
      data: job,
    });
  } catch (error) {
    console.error("GET JOB BY ID ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * UPDATE JOB (Admin only)
 */
export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { title, description, company, location, salary } = req.body;

    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can update jobs",
        code: 403,
        errors: ["Unauthorized"],
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

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(company && { company }),
        ...(location && { location }),
        ...(salary !== undefined && { salary: salary.toString() }),
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Job updated successfully",
      code: 200,
      data: updatedJob,
    });
  } catch (error) {
    console.error("UPDATE JOB ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * DELETE JOB (Admin only)
 */
export const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can delete jobs",
        code: 403,
        errors: ["Unauthorized"],
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

    await prisma.job.delete({ where: { id: jobId } });

    return res.status(200).json({
      status: "success",
      message: "Job deleted successfully",
      code: 200,
    });
  } catch (error) {
    console.error("DELETE JOB ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};