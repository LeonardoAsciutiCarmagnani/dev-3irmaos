import Auth from "@/_components/Login/login/login";
import { Toaster } from "sonner";

const LoginPage = () => {
  return (
    <div className="h-[100vh] flex overflow-y-hidden w-full bg-gray-50 items-center justify-center p-1">
      <Toaster
        richColors
        position="top-right"
        duration={3000}
        closeButton={true}
        toastOptions={{
          style: {
            borderRadius: "0.125rem",
          },
        }}
      />
      <Auth />
    </div>
  );
};

export default LoginPage;
