import React from "react";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
  const isAuthenticated = localStorage.getItem("adminLoggedIn") === "true";

  // If NOT logged in, redirect them to the login page immediately
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, let them proceed to the requested page component
  return <Outlet />;
}