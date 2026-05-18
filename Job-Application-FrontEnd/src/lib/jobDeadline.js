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

export const formatJobDeadline = (deadline) => {
  if (!deadline) return null;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
