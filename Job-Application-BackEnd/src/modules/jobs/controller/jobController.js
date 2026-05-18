import { prisma } from "#src/prisma.js";
import { closeExpiredJobs } from "#src/utils/jobDeadline.js";

const isAdminUser = (req) => req.user?.role === "Admin";

const parseOptionalDate = (value) => {
  if (value === undefined) return undefined;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildJobData = (body, { partial = false } = {}) => {
  const {
    title,
    description,
    company,
    location,
    salary,
    type,
    workType,
    employmentType,
    responsibilities,
    requirements,
    deadline,
    status,
    featured,
  } = body;

  const data = {};

  if (partial) {
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (company !== undefined) data.company = company;
    if (location !== undefined) data.location = location;
  } else {
    data.title = title;
    data.description = description;
    data.company = company;
    data.location = location;
  }

  if (salary !== undefined) data.salary = salary ? String(salary) : null;
  if (type !== undefined) data.type = type || null;
  if (workType !== undefined) data.workType = workType || null;
  if (employmentType !== undefined) data.employmentType = employmentType || null;
  if (responsibilities !== undefined) data.responsibilities = responsibilities || null;
  if (requirements !== undefined) data.requirements = requirements || null;
  if (deadline !== undefined) data.deadline = parseOptionalDate(deadline);
  if (status !== undefined) data.status = status;
  if (featured !== undefined) data.featured = Boolean(featured);

  return data;
};

/**
 * CREATE JOB (Admin only)
 */
export const createJob = async (req, res) => {
  try {
    const { title, description, company, location } = req.body;
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
        ...buildJobData(req.body),
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
    await closeExpiredJobs(prisma);

    const {
      search,
      location,
      company,
      status,
      workType,
      employmentType,
      page = 1,
      limit = 10,
    } = req.query;

    const isAdmin = isAdminUser(req);
    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }
    if (isAdmin) {
      if (status) where.status = status;
    } else {
      // Applicants and public users only see published (active) jobs
      where.status = "active";
    }
    if (workType) {
      where.workType = workType;
    }
    if (employmentType) {
      where.employmentType = employmentType;
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

    await closeExpiredJobs(prisma);

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

    if (!isAdminUser(req) && job.status === "draft") {
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

    const data = buildJobData(req.body, { partial: true });
    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No valid fields to update",
        code: 400,
        errors: ["Empty update payload"],
      });
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data,
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