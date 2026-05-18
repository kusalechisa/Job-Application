import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardData } from "../../../api/Endpoints/Applications.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
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
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import {
  Briefcase,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  Plus,
  Download,
  Settings,
  Calendar,
  Clock,
  Activity,
  Award,
  Filter,
  Search,
  MoreVertical,
  Eye,
  UserPlus,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Shield,
  Bell,
  Menu,
  X,
  Home,
  PieChart,
  Mail,
  LogOut,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316"];

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboardData();
        setDashboardData(res.data.data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Loading dashboard...
          </p>
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
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
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
              <NavItem icon={Home} label="Dashboard" to="/admin" active />
              <NavItem icon={Briefcase} label="Jobs" to="/admin/jobs" />
              <NavItem icon={Users} label="Applicants" to="/admin/users" />
              <NavItem
                icon={FileText}
                label="Applications"
                to="/admin/applications"
              />
              <NavItem icon={PieChart} label="Analytics" to="/admin/stats" />
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
          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome back, Admin! 👋
                </h1>
                <p className="text-white/90">
                  Here's what's happening with your job portal today.
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-3">
                <button className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all backdrop-blur-sm flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </button>
                <button className="px-4 py-2 bg-white rounded-xl text-purple-600 hover:shadow-lg transition-all flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards - Responsive Grid */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            <EnhancedStatCard
              title="Total Jobs"
              value={dashboardData?.totalJobs ?? 0}
              icon={Briefcase}
              trend="+12%"
              color="indigo"
            />
            <EnhancedStatCard
              title="Total Applicants"
              value={dashboardData?.totalApplicants ?? 0}
              icon={Users}
              trend="+23%"
              color="purple"
            />
            <EnhancedStatCard
              title="Applications Today"
              value={dashboardData?.applicationsToday ?? 0}
              icon={FileText}
              trend={
                dashboardData?.applicationsTodayChange >= 0 ? "up" : "down"
              }
              change={dashboardData?.applicationsTodayChange}
              color="emerald"
            />
            <EnhancedStatCard
              title="Accepted"
              value={dashboardData?.acceptedCandidates ?? 0}
              icon={CheckCircle}
              trend={dashboardData?.acceptedChange >= 0 ? "up" : "down"}
              change={dashboardData?.acceptedChange}
              color="teal"
            />
            <EnhancedStatCard
              title="Rejected"
              value={dashboardData?.rejectedCandidates ?? 0}
              icon={XCircle}
              trend={dashboardData?.rejectedChange >= 0 ? "up" : "down"}
              change={dashboardData?.rejectedChange}
              color="orange"
            />
          </div>

          {/* Charts Section - Fully Responsive */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications Trend */}
            <Card className="group overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                    Applications Trend
                  </CardTitle>
                  <select className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1">
                    <option>Last 6 Months</option>
                    <option>Last Year</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={dashboardData?.applicationsPerMonth || []}>
                    <defs>
                      <linearGradient
                        id="colorCount"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      strokeOpacity={0.5}
                    />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#6366f1"
                      fillOpacity={1}
                      fill="url(#colorCount)"
                      name="Applications"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Job Posting Trends */}
            <Card className="group overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Briefcase className="h-5 w-5 text-purple-500" />
                  Job Postings by Month
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={dashboardData?.jobPostingTrends || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      strokeOpacity={0.5}
                    />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#8b5cf6"
                      radius={[8, 8, 0, 0]}
                      name="Jobs Posted"
                    >
                      {dashboardData?.jobPostingTrends?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Second Row of Charts */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Most Applied Jobs */}
            <Card className="lg:col-span-2 overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Award className="h-5 w-5 text-emerald-500" />
                  Most Popular Jobs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {dashboardData?.mostAppliedJobs
                    ?.slice(0, 5)
                    .map((job, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold shadow-md">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {job.title}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {job.company || "Various Companies"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {job.count}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            applications
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Hiring Rate Card */}
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="inline-flex rounded-full bg-white/20 p-4 mb-4">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <p className="text-6xl font-bold mb-2">
                    {dashboardData?.hiringRate ?? 0}%
                  </p>
                  <p className="text-white/90 mb-4">
                    Overall Hiring Success Rate
                  </p>
                  <div className="flex justify-center gap-4 pt-4 border-t border-white/20">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        +{Math.floor(Math.random() * 20) + 5}%
                      </p>
                      <p className="text-xs text-white/80">vs last month</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        #{Math.floor(Math.random() * 10) + 1}
                      </p>
                      <p className="text-xs text-white/80">industry rank</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Applications & Quick Actions */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Applications Table */}
            <Card className="lg:col-span-2 overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    Recent Applications
                  </CardTitle>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                      <Search className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                      <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                          Applicant
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                          Job
                        </TableHead>
                        <TableHead className="font-semibold hidden md:table-cell text-slate-700 dark:text-slate-300">
                          Company
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                          Status
                        </TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell text-slate-700 dark:text-slate-300">
                          Applied
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData?.recentApplications?.map((app) => (
                        <TableRow
                          key={app.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                        >
                          <TableCell className="font-medium text-slate-900 dark:text-white">
                            {app.applicantName}
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-300">
                            {app.jobTitle}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-600 dark:text-slate-300">
                            {app.company}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={app.status} />
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-slate-500 dark:text-slate-400">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Link
                              to={`/admin/applications/${app.id}`}
                              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
                            >
                              Review
                              <Eye className="h-3 w-3" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Link
                  to="/admin/jobs"
                  className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-4 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-500 p-2 text-white group-hover:scale-110 transition-transform">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Create New Job
                    </span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
                </Link>

                <Link
                  to="/admin/applications"
                  className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-500 p-2 text-white group-hover:scale-110 transition-transform">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Review Applications
                    </span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-purple-500" />
                </Link>

                <Link
                  to="/admin/stats"
                  className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-500 p-2 text-white group-hover:scale-110 transition-transform">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      View Analytics
                    </span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500" />
                </Link>

                <Link
                  to="/admin/users"
                  className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-4 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-500 p-2 text-white group-hover:scale-110 transition-transform">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Manage Users
                    </span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-orange-500" />
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed & Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Feed */}
            <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Activity className="h-5 w-5 text-indigo-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <ActivityItem
                    icon={FileText}
                    color="indigo"
                    title="New application received"
                    description="John Doe applied for Senior Developer"
                    time="5 minutes ago"
                  />
                  <ActivityItem
                    icon={CheckCircle}
                    color="emerald"
                    title="Candidate accepted"
                    description="Jane Smith was accepted for Frontend Developer"
                    time="1 hour ago"
                  />
                  <ActivityItem
                    icon={Briefcase}
                    color="purple"
                    title="New job posted"
                    description="Product Manager position was posted"
                    time="2 hours ago"
                  />
                  <ActivityItem
                    icon={Calendar}
                    color="amber"
                    title="Interview scheduled"
                    description="Interview with Mike Johnson scheduled"
                    time="3 hours ago"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Platform Insights */}
            <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Platform Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <InsightCard
                    value="85%"
                    label="Response Rate"
                    color="indigo"
                  />
                  <InsightCard
                    value="24h"
                    label="Avg. Response Time"
                    color="blue"
                  />
                  <InsightCard
                    value="156"
                    label="Active Jobs"
                    color="emerald"
                  />
                  <InsightCard value="42" label="Companies" color="orange" />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

// Enhanced Stat Card Component
function EnhancedStatCard({ title, value, icon: Icon, trend, change, color }) {
  const isUp = trend === "up" || (change && change >= 0);
  const trendPercentage = change
    ? Math.abs(change)
    : trend === "+12%"
      ? 12
      : trend === "+23%"
        ? 23
        : 5;
  const trendIcon = isUp ? (
    <TrendingUp className="h-3 w-3" />
  ) : (
    <TrendingDown className="h-3 w-3" />
  );

  const colorConfigs = {
    indigo: "from-indigo-500 to-indigo-600",
    purple: "from-purple-500 to-purple-600",
    emerald: "from-emerald-500 to-emerald-600",
    teal: "from-teal-500 to-teal-600",
    orange: "from-orange-500 to-orange-600",
    blue: "from-blue-500 to-blue-600",
  };

  const bgColors = {
    indigo: "bg-indigo-50 dark:bg-indigo-950/30",
    purple: "bg-purple-50 dark:bg-purple-950/30",
    emerald: "bg-emerald-50 dark:bg-emerald-950/30",
    teal: "bg-teal-50 dark:bg-teal-950/30",
    orange: "bg-orange-50 dark:bg-orange-950/30",
    blue: "bg-blue-50 dark:bg-blue-950/30",
  };

  const gradient = colorConfigs[color] || colorConfigs.indigo;
  const bgColor = bgColors[color] || bgColors.indigo;

  return (
    <div
      className={`rounded-2xl ${bgColor} border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`rounded-xl bg-gradient-to-r ${gradient} p-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isUp
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
              : "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
          }`}
        >
          {trendIcon}
          <span>{trendPercentage}%</span>
          <span className="hidden sm:inline">
            {isUp ? "increase" : "decrease"}
          </span>
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
        {value}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
        {title}
      </p>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ icon: Icon, color, title, description, time }) {
  const colorClasses = {
    indigo:
      "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
    emerald:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    purple:
      "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
    amber:
      "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  };

  const bgColor = colorClasses[color] || colorClasses.indigo;

  return (
    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${bgColor} group-hover:scale-110 transition-transform`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
          {description}
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {time}
        </p>
      </div>
      <MoreVertical className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

// Insight Card Component
function InsightCard({ value, label, color }) {
  const gradients = {
    indigo:
      "from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-950/50",
    blue: "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-950/50",
    emerald:
      "from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-950/50",
    orange:
      "from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-950/50",
  };

  const textColors = {
    indigo: "text-indigo-600 dark:text-indigo-400",
    blue: "text-blue-600 dark:text-blue-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    orange: "text-orange-600 dark:text-orange-400",
  };

  const gradient = gradients[color] || gradients.indigo;
  const textColor = textColors[color] || textColors.indigo;

  return (
    <div
      className={`text-center p-4 rounded-xl bg-gradient-to-br ${gradient} border border-slate-200/50 dark:border-slate-800/50`}
    >
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{label}</p>
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

// Missing imports
import { TrendingDown } from "lucide-react";
