import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  FileText,
  X,
  Video,
  MessageSquare,
  CheckCircle,
  Building2,
  MapPin,
  AlertCircle,
  Eye,
  Download,
  Briefcase,
  Menu,
  Home,
  User,
  Search,
  Heart,
  Settings,
  LogOut,
  TrendingUp,
  Award,
  RefreshCw,
  Users,
  Mail,
  Phone,
  ThumbsUp,
  ThumbsDown,
  Code,
  Globe,
  Link2,
} from "lucide-react";
import { getMyApplications } from "../../api/Endpoints/Jobs.jsx";
import {
  withdrawApplication,
  updateApplication,
} from "../../api/Endpoints/Applications.jsx";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "@/lib/apiError";
import StatusBadge from "@/components/StatusBadge";
import { showPopup } from "@/components/FloatingPopup";

export default function AppliedJobList() {
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const itemsPerPage = 5;
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await getMyApplications();
      setApplications(res.data.data || []);
    } catch (err) {
      showPopup(
        getApiErrorMessage(err, "Unable to load your applications."),
        "error",
      );
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
    try {
      await updateApplication(applicationId, { resume });
      showPopup("Application updated successfully!", "success");
      loadApplications();
    } catch (err) {
      showPopup(
        getApiErrorMessage(err, "Unable to update application."),
        "error",
      );
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (
      !window.confirm(
        "Are you sure you want to withdraw this application? This action cannot be undone.",
      )
    )
      return;
    try {
      await withdrawApplication(applicationId);
      showPopup("Application withdrawn successfully.", "success");
      loadApplications();
    } catch (err) {
      showPopup(getApiErrorMessage(err, "Unable to withdraw."), "error");
    }
  };

  const handleViewTimeline = (application) => {
    setSelectedApplication(application);
    setTimelineOpen(true);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getApplicationTimeline = (application) => {
    const timeline = [
      {
        status: "Application Submitted",
        date: application.appliedAt || application.createdAt,
        completed: true,
        description: "Your application has been successfully submitted",
        icon: FileText,
      },
    ];

    if (
      application.status === "Reviewed" ||
      application.status === "Interview" ||
      application.status === "Accepted" ||
      application.status === "Rejected"
    ) {
      timeline.push({
        status: "Application Reviewed",
        date: application.updatedAt,
        completed: true,
        description: "Hiring team has reviewed your application",
        icon: Eye,
      });
    }

    if (application.status === "Interview") {
      timeline.push({
        status: "Interview Scheduled",
        date: application.updatedAt,
        completed: true,
        description: "Interview has been scheduled with the hiring team",
        icon: Video,
      });
    }

    if (application.status === "Accepted") {
      timeline.push({
        status: "Offer Extended",
        date: application.updatedAt,
        completed: true,
        description: "Congratulations! You've received a job offer",
        icon: Award,
      });
    }

    if (application.status === "Rejected") {
      timeline.push({
        status: "Application Not Selected",
        date: application.updatedAt,
        completed: true,
        description: "Application was not selected for this position",
        icon: ThumbsDown,
      });
    }

    return timeline;
  };

  const filteredApplications =
    statusFilter === "all"
      ? applications
      : applications.filter(
          (app) => app.status?.toLowerCase() === statusFilter.toLowerCase(),
        );

  const paginatedData = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / itemsPerPage),
  );

  // Statistics
  const stats = {
    total: applications.length,
    accepted: applications.filter((a) => a.status === "Accepted").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
    applied: applications.filter((a) => a.status === "Applied").length,
    reviewed: applications.filter((a) => a.status === "Reviewed").length,
    interview: applications.filter((a) => a.status === "Interview").length,
    reviewRate:
      applications.length > 0
        ? Math.round(
            (applications.filter((a) => a.status !== "Applied").length /
              applications.length) *
              100,
          )
        : 0,
  };

  const sidebarLinks = [
    { icon: Home, label: "Dashboard", href: "/applicant" },
    { icon: Search, label: "Find Jobs", href: "/joblist" },
    {
      icon: Briefcase,
      label: "My Applications",
      href: "/applicant/applications",
      active: true,
    },
    { icon: Heart, label: "Saved Jobs", href: "/saved-jobs" },
    { icon: User, label: "My Profile", href: "/applicant/profile" },
    { icon: Settings, label: "Settings", href: "/applicant/settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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
                    Applicant Panel
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
              {sidebarLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    link.active
                      ? "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 dark:from-indigo-950/50 dark:to-blue-950/50 dark:text-indigo-400"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {user?.name || "Guest"}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-all">
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {/* Header with Mobile Menu Button */}
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/80 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  My Applications
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 hidden sm:block">
                  Track and manage all your job applications in one place
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadApplications}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          {/* Stats Overview */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-6 gap-4">
            <StatCard
              label="Total Applications"
              value={stats.total}
              icon={Briefcase}
              color="indigo"
            />
            <StatCard
              label="Applied"
              value={stats.applied}
              icon={Clock}
              color="amber"
            />
            <StatCard
              label="In Review"
              value={stats.reviewed}
              icon={Eye}
              color="purple"
            />
            <StatCard
              label="Interview"
              value={stats.interview}
              icon={Video}
              color="blue"
            />
            <StatCard
              label="Accepted"
              value={stats.accepted}
              icon={CheckCircle}
              color="emerald"
            />
            <StatCard
              label="Review Rate"
              value={`${stats.reviewRate}%`}
              icon={TrendingUp}
              color="blue"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="mb-6">
            <Tabs
              defaultValue="all"
              className="w-full"
              onValueChange={setStatusFilter}
            >
              <TabsList className="grid w-full grid-cols-6 bg-slate-100 dark:bg-slate-800">
                <TabsTrigger value="all" className="gap-2">
                  All
                  <Badge variant="secondary" className="ml-1">
                    {stats.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="applied" className="gap-2">
                  Applied
                  <Badge variant="secondary" className="ml-1">
                    {stats.applied}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="reviewed" className="gap-2">
                  In Review
                  <Badge variant="secondary" className="ml-1">
                    {stats.reviewed}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="interview" className="gap-2">
                  Interview
                  <Badge variant="secondary" className="ml-1">
                    {stats.interview}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="accepted" className="gap-2">
                  Accepted
                  <Badge variant="secondary" className="ml-1">
                    {stats.accepted}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="gap-2">
                  Rejected
                  <Badge variant="secondary" className="ml-1">
                    {stats.rejected}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* View Mode Toggle */}
          <div className="mb-4 flex justify-end">
            <div className="flex gap-2 border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 text-sm transition-colors ${
                  viewMode === "table"
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                    : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-2 text-sm transition-colors ${
                  viewMode === "cards"
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                    : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                }`}
              >
                Card View
              </button>
            </div>
          </div>

          {/* Applications Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
                <p className="text-slate-600 dark:text-slate-400">
                  Loading applications...
                </p>
              </div>
            </div>
          ) : paginatedData.length === 0 ? (
            <Card className="border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
              <CardContent className="p-12 text-center">
                <Briefcase className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No applications found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  You haven't applied for any jobs yet.
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-indigo-500 to-blue-600"
                >
                  <Link to="/joblist">Browse Jobs</Link>
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === "table" ? (
            <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead className="font-semibold">
                          Job Details
                        </TableHead>
                        <TableHead className="font-semibold hidden md:table-cell">
                          Company
                        </TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">
                          Applied Date
                        </TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((item) => (
                        <TableRow
                          key={item.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                          onClick={() => handleViewTimeline(item)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {item.job?.title || "-"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Building2 className="h-3 w-3 text-slate-400" />
                                <p className="text-sm text-slate-600 dark:text-slate-400 md:hidden">
                                  {item.job?.company || "-"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 mt-1 lg:hidden">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                <p className="text-xs text-slate-500">
                                  {new Date(
                                    item.appliedAt || item.createdAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-700 dark:text-slate-300">
                                {item.job?.company || "-"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-slate-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(
                                item.appliedAt || item.createdAt,
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewTimeline(item)}
                                className="gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                              {item.status === "Applied" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateResume(item.id)}
                                  className="gap-1"
                                >
                                  <Download className="h-3 w-3" />
                                  <span className="hidden sm:inline">
                                    Update
                                  </span>
                                </Button>
                              )}
                              {item.status !== "Accepted" &&
                                item.status !== "Rejected" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleWithdraw(item.id)}
                                    className="text-rose-600 hover:text-rose-700 gap-1"
                                  >
                                    <X className="h-3 w-3" />
                                    <span className="hidden sm:inline">
                                      Withdraw
                                    </span>
                                  </Button>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="gap-2 w-full sm:w-auto"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Page {currentPage} of {totalPages} ·{" "}
                    {filteredApplications.length} applications
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="gap-2 w-full sm:w-auto"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedData.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleViewTimeline(item)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                          {item.job?.title || "-"}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Building2 className="h-4 w-4" />
                          <span>{item.job?.company || "-"}</span>
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="h-4 w-4" />
                        <span>{item.job?.location || "Remote"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Applied:{" "}
                          {new Date(
                            item.appliedAt || item.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {item.updatedAt && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>
                            Updated:{" "}
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewTimeline(item)}
                        className="flex-1 gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Timeline
                      </Button>
                      {item.status === "Applied" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateResume(item.id)}
                          className="flex-1 gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Update
                        </Button>
                      )}
                      {item.status !== "Accepted" &&
                        item.status !== "Rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleWithdraw(item.id)}
                            className="text-rose-600 gap-1"
                          >
                            <X className="h-3 w-3" />
                            Withdraw
                          </Button>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination for Card View */}
          {viewMode === "cards" && paginatedData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="gap-2 w-full sm:w-auto"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages} ·{" "}
                {filteredApplications.length} applications
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="gap-2 w-full sm:w-auto"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Tips Card */}
          <Card className="mt-6 overflow-hidden border-0 bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Award className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold text-lg">Application Tips</h3>
                    <p className="text-white/90 text-sm mt-1">
                      Keep your profile updated to increase your chances of
                      getting hired. Companies prefer candidates with complete
                      profiles and relevant skills.
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  variant="secondary"
                  className="bg-white text-indigo-600 hover:bg-slate-100"
                >
                  <Link to="/profile">Update Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline Sheet - Fully Responsive */}
      <Sheet open={timelineOpen} onOpenChange={setTimelineOpen}>
        <SheetContent className="w-full sm:max-w-2xl max-h-screen overflow-y-auto p-0">
          <SheetHeader className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4">
            <SheetTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              Application Timeline
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTimelineOpen(false)}
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetHeader>

          {selectedApplication && (
            <div className="space-y-6 p-4 sm:p-6">
              {/* Job Info Card - Responsive */}
              <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-0">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-100 line-clamp-2">
                    {selectedApplication.job?.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">
                        {selectedApplication.job?.company}
                      </span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">
                        {selectedApplication.job?.location || "Remote"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <StatusBadge status={selectedApplication.status} />
                  </div>
                </CardContent>
              </Card>

              {/* Progress Timeline - Responsive Vertical Timeline */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm sm:text-base">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
                  Application Progress
                </h4>

                <div className="relative">
                  {getApplicationTimeline(selectedApplication).map(
                    (step, index) => {
                      const IconComponent = step.icon;
                      const isLast =
                        index ===
                        getApplicationTimeline(selectedApplication).length - 1;
                      return (
                        <div key={index} className="relative mb-6 sm:mb-8">
                          {/* Timeline Line */}
                          {!isLast && (
                            <div
                              className={`absolute left-5 top-10 w-0.5 h-full ${
                                step.completed
                                  ? "bg-gradient-to-b from-indigo-500 to-blue-600"
                                  : "bg-slate-200 dark:bg-slate-700"
                              }`}
                              style={{ height: "calc(100% - 20px)" }}
                            />
                          )}

                          {/* Timeline Node */}
                          <div className="flex gap-3 sm:gap-4">
                            <div className="flex-shrink-0">
                              <div
                                className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center z-10 ${
                                  step.completed
                                    ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                                }`}
                              >
                                <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                              </div>
                            </div>

                            <div className="flex-1 pt-1 pb-4 sm:pb-6">
                              <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                                {step.status}
                              </div>
                              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {step.description}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-500 mt-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {step.date &&
                                      new Date(step.date).toLocaleDateString()}
                                  </span>
                                </div>
                                {step.date && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {new Date(step.date).toLocaleTimeString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Interview Details (if applicable) - Responsive */}
              {selectedApplication.status === "Interview" && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm sm:text-base">
                    <Video className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    Interview Details
                  </h4>
                  <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
                    <CardContent className="p-4 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                              Scheduled Date
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                              {selectedApplication.updatedAt
                                ? new Date(
                                    selectedApplication.updatedAt,
                                  ).toLocaleString()
                                : "To be scheduled"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <Video className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                              Meeting Link
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                              Will be shared via email
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg">
                        <p className="font-medium text-slate-900 dark:text-slate-100 mb-2 text-sm sm:text-base">
                          Preparation Tips:
                        </p>
                        <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-1 sm:space-y-2 list-disc list-inside">
                          <li>Research the company and role thoroughly</li>
                          <li>
                            Prepare examples of your past work and achievements
                          </li>
                          <li>
                            Have your resume and portfolio ready for reference
                          </li>
                          <li>Test your camera and microphone beforehand</li>
                          <li>Join the meeting 5 minutes early</li>
                        </ul>
                      </div>

                      <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400">
                            Make sure to check your email regularly for the
                            meeting link and any additional instructions from
                            the recruiter.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Offer Details (if applicable) - Responsive */}
              {selectedApplication.status === "Accepted" && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm sm:text-base">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                    Offer Details
                  </h4>
                  <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
                    <CardContent className="p-6 sm:p-8">
                      <div className="text-center">
                        <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-full mb-4">
                          <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-500" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                          Congratulations! 🎉
                        </h3>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                          You've received a job offer! The hiring team will
                          contact you shortly with the next steps.
                        </p>
                        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg">
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            <strong className="text-slate-900 dark:text-white">
                              Next Steps:
                            </strong>{" "}
                            Review the offer details, complete any required
                            paperwork, and prepare for onboarding.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Rejection Details (if applicable) - Responsive */}
              {selectedApplication.status === "Rejected" && (
                <div className="space-y-4">
                  <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3">
                        <ThumbsDown className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                            Application Update
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            While this application wasn't selected, don't get
                            discouraged! Keep applying to other opportunities
                            that match your skills.
                          </p>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="mt-3"
                          >
                            <Link to="/joblist">Browse More Jobs</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Action Buttons - Responsive */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  onClick={() => setTimelineOpen(false)}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Close
                </Button>
                {selectedApplication.status === "Applied" && (
                  <Button
                    onClick={() => handleUpdateResume(selectedApplication.id)}
                    className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-indigo-500 to-blue-600"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Update Resume
                  </Button>
                )}
                {selectedApplication.status !== "Accepted" &&
                  selectedApplication.status !== "Rejected" && (
                    <Button
                      variant="destructive"
                      onClick={() => handleWithdraw(selectedApplication.id)}
                      className="w-full sm:w-auto order-3"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Withdraw Application
                    </Button>
                  )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    indigo: "from-indigo-500 to-indigo-600",
    amber: "from-amber-500 to-amber-600",
    purple: "from-purple-500 to-purple-600",
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-lg border border-slate-200 dark:border-slate-700">
      <div
        className={`rounded-xl bg-gradient-to-r ${colors[color]} p-2 w-8 h-8 flex items-center justify-center mb-3`}
      >
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}
