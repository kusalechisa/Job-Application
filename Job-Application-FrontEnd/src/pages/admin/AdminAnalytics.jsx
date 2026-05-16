import { useEffect, useState } from "react";
import { getAdvancedAnalytics } from "../../../api/Endpoints/Applications.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdvancedAnalytics();
        setAnalytics(res.data.data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="p-6 text-slate-500">Loading analytics...</p>;

  if (error) return <p className="p-6 text-rose-600">{error}</p>;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <AdminNavbar />
        <main className="ml-64 mt-16 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Analytics Dashboard</h1>
          </div>

          {/* Summary Cards */}
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-slate-500">Total Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold">{analytics?.totalApplications ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-slate-500">Total Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold">{analytics?.totalJobs ?? 0}</p>
              </CardContent>
            </Card>
            <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-slate-500">Total Applicants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold">{analytics?.totalApplicants ?? 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Rate Cards */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-slate-500">Hiring Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold text-emerald-600">{analytics?.hiringRate ?? 0}%</p>
                <p className="text-sm text-slate-500 mt-2">Percentage of accepted applications</p>
              </CardContent>
            </Card>
            <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-slate-500">Rejection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold text-rose-600">{analytics?.rejectionRate ?? 0}%</p>
                <p className="text-sm text-slate-500 mt-2">Percentage of rejected applications</p>
              </CardContent>
            </Card>
          </div>

          {/* Applications Per Month - Line Chart */}
          <Card className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Applications Per Month (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.applicationsPerMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Applications" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Applicant Growth - Line Chart */}
          <Card className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Applicant Growth (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.applicantGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} name="New Applicants" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Most Applied Jobs - Bar Chart */}
          <Card className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Most Applied Jobs (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics?.mostAppliedJobs || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="title" type="category" width={200} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Locations - Bar Chart */}
          <Card className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Top Job Locations (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics?.topLocations || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8b5cf6" name="Jobs" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution - Pie Chart */}
          <Card className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Application Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={analytics?.statusDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics?.statusDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
