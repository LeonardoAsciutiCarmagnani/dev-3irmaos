import Header from "@/_components/Header/Header";
import Sidebar from "../Sidebar/sidebar";
import { Toaster } from "@/components/ui/sonner";
import FooterProductDetails from "../Footers/footer_product-details";

const ProductDetailsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* <header className="sticky top-0 z-50 bg-white shadow">
        <Header />
      </header> */}

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex">
          <Sidebar />
        </aside>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <footer className="fixed bottom-0 left-0 w-full z-20 bg-white shadow">
        <FooterProductDetails />
      </footer>

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
  );
};

export default ProductDetailsLayout;
