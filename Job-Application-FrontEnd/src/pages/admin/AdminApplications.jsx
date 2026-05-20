import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllApplications, updateApplicationStatus } from "../../../api/Endpoints/Applications.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Filter, 
  Download, 
  X, 
  Star, 
  FileText, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  ExternalLink, 
  Check, 
  XCircle, 
  Eye,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  UserCheck,
  Award,
  PieChart,
  Home,
  Settings,
  LogOut,
  Menu
} from "lucide-react";

function getApplicantCGPA(applicant) {
  if (applicant?.cgpa != null) return Number(applicant.cgpa);
  const edu = applicant?.education?.find(e => e.cgpa != null);
  return edu?.cgpa != null ? Number(edu.cgpa) : null;
}

function getApplicantExitExam(applicant) {
  if (applicant?.exitExamScore != null) return Number(applicant.exitExamScore);
  const edu = applicant?.education?.find(e => e.exitExamScore != null);
  return edu?.exitExamScore != null ? Number(edu.exitExamScore) : null;
}

function inApplicantScoreRange(value, minStr, maxStr) {
  if (minStr === "" && maxStr === "") return true;
  if (value == null || value === "") return false;
  const n = Number(value);
  if (Number.isNaN(n)) return false;
  if (minStr !== "" && minStr != null) {
    const min = Number(minStr);
    if (!Number.isNaN(min) && n < min) return false;
  }
  if (maxStr !== "" && maxStr != null) {
    const max = Number(maxStr);
    if (!Number.isNaN(max) && n > max) return false;
  }
  return true;
}

function formatApplicantMetric(value) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    education: "",
    experience: "",
    location: "",
    cgpaMin: "",
    cgpaMax: "",
    exitExamMin: "",
    exitExamMax: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [recruiterNotes, setRecruiterNotes] = useState("");
  const [candidateRating, setCandidateRating] = useState(0);
  const [savingNotes, setSavingNotes] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllApplications();
      let filtered = res.data.data || [];
      
      // Client-side filtering for search
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(app => 
          app.applicant?.account?.name?.toLowerCase().includes(searchLower) ||
          app.applicant?.account?.email?.toLowerCase().includes(searchLower) ||
          app.job?.title?.toLowerCase().includes(searchLower)
        );
      }
      
      // Client-side filtering for status
      if (filters.status && filters.status !== "all") {
        filtered = filtered.filter(app => app.status === filters.status);
      }
      
      // Client-side filtering for education
      if (filters.education) {
        filtered = filtered.filter(app => app.applicant?.education === filters.education);
      }
      
      // Client-side filtering for experience
      if (filters.experience) {
        filtered = filtered.filter(app => app.applicant?.experience === filters.experience);
      }
      
      // Client-side filtering for location
      if (filters.location) {
        filtered = filtered.filter(app => app.applicant?.location === filters.location);
      }

      if (filters.cgpaMin !== "" || filters.cgpaMax !== "") {
        filtered = filtered.filter((app) =>
          inApplicantScoreRange(getApplicantCGPA(app.applicant), filters.cgpaMin, filters.cgpaMax),
        );
      }
      if (filters.exitExamMin !== "" || filters.exitExamMax !== "") {
        filtered = filtered.filter((app) =>
          inApplicantScoreRange(
            getApplicantExitExam(app.applicant),
            filters.exitExamMin,
            filters.exitExamMax,
          ),
        );
      }
      
      setApplications(filtered);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, filters]);

  const clearFilters = () => {
    setFilters({
      status: "all",
      education: "",
      experience: "",
      location: "",
      cgpaMin: "",
      cgpaMax: "",
      exitExamMin: "",
      exitExamMax: "",
    });
    setShowFilters(false);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedApplications(applications.map(app => app.id));
    } else {
      setSelectedApplications([]);
    }
  };

  const handleSelectOne = (applicationId, checked) => {
    if (checked) {
      setSelectedApplications([...selectedApplications, applicationId]);
    } else {
      setSelectedApplications(selectedApplications.filter(id => id !== applicationId));
    }
  };

  const openReviewModal = (application) => {
    setSelectedApplication(application);
    setRecruiterNotes(application.recruiterNotes || "");
    setCandidateRating(application.rating || 0);
    setReviewModalOpen(true);
  };

  const handleSaveNotes = () => {
    setReviewModalOpen(false);
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedApplications.length === 0) return;
    if (!window.confirm(`Are you sure you want to update ${selectedApplications.length} application(s) to ${status}?`)) return;
    
    try {
      await Promise.all(
        selectedApplications.map((id) => updateApplicationStatus(id, status))
      );
      setSelectedApplications([]);
      fetchApplications();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleBulkExport = () => {
    alert("Bulk export feature will download all selected applications as CSV");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Reviewed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Applied":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="h-3 w-3" />;
      case "Rejected":
        return <XCircle className="h-3 w-3" />;
      case "Reviewed":
        return <Eye className="h-3 w-3" />;
      case "Applied":
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300 dark:text-slate-600"
            } ${
              interactive ? "cursor-pointer hover:text-amber-400" : ""
            }`}
            onClick={interactive ? () => setCandidateRating(star) : undefined}
          />
        ))}
      </div>
    );
  };

  // Pagination
  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const paginatedApplications = applications.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Stats
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "Applied").length,
    reviewed: applications.filter((a) => a.status === "Reviewed").length,
    accepted: applications.filter((a) => a.status === "Accepted").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
    avgRating: Math.round(applications.reduce((sum, a) => sum + (a.rating || 0), 0) / applications.length || 0)
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
      <div className={`
        fixed left-0 top-0 z-50 h-full w-72 transform transition-transform duration-300 ease-in-out bg-white dark:bg-slate-900 shadow-2xl
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">JobPortal</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 py-6">
            <nav className="space-y-1 px-4">
              <NavItem icon={Home} label="Dashboard" to="/admin" />
              <NavItem icon={Briefcase} label="Jobs" to="/admin/jobs" />
              <NavItem icon={Users} label="Applicants" to="/admin/applicants" />
              <NavItem icon={FileText} label="Applications" to="/admin/applications" active />
              <NavItem icon={PieChart} label="Analytics" to="/admin/analytics" />
              <NavItem icon={Settings} label="Settings" to="/admin/settings" />
            </nav>
          </div>
          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-all">
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
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
                  Applications Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Review, manage, and process all job applications in one place
                </p>
              </div>
              {selectedApplications.length > 0 && (
                <div className="flex gap-2">
                  <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30">
                    {selectedApplications.length} selected
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mb-8 grid grid-cols-2 lg:grid-cols-6 gap-4">
            <StatCard label="Total" value={stats.total} icon={FileText} color="indigo" />
            <StatCard label="Pending" value={stats.pending} icon={Clock} color="amber" />
            <StatCard label="Reviewed" value={stats.reviewed} icon={Eye} color="blue" />
            <StatCard label="Accepted" value={stats.accepted} icon={CheckCircle} color="emerald" />
            <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="red" />
          </div>

          {/* Search and Filters */}
          <Card className="mb-8 overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, email, or job title..."
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
                    {Object.values(filters).some((f) => f !== "") && (
                      <Badge variant="secondary" className="ml-2">Active</Badge>
                    )}
                  </Button>
                  {selectedApplications.length > 0 && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => handleBulkStatusUpdate("Reviewed")}
                        className="gap-2"
                      >
                        <Check className="h-4 w-4" /> Shortlist
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleBulkStatusUpdate("Rejected")}
                        className="gap-2 text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                      <Button variant="outline" onClick={handleBulkExport} className="gap-2">
                        <Download className="h-4 w-4" /> Export
                      </Button>
                    </>
                  )}
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Status</Label>
                      <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="Applied">Applied</SelectItem>
                          <SelectItem value="Reviewed">Reviewed</SelectItem>
                          <SelectItem value="Accepted">Accepted</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Education</Label>
                      <Select value={filters.education} onValueChange={(value) => setFilters({ ...filters, education: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="All levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bachelor">Bachelor's</SelectItem>
                          <SelectItem value="master">Master's</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                          <SelectItem value="high-school">High School</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Experience</Label>
                      <Select value={filters.experience} onValueChange={(value) => setFilters({ ...filters, experience: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="All levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry (0-2 years)</SelectItem>
                          <SelectItem value="mid">Mid (2-5 years)</SelectItem>
                          <SelectItem value="senior">Senior (5-10 years)</SelectItem>
                          <SelectItem value="lead">Lead (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Location</Label>
                      <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="on-site">On-site</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">CGPA range</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Min"
                          value={filters.cgpaMin}
                          onChange={(e) =>
                            setFilters({ ...filters, cgpaMin: e.target.value })
                          }
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Max"
                          value={filters.cgpaMax}
                          onChange={(e) =>
                            setFilters({ ...filters, cgpaMax: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Exit exam (100%) range
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          max={100}
                          placeholder="Min"
                          value={filters.exitExamMin}
                          onChange={(e) =>
                            setFilters({ ...filters, exitExamMin: e.target.value })
                          }
                        />
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          max={100}
                          placeholder="Max"
                          value={filters.exitExamMax}
                          onChange={(e) =>
                            setFilters({ ...filters, exitExamMax: e.target.value })
                          }
                        />
                      </div>
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

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Applications Content */}
          <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading applications...</p>
                  </div>
                </div>
              ) : viewMode === "table" ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedApplications.length === paginatedApplications.length && paginatedApplications.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="font-semibold">Applicant</TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">CGPA</TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">Exit exam</TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">Job Title</TableHead>
                        <TableHead className="font-semibold hidden md:table-cell">Experience</TableHead>
                        <TableHead className="font-semibold hidden xl:table-cell">Education</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold hidden sm:table-cell">Applied Date</TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">Rating</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedApplications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-12">
                            <div className="text-center">
                              <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                              <p className="text-slate-600 dark:text-slate-400">No applications found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedApplications.map((app) => (
                          <TableRow key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer" onClick={() => openReviewModal(app)}>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedApplications.includes(app.id)}
                                onCheckedChange={(checked) => handleSelectOne(app.id, checked)}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{app.applicant?.account?.name}</p>
                                <p className="text-xs text-slate-500 truncate max-w-[200px]">{app.applicant?.account?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-slate-600 dark:text-slate-300">
                              {formatApplicantMetric(getApplicantCGPA(app.applicant))}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-slate-600 dark:text-slate-300">
                              {formatApplicantMetric(getApplicantExitExam(app.applicant))}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div>
                                <p className="text-sm">{app.job?.title}</p>
                                <p className="text-xs text-slate-500">{app.job?.company}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="outline" className="text-xs">
                                {app.applicant?.yearsOfExperience != null
                                  ? `${app.applicant.yearsOfExperience} yrs`
                                  : "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              <Badge variant="outline" className="text-xs">
                                {Array.isArray(app.applicant?.education) &&
                                app.applicant.education.length > 0
                                  ? app.applicant.education
                                      .map((e) => e.highestEducation)
                                      .filter(Boolean)[0] || "N/A"
                                  : "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(app.status)} gap-1`}>
                                {getStatusIcon(app.status)}
                                {app.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-slate-500">
                              {new Date(app.appliedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {renderStars(app.rating || 0)}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" variant="ghost" onClick={() => openReviewModal(app)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {paginatedApplications.map((app) => (
                    <div 
                      key={app.id} 
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => openReviewModal(app)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{app.applicant?.account?.name}</h3>
                          <p className="text-xs text-slate-500">{app.applicant?.account?.email}</p>
                        </div>
                        <Badge className={getStatusColor(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Award className="h-3 w-3 text-slate-400" />
                          <span>
                            CGPA {formatApplicantMetric(getApplicantCGPA(app.applicant))} · Exit{" "}
                            {formatApplicantMetric(getApplicantExitExam(app.applicant))}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">{app.job?.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            Applied: {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-3 w-3 text-slate-400" />
                          {renderStars(app.rating || 0)}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openReviewModal(app); }} className="flex-1">
                          <Eye className="h-3 w-3 mr-1" /> Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {applications.length > 0 && (
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
                    Page {page} of {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    disabled={page >= totalPages} 
                    onClick={() => setPage((p) => p + 1)}
                    className="gap-2"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Modal */}
          {reviewModalOpen && selectedApplication && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
              <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex flex-row items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-indigo-500" />
                    Candidate Review
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setReviewModalOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Applicant Info */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
                        <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-500" />
                            <span className="font-medium">{selectedApplication.applicant?.account?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span>{selectedApplication.applicant?.account?.email}</span>
                          </div>
                          {selectedApplication.applicant?.city ||
                          selectedApplication.applicant?.region ? (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span>
                                {[
                                  selectedApplication.applicant.city,
                                  selectedApplication.applicant.region,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="text-lg font-semibold mb-3">Education & Experience</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-slate-400" />
                            <span>
                              CGPA:{" "}
                              {formatApplicantMetric(getApplicantCGPA(selectedApplication.applicant))} · Exit
                              exam (100%):{" "}
                              {formatApplicantMetric(
                                getApplicantExitExam(selectedApplication.applicant),
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-slate-400" />
                            <span>
                              {Array.isArray(selectedApplication.applicant?.education) &&
                              selectedApplication.applicant.education.length > 0
                                ? selectedApplication.applicant.education
                                    .map((e) =>
                                      [
                                        e.highestEducation,
                                        e.university,
                                        e.fieldOfStudy,
                                        e.graduationYear,
                                      ]
                                        .filter(Boolean)
                                        .join(" · "),
                                    )
                                    .filter(Boolean)
                                    .join("; ")
                                : "Not specified"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-slate-400" />
                            <span>
                              {selectedApplication.applicant?.yearsOfExperience != null
                                ? `${selectedApplication.applicant.yearsOfExperience} years experience`
                                : "Not specified"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="text-lg font-semibold mb-3">Applied Position</h3>
                        <div className="space-y-2">
                          <div className="font-medium text-indigo-600 dark:text-indigo-400">
                            {selectedApplication.job?.title}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {selectedApplication.job?.company}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Applied: {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="text-lg font-semibold mb-3">Application Status</h3>
                        <div className="space-y-3">
                          <Badge className={getStatusColor(selectedApplication.status)}>
                            {selectedApplication.status}
                          </Badge>
                          <div>
                            <Label className="text-sm font-medium">Candidate Rating</Label>
                            <div className="mt-1">
                              {renderStars(candidateRating, true)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Skills */}
                  {selectedApplication.applicant?.skills && selectedApplication.applicant.skills.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <h3 className="text-lg font-semibold mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.applicant.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Portfolio Links */}
                  {selectedApplication.applicant?.portfolioLinks && selectedApplication.applicant.portfolioLinks.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <h3 className="text-lg font-semibold mb-3">Portfolio Links</h3>
                      <div className="space-y-2">
                        {selectedApplication.applicant.portfolioLinks.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-indigo-600 hover:underline text-sm"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Resume */}
                  {selectedApplication.applicant?.resumeUrl && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <h3 className="text-lg font-semibold mb-3">Resume</h3>
                      <Button variant="outline" asChild>
                        <a href={selectedApplication.applicant.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" /> Download Resume
                        </a>
                      </Button>
                    </div>
                  )}
                  
                  {/* Recruiter Notes */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-semibold mb-3">Recruiter Notes</h3>
                    <Textarea
                      value={recruiterNotes}
                      onChange={(e) => setRecruiterNotes(e.target.value)}
                      placeholder="Add your notes about this candidate..."
                      className="min-h-32"
                    />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
                      Close
                    </Button>
                    <Button 
                      onClick={handleSaveNotes} 
                      disabled={savingNotes}
                      className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white"
                    >
                      {savingNotes ? "Saving..." : "Save Notes & Rating"}
                    </Button>
                  </div>
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

// Stat Card Component
function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    indigo: "from-indigo-500 to-indigo-600",
    amber: "from-amber-500 to-amber-600",
    blue: "from-blue-500 to-blue-600",
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    red: "from-red-500 to-red-600"
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-lg border border-slate-200 dark:border-slate-700">
      <div className={`rounded-xl bg-gradient-to-r ${colors[color]} p-2 w-8 h-8 flex items-center justify-center mb-3`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}