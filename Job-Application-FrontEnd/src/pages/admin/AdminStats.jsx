import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApplicationStats } from "../../../api/Endpoints/Stats.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  Award,
  Zap,
  Eye,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  Target,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import AdminNavbar from "@/components/AdminNavbar";

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#10b981', '#06b6d4', '#a855f7'];

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeframe, setTimeframe] = useState("year");
  const [chartType, setChartType] = useState("pie");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getApplicationStats();
        setStats(res.data.data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatStatusCounts = () => {
    if (!stats?.statusCounts) return [];
    return Object.entries(stats.statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      status: status
    }));
  };

  const calculateTotalApplications = () => {
    if (!stats?.statusCounts) return 0;
    return Object.values(stats.statusCounts).reduce((sum, count) => sum + count, 0);
  };

  const calculateAveragePerJob = () => {
    if (!stats?.applicationsByJob || stats.applicationsByJob.length === 0) return 0;
    const total = stats.applicationsByJob.reduce((sum, job) => sum + (job._count?.applications || 0), 0);
    return Math.round(total / stats.applicationsByJob.length);
  };

  const getSuccessRate = () => {
    if (!stats?.statusCounts) return 0;
    const accepted = stats.statusCounts.accepted || 0;
    const total = calculateTotalApplications();
    return total > 0 ? Math.round((accepted / total) * 100) : 0;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'interview': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'reviewed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'applied': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'accepted': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      case 'interview': return <Users className="h-3 w-3" />;
      case 'reviewed': return <Eye className="h-3 w-3" />;
      case 'applied': return <FileText className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Loading statistics...</p>
        </div>
      </div>
    );
  }

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
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
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
              <NavItem icon={Users} label="Users" to="/admin/users" />
              <NavItem icon={FileText} label="Applications" to="/admin/applications" />
              <NavItem icon={BarChart3} label="Analytics" to="/admin/stats" active />
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
        <AdminNavbar onMenuClick={() => setMobileMenuOpen(true)} />
        
        <main className="p-4 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Analytics Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Comprehensive overview of application statistics and performance metrics
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Key Metrics Cards */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <MetricCard
              title="Total Applications"
              value={calculateTotalApplications()}
              icon={FileText}
              trend="+23%"
              color="indigo"
            />
            <MetricCard
              title="Active Jobs"
              value={stats?.applicationsByJob?.length || 0}
              icon={Briefcase}
              trend="+12%"
              color="blue"
            />
            <MetricCard
              title="Success Rate"
              value={`${getSuccessRate()}%`}
              icon={Target}
              trend="+5%"
              color="emerald"
            />
            <MetricCard
              title="Avg. per Job"
              value={calculateAveragePerJob()}
              icon={Users}
              trend="+8%"
              color="purple"
            />
          </div>

          {/* Applications by Status - Charts */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution Chart */}
            <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-indigo-500" />
                    Applications by Status
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant={chartType === "pie" ? "default" : "outline"}
                      onClick={() => setChartType("pie")}
                      className="h-8"
                    >
                      Pie
                    </Button>
                    <Button 
                      size="sm" 
                      variant={chartType === "bar" ? "default" : "outline"}
                      onClick={() => setChartType("bar")}
                      className="h-8"
                    >
                      Bar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {chartType === "pie" ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <RePieChart>
                      <Pie
                        data={formatStatusCounts()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {formatStatusCounts().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={formatStatusCounts()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]}>
                        {formatStatusCounts().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Status Breakdown List */}
            <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  Status Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {stats?.statusCounts && Object.entries(stats.statusCounts).map(([status, count]) => {
                    const total = calculateTotalApplications();
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(status)} gap-1`}>
                              {getStatusIcon(status)}
                              {status}
                            </Badge>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {count} applications
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {percentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: COLORS[Object.keys(stats.statusCounts).indexOf(status) % COLORS.length]
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                    <ThumbsUp className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-emerald-600">{stats?.statusCounts?.accepted || 0}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Accepted</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-950/30">
                    <ThumbsDown className="h-5 w-5 text-red-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">{stats?.statusCounts?.rejected || 0}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Rejected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications per Job Table */}
          <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
                  Applications per Job
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Filter className="h-3 w-3" />
                    Filter
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="h-3 w-3" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-semibold">Job Title</TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">Company</TableHead>
                      <TableHead className="font-semibold hidden lg:table-cell">Location</TableHead>
                      <TableHead className="font-semibold">Applications</TableHead>
                      <TableHead className="font-semibold hidden sm:table-cell">Status</TableHead>
                      <TableHead className="font-semibold">Popularity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!stats?.applicationsByJob || stats.applicationsByJob.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="text-center">
                            <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-600 dark:text-slate-400">No job data available</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.applicationsByJob
                        .sort((a, b) => (b._count?.applications || 0) - (a._count?.applications || 0))
                        .map((job, index) => {
                          const maxApplications = Math.max(...stats.applicationsByJob.map(j => j._count?.applications || 0));
                          const percentage = maxApplications > 0 ? ((job._count?.applications || 0) / maxApplications) * 100 : 0;
                          return (
                            <TableRow key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                              <TableCell className="font-medium">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{job.title}</p>
                                  <p className="text-xs text-slate-500 md:hidden">{job.company}</p>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">{job.company}</TableCell>
                              <TableCell className="hidden lg:table-cell text-slate-500">{job.location || "N/A"}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-indigo-500" />
                                  <span className="font-bold text-lg">{job._count?.applications || 0}</span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <Badge className={job.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}>
                                  {job.status || "active"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    {Math.round(percentage)}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Additional Insights */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InsightCard
              title="Most Popular Job"
              value={stats?.applicationsByJob?.sort((a, b) => (b._count?.applications || 0) - (a._count?.applications || 0))[0]?.title || "N/A"}
              subtitle={`${stats?.applicationsByJob?.sort((a, b) => (b._count?.applications || 0) - (a._count?.applications || 0))[0]?._count?.applications || 0} applications`}
              icon={Award}
              color="amber"
            />
            <InsightCard
              title="Highest Rated Job"
              value={stats?.applicationsByJob?.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.title || "N/A"}
              subtitle={`Rating: ${stats?.applicationsByJob?.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.rating || 0}/5`}
              icon={Zap}
              color="yellow"
            />
            <InsightCard
              title="Conversion Rate"
              value={`${getSuccessRate()}%`}
              subtitle="Applications to hired"
              icon={TrendingUp}
              color="green"
            />
            <InsightCard
              title="Active Period"
              value="30 days"
              subtitle="Average job posting duration"
              icon={Calendar}
              color="blue"
            />
          </div>
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
          ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 dark:from-indigo-950/50 dark:to-purple-950/50 dark:text-indigo-400"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

// Metric Card Component
function MetricCard({ title, value, icon: Icon, trend, color }) {
  const colors = {
    indigo: "from-indigo-500 to-indigo-600",
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600"
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-xl bg-gradient-to-r ${colors[color]} p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          {trend}
        </Badge>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{title}</p>
    </div>
  );
}

// Insight Card Component
function InsightCard({ title, value, subtitle, icon: Icon, color }) {
  const colors = {
    amber: "from-amber-500 to-amber-600",
    yellow: "from-yellow-500 to-yellow-600",
    green: "from-green-500 to-green-600",
    blue: "from-blue-500 to-blue-600"
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-3">
        <div className={`rounded-lg bg-gradient-to-r ${colors[color]} p-2`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
      </div>
      <p className="text-xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}