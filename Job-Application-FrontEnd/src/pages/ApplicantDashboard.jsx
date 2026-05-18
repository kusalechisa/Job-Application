import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  Bookmark,
  Calendar,
  User,
  Bell,
  TrendingUp,
  TrendingDown,
  MapPin,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import {
  getJobs,
  getMyApplications,
  getApplicantProfile,
  applyForJob,
} from "../../api/Endpoints/Jobs.jsx";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

export default function ApplicantDashboard() {
  const [stats, setStats] = useState({
    jobsApplied: 0,
    savedJobs: 0,
    interviewsScheduled: 0,
    profileCompletion: 0,
  });
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const { user, token } = useAuth();

  const motivationalTips = [
    "Complete your profile to increase visibility to recruiters",
    "Apply to jobs that match your skills and experience",
    "Follow up on your applications after 3-5 business days",
    "Keep your resume updated with recent achievements",
    "Network with professionals in your industry",
  ];

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Fetch saved jobs from localStorage
        const savedJobsFromStorage = localStorage.getItem("savedJobs");
        const savedJobsCount = savedJobsFromStorage
          ? JSON.parse(savedJobsFromStorage).length
          : 0;
        setStats((prev) => ({ ...prev, savedJobs: savedJobsCount }));

        // Fetch user's applications
        if (token) {
          try {
            const appsRes = await getMyApplications();
            const applications = appsRes.data.data || [];
            setRecentApplications(applications.slice(0, 5));
            setStats((prev) => ({
              ...prev,
              jobsApplied: applications.length,
              interviewsScheduled: applications.filter(
                (app) => app.status === "Accepted",
              ).length,
            }));
          } catch (appsError) {
            console.log("No applications found");
          }

          // Fetch profile data for completion percentage
          try {
            const profileRes = await getApplicantProfile();
            const profile = profileRes.data.data;
            setProfileData(profile);

            // Calculate profile completion
            const requiredFields = [
              profile.firstName || profile.fullName,
              profile.lastName,
              profile.email,
              profile.phone,
              profile.address,
              profile.profession,
              profile.yearsOfExperience,
              profile.skills,
              profile.education && profile.education.length > 0,
            ];
            const filledCount = requiredFields.filter(
              (field) =>
                field && (typeof field !== "object" || field.length > 0),
            ).length;
            const completion = Math.round(
              (filledCount / requiredFields.length) * 100,
            );

            setStats((prev) => ({ ...prev, profileCompletion: completion }));
          } catch (profileError) {
            console.log("No profile found");
          }
        }

        // Fetch recommended jobs (mock for now, can be enhanced with AI)
        const jobsRes = await getJobs({ page: 1, limit: 6 });
        const jobs = jobsRes.data.data || [];
        setRecommendedJobs(jobs.slice(0, 4));
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [token]);

  const handleApply = async (jobId) => {
    try {
      await applyForJob(jobId);
      // Refresh applications
      const appsRes = await getMyApplications();
      setRecentApplications(appsRes.data.data.slice(0, 5));
      setStats((prev) => ({ ...prev, jobsApplied: prev.jobsApplied + 1 }));
    } catch (error) {
      console.error("Error applying for job:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const randomTip =
    motivationalTips[Math.floor(Math.random() * motivationalTips.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/80 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {getGreeting()},{" "}
                {user?.firstName || user?.name?.split(" ")[0] || "Applicant"} 👋
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {stats.profileCompletion < 100
                  ? `Complete your profile to increase hiring chances (${stats.profileCompletion}%)`
                  : "Your profile is complete! You're ready to land your dream job."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-full"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  3
                </span>
              </Button>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0] || user?.name?.[0] || "U"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Motivational Tip */}
        <Card className="bg-gradient-to-r from-sky-500 to-indigo-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Tip for success</p>
                <p className="text-sm text-white/90 mt-1">{randomTip}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200/60 dark:border-slate-800/60 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Jobs Applied
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.jobsApplied}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+12%</span>
                    <span className="text-xs text-slate-500">this month</span>
                  </div>
                </div>
                <div className="rounded-xl p-3 bg-sky-50 dark:bg-sky-950">
                  <Briefcase className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 dark:border-slate-800/60 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Saved Jobs
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.savedJobs}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-slate-500">
                    <span className="text-sm">
                      Bookmark jobs to review later
                    </span>
                  </div>
                </div>
                <div className="rounded-xl p-3 bg-amber-50 dark:bg-amber-950">
                  <Bookmark className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 dark:border-slate-800/60 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Interviews
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.interviewsScheduled}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+2</span>
                    <span className="text-xs text-slate-500">scheduled</span>
                  </div>
                </div>
                <div className="rounded-xl p-3 bg-emerald-50 dark:bg-emerald-950">
                  <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 dark:border-slate-800/60 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Profile
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.profileCompletion}%
                  </p>
                  <Progress
                    value={stats.profileCompletion}
                    className="mt-2 h-2"
                  />
                </div>
                <div className="rounded-xl p-3 bg-indigo-50 dark:bg-indigo-950">
                  <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recommended Jobs */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Recommended Jobs</CardTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      AI-curated based on your profile
                    </p>
                  </div>
                </div>
                <Link
                  to="/joblist"
                  className="text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 font-medium flex items-center gap-1"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="border-slate-200/60 dark:border-slate-800/60 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-5">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                              {job.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {job.company}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{job.salary || "Competitive"}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-sky-600 hover:bg-sky-700"
                              onClick={() => handleApply(job.id)}
                            >
                              Apply Now
                            </Button>
                            <Button size="sm" variant="outline">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Recent Applications
                    </CardTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Track your job applications
                    </p>
                  </div>
                </div>
                <Link
                  to="/appliedjobs"
                  className="text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 font-medium flex items-center gap-1"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                          Job Title
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                          Applied Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                          Latest Update
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.length > 0 ? (
                        recentApplications.map((app) => (
                          <tr
                            key={app.id}
                            className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                          >
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                  {app.job?.title || "Unknown"}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {app.job?.company || "Unknown"}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={app.status} />
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                              {new Date(app.updatedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="py-8 text-center text-slate-500 dark:text-slate-400"
                          >
                            No applications yet. Start applying to jobs!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/joblist" className="block w-full">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                  >
                    <Briefcase className="h-4 w-4" />
                    Browse Jobs
                  </Button>
                </Link>
                <Link to="/appliedjobs" className="block w-full">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                  >
                    <Clock className="h-4 w-4" />
                    My Applications
                  </Button>
                </Link>
                <Link to="/profile" className="block w-full">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                  >
                    <User className="h-4 w-4" />
                    Update Profile
                  </Button>
                </Link>
                <Link to="/settings" className="block w-full">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                  >
                    <Sparkles className="h-4 w-4" />
                    Account Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Application Timeline */}
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader>
                <CardTitle className="text-lg">Application Timeline</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Track your progress
                </p>
              </CardHeader>
              <CardContent>
                {recentApplications.length > 0 ? (
                  <div className="space-y-4">
                    {recentApplications.slice(0, 3).map((app, index) => (
                      <div
                        key={app.id}
                        className="relative pl-6 pb-4 border-l-2 border-slate-200 dark:border-slate-800 last:pb-0"
                      >
                        <div
                          className={`absolute left-0 top-0 w-3 h-3 rounded-full border-2 bg-white dark:bg-slate-900 ${
                            app.status === "Accepted"
                              ? "border-emerald-500"
                              : app.status === "Reviewed"
                                ? "border-amber-500"
                                : app.status === "Rejected"
                                  ? "border-rose-500"
                                  : "border-sky-500"
                          }`}
                          style={{ transform: "translateX(-50%)" }}
                        />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                            {app.job?.title || "Unknown"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={app.status} />
                            <span className="text-xs text-slate-500">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
                    No applications to show
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardHeader>
                <CardTitle className="text-lg">Profile Completion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.profileCompletion}%
                  </div>
                  <Progress
                    value={stats.profileCompletion}
                    className="mt-3 h-2"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {profileData?.firstName &&
                    profileData?.lastName &&
                    profileData?.email &&
                    profileData?.phone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-500" />
                    )}
                    <span className="text-slate-600 dark:text-slate-400">
                      Basic Information
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {profileData?.address ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-500" />
                    )}
                    <span className="text-slate-600 dark:text-slate-400">
                      Address
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {profileData?.profession &&
                    profileData?.yearsOfExperience ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-500" />
                    )}
                    <span className="text-slate-600 dark:text-slate-400">
                      Professional Info
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {profileData?.skills ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-500" />
                    )}
                    <span className="text-slate-600 dark:text-slate-400">
                      Skills
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {profileData?.education &&
                    profileData.education.length > 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-500" />
                    )}
                    <span className="text-slate-600 dark:text-slate-400">
                      Education
                    </span>
                  </div>
                </div>
                {stats.profileCompletion < 100 && (
                  <Link to="/profile" className="block">
                    <Button
                      size="sm"
                      className="w-full bg-sky-600 hover:bg-sky-700"
                    >
                      Complete Profile
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
