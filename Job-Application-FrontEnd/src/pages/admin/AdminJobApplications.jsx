import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getApplicationsForJob } from "../../../api/Endpoints/Applications.jsx";
import { getJobById } from "../../../api/Endpoints/Jobs.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import { showPopup } from "@/components/FloatingPopup";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APPLICATION_STATUSES } from "@/lib/constants";

export default function AdminJobApplications() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [jobRes, appsRes] = await Promise.all([
          getJobById(jobId),
          getApplicationsForJob(
            jobId,
            statusFilter ? { status: statusFilter } : {},
          ),
        ]);
        setJob(jobRes.data.data);
        setApplications(appsRes.data.data || []);
      } catch (err) {
        showPopup(getApiErrorMessage(err), "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId, statusFilter]);

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <Link to="/admin/jobs" className="text-sm text-sky-600 hover:underline">
        Back to jobs
      </Link>
      <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle>Applications — {job?.title || "..."}</CardTitle>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="">All statuses</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Exit exam</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.applicant?.account?.name}</TableCell>
                    <TableCell>{app.applicant?.account?.email}</TableCell>
                    <TableCell>
                      {app.applicant?.cgpa != null ? app.applicant.cgpa : "—"}
                    </TableCell>
                    <TableCell>
                      {app.applicant?.exitExamScore != null
                        ? app.applicant.exitExamScore
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell>
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/admin/applications/${app.id}`}
                        className="text-sky-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
