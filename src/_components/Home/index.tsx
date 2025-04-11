import { api } from "@/lib/axios";
import ProductCard from "./product-card";
import { useEffect, useState } from "react";
import { Product } from "@/interfaces/Product";
import Loader from "@/_components/Loader/loader";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const getProducts = async () => {
    try {
      setIsLoading(true);
      const getProducts = await api.get("/products");
      const products = getProducts.data.data;
      console.log("Produtos", products);
      setProducts(products);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="grid grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 2xl:grid-rows-3 gap-[0.25rem] bg-gray-100 plac-items-start h-[89vh] overflow-y-auto overflow-x-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center h-full w-full">
          <Loader />
        </div>
      ) : (
        products.map((product: Product) => (
          <div
            key={product.id}
            className="flex items-center justify-center  w-full"
          >
            <ProductCard {...product} />
          </div>
        ))
      )}
    </div>
  );
};

export default Home;
