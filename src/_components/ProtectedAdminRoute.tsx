import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../context/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/401" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
