export const APPLICATION_STATUSES = [
  "Applied",
  "Reviewed",
  "Accepted",
  "Rejected",
];

export const STATUS_STYLES = {
  Applied: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  Reviewed: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Accepted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  Rejected: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

export function getDashboardPath(role) {
  return role === "Admin" ? "/admin/dashboard" : "/app-dashboard";
}
