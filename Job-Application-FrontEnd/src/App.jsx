import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/ApplicantDashboard";
import JobList from "./pages/jobList";
import MainLayout from "./components/Mainlayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ApplicantDashboard from "./pages/ApplicantDashboard";
import AppliedJobList from "./pages/appliedJob";
// import { Navigate } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Layout wrapper */}
        <Route element={<MainLayout />}>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/admin" element={<ProtectedRoute role="ADMIN"><Admin /></ProtectedRoute>} /> */}
          <Route path="/appliedjobs" element={<AppliedJobList />} />
          <Route path="/app-dashboard" element={<ApplicantDashboard />} />
          <Route path="/joblist" element={<JobList/>}/>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}