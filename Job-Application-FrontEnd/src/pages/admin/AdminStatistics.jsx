import { useEffect, useState } from "react";
import { getAdvancedAnalytics } from "../../../api/Endpoints/Applications.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  AreaChart,
  Area,
} from "recharts";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";
import { Download, FileText, Table, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import Papa from "papaparse";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function AdminStatistics() {
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Statistics Report", 14, 20);
    doc.setFontSize(12);
    
    let yPosition = 30;
    
    // Summary
    doc.text(`Total Applications: ${analytics?.totalApplications ?? 0}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Total Jobs: ${analytics?.totalJobs ?? 0}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Total Applicants: ${analytics?.totalApplicants ?? 0}`, 14, yPosition);
    yPosition += 10;
    doc.text(`Hiring Rate: ${analytics?.hiringRate ?? 0}%`, 14, yPosition);
    yPosition += 10;
    doc.text(`Rejection Rate: ${analytics?.rejectionRate ?? 0}%`, 14, yPosition);
    yPosition += 10;
    doc.text(`Active Jobs: ${analytics?.activeJobs ?? 0}`, 14, yPosition);
    yPosition += 20;

    // Most Applied Jobs
    doc.setFontSize(14);
    doc.text("Most Applied Jobs", 14, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    analytics?.mostAppliedJobs?.slice(0, 5).forEach((job) => {
      doc.text(`${job.title} - ${job.count} applications`, 14, yPosition);
      yPosition += 8;
    });
    yPosition += 10;

    // Top Skills
    doc.setFontSize(14);
    doc.text("Top Skills", 14, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    analytics?.topSkills?.slice(0, 10).forEach((skill) => {
      doc.text(`${skill.skill} - ${skill.count} applicants`, 14, yPosition);
      yPosition += 8;
    });

    doc.save("statistics-report.pdf");
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ["Metric", "Value"],
      ["Total Applications", analytics?.totalApplications ?? 0],
      ["Total Jobs", analytics?.totalJobs ?? 0],
      ["Total Applicants", analytics?.totalApplicants ?? 0],
      ["Hiring Rate", `${analytics?.hiringRate ?? 0}%`],
      ["Rejection Rate", `${analytics?.rejectionRate ?? 0}%`],
      ["Active Jobs", analytics?.activeJobs ?? 0],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    // Applications Per Month Sheet
    const applicationsMonthData = [
      ["Month", "Applications"],
      ...(analytics?.applicationsPerMonth || []).map((item) => [item.month, item.count]),
    ];
    const applicationsMonthSheet = XLSX.utils.aoa_to_sheet(applicationsMonthData);
    XLSX.utils.book_append_sheet(wb, applicationsMonthSheet, "Applications/Month");

    // Hires Per Month Sheet
    const hiresMonthData = [
      ["Month", "Hires"],
      ...(analytics?.hiresPerMonth || []).map((item) => [item.month, item.count]),
    ];
    const hiresMonthSheet = XLSX.utils.aoa_to_sheet(hiresMonthData);
    XLSX.utils.book_append_sheet(wb, hiresMonthSheet, "Hires/Month");

    // Most Applied Jobs Sheet
    const jobsData = [
      ["Job Title", "Company", "Applications"],
      ...(analytics?.mostAppliedJobs || []).map((job) => [job.title, job.company, job.count]),
    ];
    const jobsSheet = XLSX.utils.aoa_to_sheet(jobsData);
    XLSX.utils.book_append_sheet(wb, jobsSheet, "Most Applied Jobs");

    // Top Skills Sheet
    const skillsData = [
      ["Skill", "Count"],
      ...(analytics?.topSkills || []).map((skill) => [skill.skill, skill.count]),
    ];
    const skillsSheet = XLSX.utils.aoa_to_sheet(skillsData);
    XLSX.utils.book_append_sheet(wb, skillsSheet, "Top Skills");

    // Education Levels Sheet
    const educationData = [
      ["Education Level", "Count"],
      ...(analytics?.educationLevels || []).map((edu) => [edu.education, edu.count]),
    ];
    const educationSheet = XLSX.utils.aoa_to_sheet(educationData);
    XLSX.utils.book_append_sheet(wb, educationSheet, "Education Levels");

    // Applicant Locations Sheet
    const locationsData = [
      ["Location", "Count"],
      ...(analytics?.applicantLocations || []).map((loc) => [loc.location, loc.count]),
    ];
    const locationsSheet = XLSX.utils.aoa_to_sheet(locationsData);
    XLSX.utils.book_append_sheet(wb, locationsSheet, "Applicant Locations");

    XLSX.writeFile(wb, "statistics-report.xlsx");
  };

  const exportToCSV = () => {
    const csvData = [
      {
        category: "Summary",
        metric: "Total Applications",
        value: analytics?.totalApplications ?? 0,
      },
      {
        category: "Summary",
        metric: "Total Jobs",
        value: analytics?.totalJobs ?? 0,
      },
      {
        category: "Summary",
        metric: "Total Applicants",
        value: analytics?.totalApplicants ?? 0,
      },
      {
        category: "Summary",
        metric: "Hiring Rate",
        value: `${analytics?.hiringRate ?? 0}%`,
      },
      {
        category: "Summary",
        metric: "Rejection Rate",
        value: `${analytics?.rejectionRate ?? 0}%`,
      },
      {
        category: "Summary",
        metric: "Active Jobs",
        value: analytics?.activeJobs ?? 0,
      },
      ...(analytics?.mostAppliedJobs || []).map((job) => ({
        category: "Most Applied Jobs",
        metric: job.title,
        value: job.count,
      })),
      ...(analytics?.topSkills || []).map((skill) => ({
        category: "Top Skills",
        metric: skill.skill,
        value: skill.count,
      })),
    ];

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "statistics-report.csv";
    link.click();
  };

  const generateAIInsights = () => {
    if (!analytics) return [];

    const insights = [];

    // Hiring Analytics Insights
    if (analytics.hiringRate > 20) {
      insights.push({
        type: "success",
        title: "Strong Hiring Performance",
        message: `Your hiring rate of ${analytics.hiringRate}% indicates effective recruitment processes.`,
      });
    } else if (analytics.hiringRate < 10) {
      insights.push({
        type: "warning",
        title: "Low Hiring Rate",
        message: `Consider reviewing your screening criteria. Current hiring rate is ${analytics.hiringRate}%.`,
      });
    }

    if (analytics.rejectionRate > 50) {
      insights.push({
        type: "warning",
        title: "High Rejection Rate",
        message: `Your rejection rate of ${analytics.rejectionRate}% may indicate job requirements are too strict.`,
      });
    }

    // Job Analytics Insights
    if (analytics.mostAppliedJobs?.length > 0) {
      const topJob = analytics.mostAppliedJobs[0];
      insights.push({
        type: "info",
        title: "Most Popular Role",
        message: `"${topJob.title}" is the most applied position with ${topJob.count} applications.`,
      });
    }

    if (analytics.activeJobs < analytics.totalJobs * 0.3) {
      insights.push({
        type: "warning",
        title: "Low Active Jobs",
        message: `Only ${analytics.activeJobs} out of ${analytics.totalJobs} jobs are active. Consider posting new opportunities.`,
      });
    }

    // Applicant Analytics Insights
    if (analytics.topSkills?.length > 0) {
      const topSkills = analytics.topSkills.slice(0, 3).map((s) => s.skill).join(", ");
      insights.push({
        type: "info",
        title: "Top Technical Skills",
        message: `The most common skills among applicants are: ${topSkills}.`,
      });
    }

    if (analytics.educationLevels?.length > 0) {
      const topEducation = analytics.educationLevels[0];
      insights.push({
        type: "info",
        title: "Education Trend",
        message: `Most applicants have "${topEducation.education}" as their highest education level.`,
      });
    }

    if (analytics.applicantLocations?.length > 0) {
      const topLocation = analytics.applicantLocations[0];
      insights.push({
        type: "info",
        title: "Top Location",
        message: `Most applicants are from "${topLocation.location}".`,
      });
    }

    // Application Trend Insights
    const recentMonths = analytics.applicationsPerMonth?.slice(-3) || [];
    const olderMonths = analytics.applicationsPerMonth?.slice(-6, -3) || [];
    const recentAvg = recentMonths.reduce((sum, m) => sum + m.count, 0) / (recentMonths.length || 1);
    const olderAvg = olderMonths.reduce((sum, m) => sum + m.count, 0) / (olderMonths.length || 1);

    if (recentAvg > olderAvg * 1.2) {
      insights.push({
        type: "success",
        title: "Growing Application Volume",
        message: "Application volume has increased significantly in recent months.",
      });
    } else if (recentAvg < olderAvg * 0.8) {
      insights.push({
        type: "warning",
        title: "Declining Application Volume",
        message: "Application volume has decreased recently. Consider reviewing job postings.",
      });
    }

    return insights;
  };

  if (loading) return <p className="p-6 text-slate-500">Loading statistics...</p>;

  if (error) return <p className="p-6 text-rose-600">{error}</p>;

  const aiInsights = generateAIInsights();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <AdminNavbar />
        <main className="ml-64 mt-16 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Statistics Dashboard</h1>
            <div className="flex gap-2">
              <Button onClick={exportToPDF} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={exportToExcel} variant="outline" size="sm">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Table className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>

          {/* AI Insights Section */}
          <Card className="mb-6 rounded-[1.5rem] border border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">🤖</span> AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {aiInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      insight.type === "success"
                        ? "bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                        : insight.type === "warning"
                        ? "bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                        : "bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                    }`}
                  >
                    <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{insight.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-6">
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
          <div className="grid gap-6 md:grid-cols-3 mb-6">
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
            <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wider text-slate-500">Active Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold text-blue-600">{analytics?.activeJobs ?? 0}</p>
                <p className="text-sm text-slate-500 mt-2">Jobs posted in last 30 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Hiring Analytics Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Hiring Analytics</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle>Applications Per Month (Last 12 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics?.applicationsPerMonth || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Applications" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle>Hires Per Month (Last 12 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics?.hiresPerMonth || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="count" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Hires" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Job Analytics Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Job Analytics</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle>Most Popular Jobs (Top 10)</CardTitle>
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

              <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
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
            </div>
          </div>

          {/* Applicant Analytics Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Applicant Analytics</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle>Education Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={analytics?.educationLevels || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ education, percent }) => `${education}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="education"
                      >
                        {analytics?.educationLevels?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle>Top Skills (Top 15)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analytics?.topSkills || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="skill" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#f59e0b" name="Applicants" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Applicant Locations (Top 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics?.applicantLocations || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#ec4899" name="Applicants" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution */}
          <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
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
