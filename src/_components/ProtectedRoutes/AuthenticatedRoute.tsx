import { useAuthStore } from "@/context/authContext";
import Loader from "@/_components/Loader/loader";
import RegisterModal from "../Checkout/register-modal";
import { useState } from "react";

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({
  children,
}) => {
  const { user, loading } = useAuthStore();
  const [showRegister, setShowRegister] = useState(true);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <>
        <RegisterModal
          open={showRegister && !user}
          setIsOpen={setShowRegister}
        />
        {children}
      </>
    );
  }

  return <>{children}</>;
};

export default AuthenticatedRoute;
