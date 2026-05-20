import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
} from "../../../api/Endpoints/Jobs.jsx";
import { downloadApplicantsExcel } from "../../../api/Endpoints/Applications.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pencil,
  Trash2,
  Download,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Filter,
  X,
  Briefcase,
  MapPin,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  MoreHorizontal,
} from "lucide-react";

const emptyJob = {
  title: "",
  description: "",
  company: "",
  location: "",
  salary: "",
  type: "",
  workType: "",
  employmentType: "",
  responsibilities: "",
  requirements: "",
  deadline: "",
  status: "draft",
  featured: false,
};

const formatDateForInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const buildJobPayload = (form) => ({
  title: form.title,
  description: form.description,
  company: form.company,
  location: form.location,
  salary: form.salary || null,
  type: form.type || null,
  workType: form.workType || null,
  employmentType: form.employmentType || null,
  responsibilities: form.responsibilities || null,
  requirements: form.requirements || null,
  deadline: form.deadline || null,
  status: form.status || "draft",
  featured: Boolean(form.featured),
});

const formatJobFieldLabel = (value) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");

const getJobTypeLabel = (job) => {
  const parts = [job.employmentType, job.workType, job.type].filter(Boolean);
  if (parts.length === 0) return null;
  return parts.map(formatJobFieldLabel).join(" · ");
};

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
  const [filters, setFilters] = useState({
    status: "all",
    workType: "all",
    employmentType: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // table or grid

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10, search };
      if (filters.status && filters.status !== "all") params.status = filters.status;
      if (filters.workType && filters.workType !== "all") params.workType = filters.workType;
      if (filters.employmentType && filters.employmentType !== "all")
        params.employmentType = filters.employmentType;
      const res = await getJobs(params);
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
  }, [page, search, filters]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyJob);
    setModalOpen(true);
  };

  const openEdit = (job) => {
    setEditingId(job.id);
    setForm({
      title: job.title ?? "",
      description: job.description ?? "",
      company: job.company ?? "",
      location: job.location ?? "",
      salary: job.salary ?? "",
      type: job.type ?? "",
      workType: job.workType ?? "",
      employmentType: job.employmentType ?? "",
      responsibilities: job.responsibilities ?? "",
      requirements: job.requirements ?? "",
      deadline: formatDateForInput(job.deadline),
      status: job.status || "draft",
      featured: Boolean(job.featured),
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildJobPayload(form);
      if (editingId) {
        await updateJob(editingId, payload);
      } else {
        await createJob(payload);
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
    if (
      !window.confirm(
        "Are you sure you want to delete this job? This action cannot be undone.",
      )
    )
      return;
    try {
      await deleteJob(jobId);
      fetchJobs();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleDuplicate = async (job) => {
    try {
      const duplicatedJob = buildJobPayload({
        ...job,
        title: `${job.title} (Copy)`,
        status: "draft",
        deadline: formatDateForInput(job.deadline),
      });
      await createJob(duplicatedJob);
      fetchJobs();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleTogglePublish = async (job) => {
    try {
      const newStatus = job.status === "active" ? "closed" : "active";
      await updateJob(job.id, { status: newStatus });
      fetchJobs();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const clearFilters = () => {
    setFilters({ status: "all", workType: "all", employmentType: "all" });
    setShowFilters(false);
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

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "closed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3" />;
      case "closed":
        return <X className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        className={`
        fixed left-0 top-0 z-50 h-full w-72 transform transition-transform duration-300 ease-in-out bg-white dark:bg-slate-900 shadow-2xl
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    JobPortal
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Admin Panel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 py-6">
            <nav className="space-y-1 px-4">
              <NavItem icon={Briefcase} label="Dashboard" to="/admin" />
              <NavItem icon={Briefcase} label="Jobs" to="/admin/jobs" active />
              <NavItem icon={Users} label="Applicants" to="/admin/applicants" />
              <NavItem
                icon={FileText}
                label="Applications"
                to="/admin/applications"
              />
              <NavItem
                icon={PieChart}
                label="Analytics"
                to="/admin/analytics"
              />
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <main className="p-4 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Manage Jobs
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Create, edit, and manage all job postings from one place
                </p>
              </div>
              <Button
                onClick={openCreate}
                className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:shadow-lg transition-all"
              >
                <Plus className="mr-2 h-4 w-4" /> Post New Job
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Stats Overview */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-xl bg-blue-100 dark:bg-blue-900/30 p-3">
                  <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  +12%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {pagination.total || 0}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total Jobs
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-xl bg-emerald-100 dark:bg-emerald-900/30 p-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Active
                </Badge>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {jobs.filter((j) => j.status === "active").length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Active Jobs
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-xl bg-blue-100 dark:bg-blue-900/30 p-3">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {jobs.reduce(
                  (sum, job) => sum + (job._count?.applications || 0),
                  0,
                )}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total Applications
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-xl bg-orange-100 dark:bg-orange-900/30 p-3">
                  <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {jobs.filter((j) => j.featured).length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Featured Jobs
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8 overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by title, company, or location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {Object.values(filters).some((f) => f && f !== "all") && (
                      <Badge variant="secondary" className="ml-2">
                        Active
                      </Badge>
                    )}
                  </Button>
                  <div className="flex border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-3 py-2 text-sm transition-colors ${
                        viewMode === "table"
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                          : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      Table
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2 text-sm transition-colors ${
                        viewMode === "grid"
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                          : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      Grid
                    </button>
                  </div>
                </div>
              </div>

              {showFilters && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Status
                      </Label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) =>
                          setFilters({ ...filters, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Work Type
                      </Label>
                      <Select
                        value={filters.workType}
                        onValueChange={(value) =>
                          setFilters({ ...filters, workType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All types</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="on-site">On-site</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Employment Type
                      </Label>
                      <Select
                        value={filters.employmentType}
                        onValueChange={(value) =>
                          setFilters({ ...filters, employmentType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All types</SelectItem>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={clearFilters} size="sm">
                      <X className="mr-2 h-3 w-3" /> Clear All Filters
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Jobs Table/Grid View */}
          <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Loading jobs...
                    </p>
                  </div>
                </div>
              ) : viewMode === "table" ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead className="font-semibold">
                          Job Title
                        </TableHead>
                        <TableHead className="font-semibold hidden md:table-cell">
                          Company
                        </TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">
                          Location
                        </TableHead>
                        <TableHead className="font-semibold hidden sm:table-cell">
                          Employment
                        </TableHead>
                        <TableHead className="font-semibold">Apps</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">
                          Posted
                        </TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <div className="text-center">
                              <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                              <p className="text-slate-600 dark:text-slate-400">
                                No jobs found
                              </p>
                              <Button
                                onClick={openCreate}
                                variant="link"
                                className="mt-2"
                              >
                                Create your first job
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        jobs.map((job) => (
                          <TableRow
                            key={job.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                          >
                            <TableCell className="font-medium">
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {job.title}
                                </p>
                                <p className="text-xs text-slate-500 md:hidden">
                                  {job.company}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {job.company}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                <span className="text-sm">{job.location}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {getJobTypeLabel(job) ? (
                                <Badge variant="outline" className="text-xs">
                                  {getJobTypeLabel(job)}
                                </Badge>
                              ) : (
                                <span className="text-xs text-slate-400">
                                  Not set
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-slate-400" />
                                <span className="font-semibold">
                                  {job._count?.applications ?? 0}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${getStatusColor(job.status)} gap-1`}
                              >
                                {getStatusIcon(job.status)}
                                {job.status || "draft"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-slate-500">
                              {job.createdAt
                                ? new Date(job.createdAt).toLocaleDateString()
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                  <DropdownMenuItem onClick={() => openEdit(job)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicate(job)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleTogglePublish(job)}>
                                    {job.status === "active" ? (
                                      <EyeOff className="h-4 w-4 mr-2" />
                                    ) : (
                                      <Eye className="h-4 w-4 mr-2" />
                                    )}
                                    {job.status === "active" ? "Unpublish" : "Publish"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload(job.id, job.title)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Applications
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(job.id)}
                                    variant="destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                            {job.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {job.company}
                          </p>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status || "draft"}
                        </Badge>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="h-3 w-3" />
                          <span>{job.location}</span>
                        </div>
                        {getJobTypeLabel(job) && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Briefcase className="h-3 w-3" />
                            <span>{getJobTypeLabel(job)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Users className="h-3 w-3" />
                          <span>
                            {job._count?.applications ?? 0} applications
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {job.createdAt
                              ? new Date(job.createdAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(job)}
                          className="flex-1"
                        >
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(job.id, job.title)}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" /> Export
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {jobs.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="gap-2"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Form Modal */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
              <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="text-xl">
                    {editingId ? "Edit Job" : "Create New Job"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSave} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-indigo-500" />
                        Basic Information
                      </h3>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label>Job Title *</Label>
                          <Input
                            value={form.title}
                            onChange={(e) =>
                              setForm({ ...form, title: e.target.value })
                            }
                            placeholder="e.g. Senior Frontend Developer"
                            required
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Company *</Label>
                            <Input
                              value={form.company}
                              onChange={(e) =>
                                setForm({ ...form, company: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Location *</Label>
                            <Input
                              value={form.location}
                              onChange={(e) =>
                                setForm({ ...form, location: e.target.value })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Salary Range</Label>
                            <Input
                              value={form.salary}
                              onChange={(e) =>
                                setForm({ ...form, salary: e.target.value })
                              }
                              placeholder="e.g. $80,000 - $120,000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Department / Category</Label>
                            <Select
                              value={form.type || undefined}
                              onValueChange={(value) =>
                                setForm({ ...form, type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="engineering">
                                  Engineering
                                </SelectItem>
                                <SelectItem value="design">Design</SelectItem>
                                <SelectItem value="marketing">
                                  Marketing
                                </SelectItem>
                                <SelectItem value="sales">Sales</SelectItem>
                                <SelectItem value="hr">HR</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="operations">
                                  Operations
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Job Description */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Job Description</h3>
                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          value={form.description}
                          onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                          }
                          required
                          rows={4}
                          placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Responsibilities</Label>
                          <Textarea
                            value={form.responsibilities}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                responsibilities: e.target.value,
                              })
                            }
                            rows={3}
                            placeholder="• Lead development of features&#10;• Collaborate with cross-functional teams&#10;• Mentor junior developers"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Requirements</Label>
                          <Textarea
                            value={form.requirements}
                            onChange={(e) =>
                              setForm({ ...form, requirements: e.target.value })
                            }
                            rows={3}
                            placeholder="• 5+ years of experience&#10;• Strong knowledge of React&#10;• Bachelor's degree in CS or related field"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Job Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Job Settings</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={form.status || "draft"}
                            onValueChange={(value) =>
                              setForm({ ...form, status: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Work Type</Label>
                          <Select
                            value={form.workType || undefined}
                            onValueChange={(value) =>
                              setForm({ ...form, workType: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="remote">Remote</SelectItem>
                              <SelectItem value="on-site">On-site</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Employment Type</Label>
                          <Select
                            value={form.employmentType || undefined}
                            onValueChange={(value) =>
                              setForm({ ...form, employmentType: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">
                                Full-time
                              </SelectItem>
                              <SelectItem value="part-time">
                                Part-time
                              </SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="internship">
                                Internship
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Application Deadline</Label>
                          <Input
                            type="date"
                            value={form.deadline}
                            onChange={(e) =>
                              setForm({ ...form, deadline: e.target.value })
                            }
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Jobs auto-close when this date passes. Set status to
                            Active to publish on the job board.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={form.featured}
                          onChange={(e) =>
                            setForm({ ...form, featured: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <Label htmlFor="featured" className="cursor-pointer">
                          Feature this job (will appear prominently on the
                          careers page)
                        </Label>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white"
                      >
                        {saving
                          ? "Saving..."
                          : editingId
                            ? "Update Job"
                            : "Create Job"}
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

// Navigation Item Component
function NavItem({ icon: Icon, label, to, active = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
        active
          ? "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 dark:from-indigo-950/50 dark:to-blue-950/50 dark:text-indigo-400"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

// Missing imports
import { FileText, PieChart } from "lucide-react";
