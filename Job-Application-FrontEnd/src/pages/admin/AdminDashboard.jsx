import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJobStats } from "../../../api/Endpoints/Stats.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getJobStats();
        setStats(res.data.data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="p-6 text-slate-500">Loading dashboard...</p>;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {error && <p className="text-rose-600">{error}</p>}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-slate-500">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{stats?.totalJobs ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-slate-500">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{stats?.totalApplications ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-slate-500">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {stats?.statusCounts &&
              Object.entries(stats.statusCounts).map(([status, count]) => (
                <Badge key={status} variant="outline">
                  {status}: {count}
                </Badge>
              ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/jobs" className="rounded-2xl border border-slate-200 bg-white p-4 text-sm hover:border-sky-400 dark:border-slate-800 dark:bg-slate-900">
          Manage jobs
        </Link>
        <Link to="/admin/applications" className="rounded-2xl border border-slate-200 bg-white p-4 text-sm hover:border-sky-400 dark:border-slate-800 dark:bg-slate-900">
          Review applications
        </Link>
        <Link to="/admin/users" className="rounded-2xl border border-slate-200 bg-white p-4 text-sm hover:border-sky-400 dark:border-slate-800 dark:bg-slate-900">
          Manage users
        </Link>
        <Link to="/admin/stats" className="rounded-2xl border border-slate-200 bg-white p-4 text-sm hover:border-sky-400 dark:border-slate-800 dark:bg-slate-900">
          View statistics
        </Link>
      </div>
    </div>
  );
}



