import { useAuthStore } from "@/context/authContext";
import { Navigate } from "react-router-dom";
import Loader from "../Loader/loader";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <Loader />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role === "cliente") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
