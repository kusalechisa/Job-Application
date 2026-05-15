import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Hand, ChevronLeft, ChevronRight } from "lucide-react";
import { getJobs, applyForJob } from "../../api/Endpoints/Jobs.jsx";
import { useAuth } from "../context/AuthContext";

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 3 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const { token } = useAuth();
  const navigate = useNavigate();
  const itemsPerPage = 3;

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getJobs({ page: currentPage, limit: itemsPerPage, search });
      setJobs(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0, limit: itemsPerPage });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load jobs at the moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [currentPage, search]);

  const handleApply = async (jobId) => {
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
      setError(err?.response?.data?.message || "Unable to submit application.");
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <TooltipProvider>
        <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Job Vacancies</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">Browse open positions and apply to roles that match your profile.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search jobs..."
                  className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <span className="text-sm text-slate-500 dark:text-slate-400">{pagination.total} open positions</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {error && <div className="px-4 py-3 text-sm text-rose-600">{error}</div>}
            {success && <div className="px-4 py-3 text-sm text-emerald-600">{success}</div>}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-100 dark:bg-slate-800">
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">Loading jobs...</TableCell>
                    </TableRow>
                  ) : jobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">No jobs found.</TableCell>
                    </TableRow>
                  ) : (
                    jobs.map((job) => (
                      <TableRow key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                        <TableCell>{job.title}</TableCell>
                        <TableCell>{job.company}</TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell>{job.salary || "-"}</TableCell>
                        <TableCell>{job._count?.applications ?? 0}</TableCell>
                        <TableCell className="flex flex-wrap gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button onClick={() => handleApply(job.id)} className="bg-blue-600 text-white hover:bg-blue-700" size="icon">
                                <Hand className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Apply</TooltipContent>
                          </Tooltip>
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
              <span>Page {pagination.page} of {pagination.pages}</span>
              <Button variant="outline" size="sm" disabled={currentPage === pagination.pages} onClick={() => setCurrentPage((p) => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    </div>
  );
}