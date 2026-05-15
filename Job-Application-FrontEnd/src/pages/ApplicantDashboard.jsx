import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getJobs, getMyApplications } from "../../api/Endpoints/Jobs.jsx";
import { useAuth } from "../context/AuthContext";

export default function ApplicantDashboard() {
  const [jobCount, setJobCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const jobsRes = await getJobs({ page: 1, limit: 1 });
        setJobCount(jobsRes.data.pagination?.total ?? 0);
        if (token) {
          const appsRes = await getMyApplications();
          setApplicationCount(appsRes.data.data?.length ?? 0);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [token]);

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Available Jobs</p>
              <h2 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-slate-100">{loading ? "..." : jobCount}</h2>
            </div>
            <Badge className="bg-emerald-500 text-white">Open</Badge>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Browse the latest posted jobs and apply with your applicant profile.
          </p>

          <Link to="/joblist" className="mt-6 inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-500">
            View Job List
          </Link>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Applied Jobs</p>
                <h2 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-slate-100">{loading ? "..." : applicationCount}</h2>
              </div>
              <Badge className="bg-sky-500 text-white">Applied</Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Monitor your active applications and review the next steps in the recruitment process.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900">
            <CardTitle className="mb-4 text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Quick Actions</CardTitle>
            <div className="space-y-3">
              <Link to="/joblist" className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-sky-400 hover:bg-sky-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800">
                Browse available jobs
              </Link>
              <Link to="/appliedjobs" className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-sky-400 hover:bg-sky-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800">
                View application status
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}