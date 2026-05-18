export const API_APPLICATION_STATUSES = [
  "Applied",
  "Reviewed",
  "Accepted",
  "Rejected",
];

/** Maps UI / legacy values to Prisma ApplicationStatus enum values. */
export const normalizeApplicationStatus = (input) => {
  if (input == null) return null;

  const raw =
    typeof input === "string"
      ? input.trim()
      : typeof input?.status === "string"
        ? input.status.trim()
        : null;

  if (!raw) return null;

  const map = {
    applied: "Applied",
    reviewed: "Reviewed",
    accepted: "Accepted",
    rejected: "Rejected",
    interview: "Reviewed",
    Applied: "Applied",
    Reviewed: "Reviewed",
    Accepted: "Accepted",
    Rejected: "Rejected",
    Interview: "Reviewed",
  };

  return map[raw] ?? map[raw.toLowerCase()] ?? null;
};
