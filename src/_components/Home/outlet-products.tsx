import { api } from "@/lib/axios";
import ProductCard from "./product-card";
import { useEffect, useState } from "react";
import { Product } from "@/interfaces/Product";
import Loader from "@/_components/Loader/loader";
import { useSearchParams } from "react-router-dom";
import { RouteSelect } from "./route-select";
import { TriangleAlertIcon } from "lucide-react";

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
        <div className="w-full h-full flex items-center justify-center mt-10">
          <div className="flex flex-col justify-center gap-y-4 items-center h-full w-full ">
            <span>
              <TriangleAlertIcon size={50} color="red" />
            </span>
            <span className="text-gray-800 antialiased text-sm line-clamp-2 text-center italic">
              Nenhum produto encontrado.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-x-[0.5rem] gap-y-[0.45rem] bg-white place-items-start h-full overflow-x-hidden p-1.5">
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
