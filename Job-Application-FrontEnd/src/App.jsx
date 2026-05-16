import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import JobList from "./pages/jobList";
import JobDetail from "./pages/jobDetail";
import MainLayout from "./components/Mainlayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ApplicantDashboard from "./pages/ApplicantDashboard";
import AppliedJobList from "./pages/appliedJob";
import ApplicantProfile from "./pages/applicantProfile";
import SavedJobs from "./pages/savedJobs";
import AccountSettings from "./pages/accountSettings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminJobApplications from "./pages/admin/AdminJobApplications";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminApplicationDetail from "./pages/admin/AdminApplicationDetail";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStats from "./pages/admin/AdminStats";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            element={
              <ProtectedRoute role="Applicant">
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/app-dashboard" element={<ApplicantDashboard />} />
            <Route path="/profile" element={<ApplicantProfile />} />
            <Route path="/joblist" element={<JobList />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/appliedjobs" element={<AppliedJobList />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
          </Route>

          <Route
            element={
              <ProtectedRoute role="Admin">
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
            <Route path="/admin/jobs/:jobId/applications" element={<AdminJobApplications />} />
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/admin/applications/:applicationId" element={<AdminApplicationDetail />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/stats" element={<AdminStats />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/settings" element={<AccountSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

