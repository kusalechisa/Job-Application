import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, token } = useAuth();
  if (!user && !token) return <Navigate to="/" />;
  if (role && user && user.role !== role) return <Navigate to="/" />;

  return children;
}