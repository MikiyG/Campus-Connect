// src/components/ProtectedRoute.jsx
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly) {
    const role = user.role || user?.isAdmin ? user.role : null;
    const isAdmin = user.role === 'university_admin' || user.role === 'super_admin' || !!user.isAdmin;
    if (!isAdmin) return <Navigate to="/dashboard" replace />;
  }

  return children;
}