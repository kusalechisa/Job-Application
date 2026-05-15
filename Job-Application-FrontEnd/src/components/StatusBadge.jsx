import { Badge } from "@/components/ui/badge";
import { STATUS_STYLES } from "@/lib/constants";

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-slate-500/15 text-slate-700 dark:text-slate-300";
  return <Badge className={style}>{status || "Unknown"}</Badge>;
}





