import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  Link2
} from "lucide-react";
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
      setSuccess("Application updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      loadApplications();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update application."));
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) return;
    setError("");
    setSuccess("");
    try {
      await withdrawApplication(applicationId);
      setSuccess("Application withdrawn successfully.");
      setTimeout(() => setSuccess(""), 3000);
      loadApplications();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to withdraw."));
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleViewTimeline = (application) => {
    setSelectedApplication(application);
    setTimelineOpen(true);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
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
        icon: FileText
      }
    ];

    if (application.status === "reviewed" || application.status === "interview" || application.status === "accepted" || application.status === "rejected") {
      timeline.push({
        status: "Application Reviewed",
        date: application.updatedAt,
        completed: true,
        description: "Hiring team has reviewed your application",
        icon: Eye
      });
    }

    if (application.status === "interview") {
      timeline.push({
        status: "Interview Scheduled",
        date: application.updatedAt,
        completed: true,
        description: "Interview has been scheduled with the hiring team",
        icon: Video
      });
    }

    if (application.status === "accepted") {
      timeline.push({
        status: "Offer Extended",
        date: application.updatedAt,
        completed: true,
        description: "Congratulations! You've received a job offer",
        icon: Award
      });
    }

    if (application.status === "rejected") {
      timeline.push({
        status: "Application Not Selected",
        date: application.updatedAt,
        completed: true,
        description: "Application was not selected for this position",
        icon: ThumbsDown
      });
    }

    return timeline;
  };

  const filteredApplications = statusFilter === "all" 
    ? applications 
    : applications.filter(app => app.status?.toLowerCase() === statusFilter.toLowerCase());

  const paginatedData = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / itemsPerPage));

  // Statistics
  const stats = {
    total: applications.length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    pending: applications.filter(a => a.status === 'applied' || a.status === 'reviewed').length,
    interview: applications.filter(a => a.status === 'interview').length,
    reviewRate: applications.length > 0 
      ? Math.round(((applications.filter(a => a.status !== 'applied').length) / applications.length) * 100)
      : 0
  };

  const sidebarLinks = [
    { icon: Home, label: "Dashboard", href: "/applicant" },
    { icon: Search, label: "Find Jobs", href: "/applicant/jobs" },
    { icon: Briefcase, label: "My Applications", href: "/applicant/applications", active: true },
    { icon: Heart, label: "Saved Jobs", href: "/applicant/saved-jobs" },
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
      <div className={`
        fixed left-0 top-0 z-50 h-full w-72 transform transition-transform duration-300 ease-in-out bg-white dark:bg-slate-900 shadow-2xl
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">JobPortal</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Applicant Panel</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
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
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 dark:from-indigo-950/50 dark:to-purple-950/50 dark:text-indigo-400"
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
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || "Guest"}</p>
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
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">My Applications</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 hidden sm:block">
                  Track and manage all your job applications in one place
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={loadApplications} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          {/* Stats Overview */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard 
              label="Total Applications" 
              value={stats.total} 
              icon={Briefcase}
              color="indigo"
            />
            <StatCard 
              label="In Review" 
              value={stats.pending} 
              icon={Clock}
              color="amber"
            />
            <StatCard 
              label="Interview" 
              value={stats.interview} 
              icon={Video}
              color="purple"
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
            <Tabs defaultValue="all" className="w-full" onValueChange={setStatusFilter}>
              <TabsList className="grid w-full grid-cols-5 bg-slate-100 dark:bg-slate-800">
                <TabsTrigger value="all" className="gap-2">
                  All
                  <Badge variant="secondary" className="ml-1">{stats.total}</Badge>
                </TabsTrigger>
                <TabsTrigger value="applied" className="gap-2">
                  Pending
                  <Badge variant="secondary" className="ml-1">{stats.pending}</Badge>
                </TabsTrigger>
                <TabsTrigger value="interview" className="gap-2">
                  Interview
                  <Badge variant="secondary" className="ml-1">{stats.interview}</Badge>
                </TabsTrigger>
                <TabsTrigger value="accepted" className="gap-2">
                  Accepted
                  <Badge variant="secondary" className="ml-1">{stats.accepted}</Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="gap-2">
                  Rejected
                  <Badge variant="secondary" className="ml-1">{stats.rejected}</Badge>
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

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          )}

          {/* Applications Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
                <p className="text-slate-600 dark:text-slate-400">Loading applications...</p>
              </div>
            </div>
          ) : paginatedData.length === 0 ? (
            <Card className="border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
              <CardContent className="p-12 text-center">
                <Briefcase className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No applications found</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">You haven't applied for any jobs yet.</p>
                <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-600">
                  <Link to="/applicant/jobs">Browse Jobs</Link>
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
                        <TableHead className="font-semibold">Job Details</TableHead>
                        <TableHead className="font-semibold hidden md:table-cell">Company</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">Applied Date</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer" onClick={() => handleViewTimeline(item)}>
                          <TableCell>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{item.job?.title || "-"}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Building2 className="h-3 w-3 text-slate-400" />
                                <p className="text-sm text-slate-600 dark:text-slate-400 md:hidden">{item.job?.company || "-"}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-1 lg:hidden">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                <p className="text-xs text-slate-500">
                                  {new Date(item.appliedAt || item.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-700 dark:text-slate-300">{item.job?.company || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-slate-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(item.appliedAt || item.createdAt).toLocaleDateString()}
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
                              {item.status === "applied" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateResume(item.id)}
                                  className="gap-1"
                                >
                                  <Download className="h-3 w-3" />
                                  <span className="hidden sm:inline">Update</span>
                                </Button>
                              )}
                              {item.status !== "accepted" && item.status !== "rejected" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleWithdraw(item.id)}
                                  className="text-rose-600 hover:text-rose-700 gap-1"
                                >
                                  <X className="h-3 w-3" />
                                  <span className="hidden sm:inline">Withdraw</span>
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
                    Page {currentPage} of {totalPages} · {filteredApplications.length} applications
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
                <Card key={item.id} className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={() => handleViewTimeline(item)}>
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
                        <span>Applied: {new Date(item.appliedAt || item.createdAt).toLocaleDateString()}</span>
                      </div>
                      {item.updatedAt && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={() => handleViewTimeline(item)} className="flex-1 gap-1">
                        <Eye className="h-3 w-3" />
                        Timeline
                      </Button>
                      {item.status === "applied" && (
                        <Button size="sm" variant="outline" onClick={() => handleUpdateResume(item.id)} className="flex-1 gap-1">
                          <Download className="h-3 w-3" />
                          Update
                        </Button>
                      )}
                      {item.status !== "accepted" && item.status !== "rejected" && (
                        <Button size="sm" variant="outline" onClick={() => handleWithdraw(item.id)} className="text-rose-600 gap-1">
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
                Page {currentPage} of {totalPages} · {filteredApplications.length} applications
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
          <Card className="mt-6 overflow-hidden border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Award className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold text-lg">Application Tips</h3>
                    <p className="text-white/90 text-sm mt-1">
                      Keep your profile updated to increase your chances of getting hired. 
                      Companies prefer candidates with complete profiles and relevant skills.
                    </p>
                  </div>
                </div>
                <Button asChild variant="secondary" className="bg-white text-indigo-600 hover:bg-slate-100">
                  <Link to="/applicant/profile">Update Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline Sheet */}
      <Sheet open={timelineOpen} onOpenChange={setTimelineOpen}>
        <SheetContent className="w-full sm:max-w-2xl max-h-screen overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">Application Timeline</SheetTitle>
          </SheetHeader>
          {selectedApplication && (
            <div className="space-y-6 mt-6">
              {/* Job Info Card */}
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-0">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">{selectedApplication.job?.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{selectedApplication.job?.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedApplication.job?.location}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <StatusBadge status={selectedApplication.status} />
                  </div>
                </CardContent>
              </Card>

              {/* Progress Timeline */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-500" />
                  Application Progress
                </h4>
                <div className="space-y-0">
                  {getApplicationTimeline(selectedApplication).map((step, index) => {
                    const IconComponent = step.icon;
                    const isLast = index === getApplicationTimeline(selectedApplication).length - 1;
                    return (
                      <div key={index} className="relative">
                        <div className="flex gap-4 pb-8">
                          <div className="flex flex-col items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center z-10 ${
                              step.completed 
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                            }`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            {!isLast && (
                              <div className={`w-0.5 h-full mt-2 ${
                                step.completed ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 pt-1">
                            <div className="font-semibold text-slate-900 dark:text-slate-100">{step.status}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{step.description}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-500 mt-2 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {step.date && new Date(step.date).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interview Details (if applicable) */}
              {selectedApplication.status === "interview" && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Video className="h-5 w-5 text-purple-500" />
                    Interview Details
                  </h4>
                  <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-5 w-5 text-slate-500" />
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-300">Scheduled Date</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            {selectedApplication.updatedAt ? new Date(selectedApplication.updatedAt).toLocaleString() : "To be scheduled"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Video className="h-5 w-5 text-slate-500" />
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-300">Meeting Link</p>
                          <p className="text-slate-600 dark:text-slate-400">Will be shared via email</p>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg">
                        <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">Preparation Tips:</p>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                          <li>Research the company and role thoroughly</li>
                          <li>Prepare examples of your past work and achievements</li>
                          <li>Have your resume and portfolio ready for reference</li>
                          <li>Test your camera and microphone beforehand</li>
                          <li>Join the meeting 5 minutes early</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Offer Details (if applicable) */}
              {selectedApplication.status === "accepted" && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-500" />
                    Offer Details
                  </h4>
                  <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Congratulations!</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          You've received a job offer! The hiring team will contact you shortly with the next steps.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
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
    emerald: "from-emerald-500 to-emerald-600",
    blue: "from-blue-500 to-blue-600"
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