import { useAuthStore } from "@/context/authContext";
import Loader from "@/_components/Loader/loader";
import RegisterModal from "../Checkout/register-modal";

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({
  children,
}) => {
  const { user, loading } = useAuthStore();

  if (loading) return <Loader />;

  return (
    <>
      <RegisterModal open={!user} />
      {children}
    </>
  );
};

export default AuthenticatedRoute;
