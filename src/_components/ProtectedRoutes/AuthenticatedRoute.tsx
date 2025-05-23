import { useAuthStore } from "@/context/authContext";
import Loader from "../Loader/loader";
import { toast } from "sonner";
import AuthModal from "../Checkout/AuthModal";
import { useState, useEffect } from "react";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuthStore();
  const [showModal, setShowModal] = useState(true);
  const [mode, setMode] = useState<"login" | "register">("login");

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Você precisa estar logado para acessar essa página", {
        duration: 3000,
        id: "unauthenticated",
      });
      setShowModal(true);
    }
  }, [loading, user]);

  if (loading) {
    return <Loader />;
  }

  if (!user && showModal) {
    return (
      <AuthModal
        open={showModal}
        mode={mode}
        onModeChange={setMode}
        onClose={() => setShowModal(false)}
      />
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
