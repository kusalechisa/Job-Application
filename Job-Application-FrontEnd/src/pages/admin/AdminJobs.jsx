import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJobs, createJob, updateJob, deleteJob } from "../../../api/Endpoints/Jobs.jsx";
import { downloadApplicantsExcel } from "../../../api/Endpoints/Applications.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Download, Plus } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";

const emptyJob = { title: "", description: "", company: "", location: "", salary: "" };

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyJob);
  const [saving, setSaving] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getJobs({ page, limit: 10, search });
      setJobs(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, pages: 1 });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyJob);
    setModalOpen(true);
  };

  const openEdit = (job) => {
    setEditingId(job.id);
    setForm({
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      salary: job.salary || "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateJob(editingId, form);
      } else {
        await createJob(form);
      }
      setModalOpen(false);
      fetchJobs();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await deleteJob(jobId);
      fetchJobs();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleDownload = async (jobId, title) => {
    try {
      const res = await downloadApplicantsExcel(jobId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}-applicants.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getApiErrorMessage(err, "Download failed."));
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <AdminNavbar />
        <main className="ml-64 mt-16 p-6">
          <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
              <CardTitle>Manage Jobs</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-xs"
                />
                <Button onClick={openCreate} className="bg-sky-600 text-white">
                  <Plus className="mr-2 h-4 w-4" /> New Job
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : jobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No jobs found.</TableCell>
                    </TableRow>
                  ) : (
                    jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>{job.title}</TableCell>
                        <TableCell>{job.company}</TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell>{job._count?.applications ?? 0}</TableCell>
                        <TableCell className="flex flex-wrap gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(job)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(job.id)}>
                            <Trash2 className="h-4 w-4 text-rose-600" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDownload(job.id, job.title)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Link to={`/admin/jobs/${job.id}/applications`} className="text-xs text-sky-600 hover:underline self-center px-2">
                            Apps
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-between text-sm">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span>Page {pagination.page} of {pagination.pages}</span>
                <Button variant="outline" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>

          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>{editingId ? "Edit Job" : "Create Job"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="grid gap-3">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Salary</Label>
                      <Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <textarea
                        className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={saving} className="bg-sky-600 text-white">
                        {saving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}



