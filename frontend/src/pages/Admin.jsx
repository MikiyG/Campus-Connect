// src/pages/Admin.jsx
import ProtectedRoute from "../components/ProtectedRoute";
import AdminDashboard from "./AdminDashboard";

export default function Admin() {
  return (
    <ProtectedRoute adminOnly>
      <AdminDashboard />
    </ProtectedRoute>
  );
}