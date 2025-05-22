import { useAuthStore } from "@/context/authContext";
import { Navigate } from "react-router-dom";
import Loader from "../Loader/loader";
import { toast } from "sonner";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <Loader />;
  }
  if (!user) {
    toast.error("Você precisa estar logado para acessar essa página", {
      duration: 3000,
      id: "unauthenticated",
    });
    return <Navigate to="/" replace />;
  }
  if (user && user?.role !== "admin") {
    return <Navigate to="/401" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
