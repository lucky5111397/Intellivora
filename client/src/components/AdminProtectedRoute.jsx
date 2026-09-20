import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

/**
 * AdminProtectedRoute: UX and navigation guard for administrative routes.
 *
 * Checks authenticated user against VITE_ADMIN_EMAIL.
 * Non-admin users are silently redirected to / (Home) with no error banner,
 * ensuring non-admin users do not even know admin routes exist.
 */
function AdminProtectedRoute({ children }) {
  const { userData, authLoading } = useSelector((state) => state.user);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#06080B] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin" />
      </div>
    );
  }

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = userData?.email?.trim().toLowerCase();

  const isAuthorizedAdmin = Boolean(adminEmail && userEmail && userEmail === adminEmail);

  if (!isAuthorizedAdmin) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}

export default AdminProtectedRoute;

