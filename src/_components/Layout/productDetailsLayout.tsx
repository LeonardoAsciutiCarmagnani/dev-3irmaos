import Sidebar from "../Sidebar/sidebar";
import FooterProductDetails from "../Footers/footer_product-details";

const ProductDetailsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen w-full">
      {/* <header className="sticky top-0 z-50 bg-white shadow">
        <Header />
      </header> */}

      <div className="flex flex-1 min-h-0">
        {" "}
        <aside className="hidden md:flex flex-shrink-0">
          <Sidebar />
        </aside>
        <main className="flex-1 overflow-y-auto pb-20">{children}</main>
      </div>

      <footer className="fixed bottom-0 left-0 w-full z-20 bg-white shadow">
        <FooterProductDetails />
      </footer>
    </div>
  );
};

export default ProductDetailsLayout;
