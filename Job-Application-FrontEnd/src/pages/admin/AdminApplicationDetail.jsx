import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getApplicationDetails, updateApplicationStatus } from "../../../api/Endpoints/Applications.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import StatusBadge from "@/components/StatusBadge";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AdminApplicationDetail() {
  const { applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const [status, setStatus] = useState("Applied");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getApplicationDetails(applicationId);
        setApplication(res.data.data);
        setStatus(res.data.data.status);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [applicationId]);

  const handleUpdateStatus = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await updateApplicationStatus(applicationId, status);
      setApplication(res.data.data);
      setSuccess("Status updated.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6 text-slate-500">Loading...</p>;
  if (!application) return <p className="p-6 text-rose-600">{error || "Not found."}</p>;

  const applicant = application.applicant;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <Link to="/admin/applications" className="text-sm text-sky-600 hover:underline">
        Back to applications
      </Link>
      <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Application Review</CardTitle>
          <StatusBadge status={application.status} />
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {error && <p className="text-rose-600">{error}</p>}
          {success && <p className="text-emerald-600">{success}</p>}
          <p><strong>Job:</strong> {application.job?.title} at {application.job?.company}</p>
          <p><strong>Applicant:</strong> {applicant?.account?.name} ({applicant?.account?.email})</p>
          <p><strong>Phone:</strong> {applicant?.phone || "—"}</p>
          <p><strong>Address:</strong> {applicant?.address || "—"}</p>
          <p><strong>Resume:</strong> {application.resume || applicant?.resume || "—"}</p>
          <p><strong>Applied:</strong> {new Date(application.appliedAt).toLocaleString()}</p>
          <div className="flex flex-wrap items-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <div className="space-y-2">
              <Label>Update status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleUpdateStatus} disabled={saving} className="bg-sky-600 text-white">
              {saving ? "Saving..." : "Save Status"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



