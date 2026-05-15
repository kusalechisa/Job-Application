import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "@/lib/constants";

export default function ProtectedRoute({ children, role }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!user && !token) return <Navigate to="/login" replace />;

  if (role && user?.role !== role) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return children;
}





