/**
 * Returns true if the application deadline has passed.
 * Applicants may apply through the end of the deadline calendar day (local time).
 */
export const isJobDeadlinePassed = (deadline) => {
  if (!deadline) return false;
  const endOfDeadlineDay = new Date(deadline);
  if (Number.isNaN(endOfDeadlineDay.getTime())) return false;
  endOfDeadlineDay.setHours(23, 59, 59, 999);
  return Date.now() > endOfDeadlineDay.getTime();
};

export const JOB_DEADLINE_PASSED_MESSAGE =
  "The application deadline for this job has passed. Applications are no longer accepted.";

/**
 * Marks jobs with a passed deadline as closed (unless already closed).
 */
export const closeExpiredJobs = async (prisma) => {
  const candidates = await prisma.job.findMany({
    where: {
      deadline: { not: null },
      status: { not: "closed" },
    },
    select: { id: true, deadline: true },
  });

  const idsToClose = candidates
    .filter((job) => isJobDeadlinePassed(job.deadline))
    .map((job) => job.id);

  if (idsToClose.length === 0) return 0;

  const result = await prisma.job.updateMany({
    where: { id: { in: idsToClose } },
    data: { status: "closed" },
  });

  return result.count;
};
