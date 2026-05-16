import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMyApplications } from "../../api/Endpoints/Jobs.jsx";
import { withdrawApplication, updateApplication } from "../../api/Endpoints/Applications.jsx";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "@/lib/apiError";
import StatusBadge from "@/components/StatusBadge";

export default function AppliedJobList() {
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const itemsPerPage = 5;
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const loadApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyApplications();
      setApplications(res.data.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load your applications."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (user?.role === "Admin") {
      navigate("/admin/applications");
      return;
    }
    loadApplications();
  }, [token, user]);

  const handleUpdateResume = async (applicationId) => {
    const resume = window.prompt("Enter updated resume text or file path:");
    if (!resume) return;
    setError("");
    setSuccess("");
    try {
      await updateApplication(applicationId, { resume });
      setSuccess("Application updated.");
      loadApplications();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update application."));
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm("Withdraw this application?")) return;
    setError("");
    setSuccess("");
    try {
      await withdrawApplication(applicationId);
      setSuccess("Application withdrawn.");
      loadApplications();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to withdraw."));
    }
  };

  const paginatedData = applications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.max(1, Math.ceil(applications.length / itemsPerPage));

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Applied Jobs</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track status and withdraw applications when allowed.</p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {error && <div className="px-4 py-3 text-sm text-rose-600">{error}</div>}
          {success && <div className="px-4 py-3 text-sm text-emerald-600">{success}</div>}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-100 dark:bg-slate-800">
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">Loading applications...</TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">No applications found.</TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <TableCell>{item.job?.title || "-"}</TableCell>
                      <TableCell>{item.job?.company || "-"}</TableCell>
                      <TableCell>{item.job?.location || "-"}</TableCell>
                      <TableCell><StatusBadge status={item.status} /></TableCell>
                      <TableCell>{new Date(item.appliedAt || item.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="flex flex-wrap gap-2">
                        {item.status === "Applied" && (
                          <Button variant="outline" size="sm" onClick={() => handleUpdateResume(item.id)}>
                            Update
                          </Button>
                        )}
                        {item.status !== "Accepted" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWithdraw(item.id)}
                            className="text-rose-600"
                          >
                            Withdraw
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-4 py-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


