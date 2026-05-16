import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardData } from "../../../api/Endpoints/Applications.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatCard from "@/components/StatCard";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";
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
} from "recharts";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="p-6 text-slate-500">Loading dashboard...</p>;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <AdminNavbar />
        <main className="ml-64 mt-16 p-6">
          {error && <p className="mb-4 text-rose-600">{error}</p>}

          {/* Statistics Cards */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Total Jobs"
              value={dashboardData?.totalJobs ?? 0}
              icon={Briefcase}
            />
            <StatCard
              title="Total Applicants"
              value={dashboardData?.totalApplicants ?? 0}
              icon={Users}
            />
            <StatCard
              title="Applications Today"
              value={dashboardData?.applicationsToday ?? 0}
              icon={FileText}
              change={dashboardData?.applicationsTodayChange}
              trend={dashboardData?.applicationsTodayChange >= 0 ? "up" : "down"}
            />
            <StatCard
              title="Accepted Candidates"
              value={dashboardData?.acceptedCandidates ?? 0}
              icon={CheckCircle}
              change={dashboardData?.acceptedChange}
              trend={dashboardData?.acceptedChange >= 0 ? "up" : "down"}
            />
            <StatCard
              title="Rejected Candidates"
              value={dashboardData?.rejectedCandidates ?? 0}
              icon={XCircle}
              change={dashboardData?.rejectedChange}
              trend={dashboardData?.rejectedChange >= 0 ? "up" : "down"}
            />
          </div>

          {/* Charts Section */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Applications Per Month</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData?.applicationsPerMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Applications" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Job Posting Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.jobPostingTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" name="Jobs Posted" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Most Applied Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.mostAppliedJobs || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="title" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" name="Applications" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Hiring Success Rate</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-6xl font-bold text-sky-600">{dashboardData?.hiringRate ?? 0}%</p>
                  <p className="mt-2 text-slate-500">Overall hiring success rate</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Applications & Quick Actions */}
          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData?.recentApplications?.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.applicantName}</TableCell>
                        <TableCell>{app.jobTitle}</TableCell>
                        <TableCell>{app.company}</TableCell>
                        <TableCell><StatusBadge status={app.status} /></TableCell>
                        <TableCell>{new Date(app.appliedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Link to={`/admin/applications/${app.id}`} className="text-sm text-sky-600 hover:underline">
                            Review
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/admin/jobs" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-sky-400 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-sky-950">
                  <Plus className="h-5 w-5 text-sky-600" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">Create Job</span>
                </Link>
                <Link to="/admin/applications" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-sky-400 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-sky-950">
                  <FileText className="h-5 w-5 text-sky-600" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">View Applications</span>
                </Link>
                <Link to="/admin/analytics" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-sky-400 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-sky-950">
                  <Download className="h-5 w-5 text-sky-600" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">Export Reports</span>
                </Link>
                <Link to="/admin/users" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-sky-400 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-sky-950">
                  <Users className="h-5 w-5 text-sky-600" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">Manage Users</span>
                </Link>
                <Link to="/admin/analytics" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-sky-400 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-sky-950">
                  <TrendingUp className="h-5 w-5 text-sky-600" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">View Analytics</span>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950">
                    <FileText className="h-5 w-5 text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">New application received</p>
                    <p className="text-xs text-slate-500">John Doe applied for Senior Developer position</p>
                    <p className="mt-1 text-xs text-slate-400">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Candidate accepted</p>
                    <p className="text-xs text-slate-500">Jane Smith was accepted for Frontend Developer role</p>
                    <p className="mt-1 text-xs text-slate-400">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">New job posted</p>
                    <p className="text-xs text-slate-500">Product Manager position was posted</p>
                    <p className="mt-1 text-xs text-slate-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Interview scheduled</p>
                    <p className="text-xs text-slate-500">Interview with Mike Johnson scheduled for tomorrow</p>
                    <p className="mt-1 text-xs text-slate-400">3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}



