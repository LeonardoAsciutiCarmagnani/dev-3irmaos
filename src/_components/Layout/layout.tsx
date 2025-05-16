import Header from "@/_components/Header/Header";
import Sidebar from "../Sidebar/sidebar";
import { Toaster } from "@/components/ui/sonner";

const LayoutPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-white flex flex-col h-full w-full overflow-hidden">
      <Header />
      <div className="flex flex-1">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <div className="flex-1 overflow-hidden">{children}</div>
        <Toaster
          richColors
          position="top-right"
          duration={3000}
          closeButton={true}
        />
      </div>
    </div>
  );
};

export default LayoutPage;
