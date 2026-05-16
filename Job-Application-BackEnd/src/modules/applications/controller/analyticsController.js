import { prisma } from "#src/prisma.js";

/**
 * GET DASHBOARD DATA (Admin only)
 */
export const getDashboardData = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can view dashboard",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Get all applications with job and applicant data
    const applications = await prisma.application.findMany({
      include: {
        job: true,
        applicant: {
          include: {
            account: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const applicants = await prisma.applicant.findMany({
      include: {
        account: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Applications today
    const applicationsToday = applications.filter(
      (app) => new Date(app.appliedAt) >= today
    ).length;

    const applicationsYesterday = applications.filter(
      (app) => {
        const date = new Date(app.appliedAt);
        return date >= yesterday && date < today;
      }
    ).length;

    const applicationsTodayChange = applicationsYesterday > 0
      ? ((applicationsToday - applicationsYesterday) / applicationsYesterday) * 100
      : 0;

    // Accepted candidates
    const acceptedCandidates = applications.filter(
      (app) => app.status === "Accepted"
    ).length;

    const acceptedLastMonth = applications.filter(
      (app) => app.status === "Accepted" && new Date(app.appliedAt) >= lastMonth
    ).length;

    const acceptedChange = acceptedLastMonth > 0
      ? ((acceptedCandidates - acceptedLastMonth) / acceptedLastMonth) * 100
      : 0;

    // Rejected candidates
    const rejectedCandidates = applications.filter(
      (app) => app.status === "Rejected"
    ).length;

    const rejectedLastMonth = applications.filter(
      (app) => app.status === "Rejected" && new Date(app.appliedAt) >= lastMonth
    ).length;

    const rejectedChange = rejectedLastMonth > 0
      ? ((rejectedCandidates - rejectedLastMonth) / rejectedLastMonth) * 100
      : 0;

    // Recent applications (last 5)
    const recentApplications = applications.slice(0, 5).map((app) => ({
      id: app.id,
      applicantName: app.applicant.account.name,
      jobTitle: app.job.title,
      company: app.job.company,
      status: app.status,
      appliedAt: app.appliedAt,
    }));

    // Job posting trends (last 6 months)
    const jobPostingTrends = {};
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      jobPostingTrends[key] = 0;
    }

    jobs.forEach((job) => {
      const date = new Date(job.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (jobPostingTrends.hasOwnProperty(key)) {
        jobPostingTrends[key]++;
      }
    });

    const jobPostingTrendsData = Object.entries(jobPostingTrends).map(([month, count]) => ({
      month,
      count,
    }));

    // Applications per month (last 6 months for dashboard)
    const applicationsPerMonth = {};
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      applicationsPerMonth[key] = 0;
    }

    applications.forEach((app) => {
      const date = new Date(app.appliedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (applicationsPerMonth.hasOwnProperty(key)) {
        applicationsPerMonth[key]++;
      }
    });

    const applicationsPerMonthData = Object.entries(applicationsPerMonth).map(([month, count]) => ({
      month,
      count,
    }));

    // Most applied jobs (top 5 for dashboard)
    const jobApplicationCounts = {};
    applications.forEach((app) => {
      const jobId = app.jobId;
      if (!jobApplicationCounts[jobId]) {
        jobApplicationCounts[jobId] = {
          jobId,
          title: app.job.title,
          company: app.job.company,
          count: 0,
        };
      }
      jobApplicationCounts[jobId].count++;
    });

    const mostAppliedJobs = Object.values(jobApplicationCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Hiring success rate
    const totalApplications = applications.length;
    const hiringRate = totalApplications > 0 ? (acceptedCandidates / totalApplications) * 100 : 0;

    return res.status(200).json({
      status: "success",
      message: "Dashboard data fetched successfully",
      code: 200,
      data: {
        totalJobs: jobs.length,
        totalApplicants: applicants.length,
        applicationsToday,
        applicationsTodayChange: Math.round(applicationsTodayChange * 10) / 10,
        acceptedCandidates,
        acceptedChange: Math.round(acceptedChange * 10) / 10,
        rejectedCandidates,
        rejectedChange: Math.round(rejectedChange * 10) / 10,
        recentApplications,
        jobPostingTrends: jobPostingTrendsData,
        applicationsPerMonth: applicationsPerMonthData,
        mostAppliedJobs,
        hiringRate: Math.round(hiringRate * 10) / 10,
      },
    });
  } catch (error) {
    console.error("GET DASHBOARD DATA ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};

/**
 * GET ADVANCED ANALYTICS (Admin only)
 */
export const getAdvancedAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can view analytics",
        code: 403,
        errors: ["Unauthorized"],
      });
    }

    // Get all applications with job and applicant data
    const applications = await prisma.application.findMany({
      include: {
        job: true,
        applicant: {
          include: {
            account: true,
          },
        },
      },
    });

    const jobs = await prisma.job.findMany();
    const applicants = await prisma.applicant.findMany({
      include: {
        account: true,
      },
    });

    // 1. Applications per month (last 12 months)
    const applicationsPerMonth = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      applicationsPerMonth[key] = 0;
    }

    applications.forEach((app) => {
      const date = new Date(app.appliedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (applicationsPerMonth.hasOwnProperty(key)) {
        applicationsPerMonth[key]++;
      }
    });

    const applicationsPerMonthData = Object.entries(applicationsPerMonth).map(([month, count]) => ({
      month,
      count,
    }));

    // 2. Most applied jobs (top 10)
    const jobApplicationCounts = {};
    applications.forEach((app) => {
      const jobId = app.jobId;
      if (!jobApplicationCounts[jobId]) {
        jobApplicationCounts[jobId] = {
          jobId,
          title: app.job.title,
          company: app.job.company,
          count: 0,
        };
      }
      jobApplicationCounts[jobId].count++;
    });

    const mostAppliedJobs = Object.values(jobApplicationCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 3. Rejection rate and Hiring rate
    const totalApplications = applications.length;
    const acceptedCount = applications.filter((app) => app.status === "Accepted").length;
    const rejectedCount = applications.filter((app) => app.status === "Rejected").length;
    const reviewedCount = applications.filter((app) => app.status === "Reviewed").length;
    const appliedCount = applications.filter((app) => app.status === "Applied").length;

    const rejectionRate = totalApplications > 0 ? (rejectedCount / totalApplications) * 100 : 0;
    const hiringRate = totalApplications > 0 ? (acceptedCount / totalApplications) * 100 : 0;

    const statusDistribution = [
      { name: "Applied", value: appliedCount, color: "#3b82f6" },
      { name: "Reviewed", value: reviewedCount, color: "#f59e0b" },
      { name: "Accepted", value: acceptedCount, color: "#10b981" },
      { name: "Rejected", value: rejectedCount, color: "#ef4444" },
    ];

    // 4. Top locations (from jobs)
    const locationCounts = {};
    jobs.forEach((job) => {
      const location = job.location;
      if (!locationCounts[location]) {
        locationCounts[location] = 0;
      }
      locationCounts[location]++;
    });

    const topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 5. Applicant growth (new applicants per month)
    const applicantGrowth = {};
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      applicantGrowth[key] = 0;
    }

    applicants.forEach((applicant) => {
      const date = new Date(applicant.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (applicantGrowth.hasOwnProperty(key)) {
        applicantGrowth[key]++;
      }
    });

    const applicantGrowthData = Object.entries(applicantGrowth).map(([month, count]) => ({
      month,
      count,
    }));

    return res.status(200).json({
      status: "success",
      message: "Analytics fetched successfully",
      code: 200,
      data: {
        applicationsPerMonth: applicationsPerMonthData,
        mostAppliedJobs,
        rejectionRate: Math.round(rejectionRate * 10) / 10,
        hiringRate: Math.round(hiringRate * 10) / 10,
        statusDistribution,
        topLocations,
        applicantGrowth: applicantGrowthData,
        totalApplications,
        totalJobs: jobs.length,
        totalApplicants: applicants.length,
      },
    });
  } catch (error) {
    console.error("GET ANALYTICS ERROR:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: 500,
      errors: [error.message],
    });
  }
};
