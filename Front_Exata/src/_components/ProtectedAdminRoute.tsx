import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../context/authStore";
import useUserTypeStore from "@/context/UserStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuthStore();
  const { typeUser } = useUserTypeStore();

  if (!user || typeUser === "cliente") {
    return <Navigate to="/401" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
