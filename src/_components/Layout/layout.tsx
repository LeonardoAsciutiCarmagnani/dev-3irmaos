import Header from "@/_components/Header/Header";
import Sidebar from "../Sidebar/sidebar";
import { Toaster } from "@/components/ui/sonner";

const LayoutPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-white flex flex-col h-screen w-full">
      <Header />
      <div className="flex flex-1">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <div className="flex-1">{children}</div>
        <Toaster
          richColors
          position="top-right"
          duration={3000}
          closeButton={true}
          expand={true}
          toastOptions={{
            style: {
              borderRadius: "0.125rem",
            },
          }}
        />
      </div>
    </div>
  );
};

export default LayoutPage;
