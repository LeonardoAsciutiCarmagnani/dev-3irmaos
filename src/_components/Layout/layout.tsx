import Header from "@/_components/Header/Header";
import Sidebar from "../Sidebar/sidebar";
import Footer from "../Footers/footer";

const LayoutPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen w-full">
      <header className="sticky top-0 z-50 bg-white shadow">
        <Header />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex">
          <Sidebar />
        </aside>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <footer className="sticky bottom-0 z-50 bg-white shadow">
        <Footer />
      </footer>
    </div>
  );
};

export default LayoutPage;
