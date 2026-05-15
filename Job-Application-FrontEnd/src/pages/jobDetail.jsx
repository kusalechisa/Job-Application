import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getJobById, applyForJob } from "../../api/Endpoints/Jobs.jsx";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "@/lib/apiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getJobById(jobId);
        setJob(res.data.data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Job not found."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

  const handleApply = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setError("");
    setSuccess("");
    try {
      await applyForJob(jobId);
      setSuccess("Application submitted successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to apply."));
    }
  };

  if (loading) return <p className="p-6 text-slate-500">Loading job...</p>;
  if (!job) return <p className="p-6 text-rose-600">{error || "Job not found."}</p>;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <Link to="/joblist" className="mb-4 inline-block text-sm text-sky-600 hover:underline">
        Back to jobs
      </Link>
      <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">{job.title}</CardTitle>
            <Badge className="bg-emerald-500 text-white">Open</Badge>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {job.company} · {job.location}
            {job.salary ? ` · ${job.salary}` : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <p className="text-sm text-rose-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
          <section>
            <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">Description</h3>
            <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-400">{job.description}</p>
          </section>
          {job.postedBy && (
            <p className="text-sm text-slate-500">
              Posted by {job.postedBy.name} ({job.postedBy.email})
            </p>
          )}
          {user?.role === "Applicant" && (
            <Button onClick={handleApply} className="bg-sky-600 text-white hover:bg-sky-700">
              Apply for this job
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



