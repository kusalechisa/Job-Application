import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import JobList from "./pages/jobList";
import MainLayout from "./components/Mainlayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ApplicantDashboard from "./pages/ApplicantDashboard";
import AppliedJobList from "./pages/appliedJob";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/app-dashboard" element={<ApplicantDashboard />} />
            <Route path="/joblist" element={<JobList />} />
            <Route path="/appliedjobs" element={<AppliedJobList />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}