import Header from "@/_components/Header/Header";
import Sidebar from "../Sidebar/sidebar";

const LayoutPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-white flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <div className="flex-1"> {children}</div>
      </div>
    </div>
  );
};

export default LayoutPage;
