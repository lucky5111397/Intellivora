import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * ProtectedRoute: UX and navigation guard for authenticated service routes.
 *
 * Guards account-dependent services (/interview, /aptitude, /resume, /gd, /history, /report/:id).
 * Respects auth hydration: displays a loader while auth state is resolving on initial load or refresh,
 * preventing accidental bounces of authenticated users to /auth.
 * If unauthenticated, safely redirects to /auth while preserving the intended destination in state.
 */
function ProtectedRoute({ children }) {
  const { userData, authLoading } = useSelector((state) => state.user);
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
