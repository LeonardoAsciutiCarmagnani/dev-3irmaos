import { useAuthStore } from "@/context/authContext";
import { Navigate } from "react-router-dom";
import Loader from "@/_components/Loader/loader";

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({
  children,
}) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthenticatedRoute;
