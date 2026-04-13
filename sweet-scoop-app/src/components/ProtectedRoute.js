import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  // If no user is logged in, redirect to login page
  if (!userId || !username) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, render the component
  return children;
}

export default ProtectedRoute;
