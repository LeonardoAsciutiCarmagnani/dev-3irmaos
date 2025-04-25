import { api } from "@/lib/axios";
import ProductCard from "./product-card";
import { useEffect, useState } from "react";
import { Product } from "@/interfaces/Product";
import Loader from "@/_components/Loader/loader";
import { useSearchParams } from "react-router-dom";
import { PackageSearchIcon } from "lucide-react";
import { RouteSelect } from "./route-select";

const OutletProducts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();
  const categoria = searchParams.get("c") || "";

  const getProducts = async (paramCategory: string) => {
    try {
      setIsLoading(true);
      const url = `/get-products?category=${encodeURIComponent(paramCategory)}`;

      const response = await api.get(url);
      const products = response.data.products.produtos;
      setProducts(products);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProducts(categoria);
  }, [categoria]);

  return (
    <>
      <RouteSelect />

      {products.length === 0 && !isLoading && (
        <div>
          <div className="flex justify-center items-center h-[20vh] w-full ">
            <span className="text-gray-800 font-semibold antialiased text-sm md:text-md line-clamp-2 text-center italic ">
              Nenhum produto encontrado!
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 2xl:grid-rows-3 gap-[0.35rem] bg-gray-100 plac-items-start h-screen overflow-y-auto overflow-x-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-full w-full">
            <Loader />
          </div>
        ) : (
          products
            .filter(
              (product) =>
                product.produtoPrimarioId ===
                "00000000-0000-0000-0000-000000000000"
            )
            .map((product: Product) => (
              <div
                key={product.id}
                className="flex items-center justify-center w-full h-fit"
              >
                <ProductCard {...product} />
              </div>
            ))
        )}
      </div>
    </>
  );
};

export default OutletProducts;
