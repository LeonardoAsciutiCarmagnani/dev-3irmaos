import { api } from "@/lib/axios";
import ProductCard from "./product-card";
import { useEffect, useState } from "react";
import { Product } from "@/interfaces/Product";
import Loader from "@/_components/Loader/loader";
import { useSearchParams } from "react-router-dom";
import { RouteSelect } from "./route-select";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowDown01,
  ArrowUp01,
  TriangleAlertIcon,
} from "lucide-react";

// Tipo para as opções de ordenação
type SortOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
  sortFn: (a: Product, b: Product) => number;
};

const OutletProducts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoria = searchParams.get("c") || "";
  const sortBy = searchParams.get("sort") || "default";

  // Definição das opções de ordenação
  const sortOptions: SortOption[] = [
    {
      id: "default",
      label: "Padrão",
      icon: null,
      sortFn: () => 0,
    },
    {
      id: "name-asc",
      label: "Nome (A - Z)",
      icon: <ArrowDownAZ size={16} />,
      sortFn: (a, b) => a.nome.localeCompare(b.nome),
    },
    {
      id: "name-desc",
      label: "Nome (Z - A)",
      icon: <ArrowUpAZ size={16} />,
      sortFn: (a, b) => b.nome.localeCompare(a.nome),
    },
    {
      id: "price-asc",
      label: "Valor (Menor - Maior)",
      icon: <ArrowDown01 size={16} />,
      sortFn: (a, b) => a.preco - b.preco,
    },
    {
      id: "price-desc",
      label: "Valor (Maior - Menor)",
      icon: <ArrowUp01 size={16} />,
      sortFn: (a, b) => b.preco - a.preco,
    },
  ];

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
    if (products.length > 0) {
      const primaryProducts = products.filter(
        (product) =>
          product.produtoPrimarioId === "00000000-0000-0000-0000-000000000000"
      );

      const currentSortOption =
        sortOptions.find((option) => option.id === sortBy) || sortOptions[0];

      const sortedProducts = [...primaryProducts].sort(
        currentSortOption.sortFn
      );

      setFilteredProducts(sortedProducts);
    }
  }, [products, sortBy]);

  useEffect(() => {
    getProducts(categoria);
  }, [categoria]);

  const handleSortChange = (sortId: string) => {
    setSearchParams((prev) => {
      prev.set("sort", sortId);
      return prev;
    });
  };

  return (
    <div className="overflow-hidden">
      <RouteSelect />

      <div className="flex items-center justify-end px-4 py-2 bg-white border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-1 text-sm border rounded-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 && !isLoading && (
        <div className="w-full h-full flex items-center justify-center mt-10">
          <div className="flex flex-col justify-center gap-y-4 items-center h-full w-full ">
            <span>
              <TriangleAlertIcon size={50} color="lightgray" />
            </span>
            <span className="text-gray-800 antialiased text-sm line-clamp-2 text-center italic">
              Nenhum produto encontrado.
            </span>
          </div>
        </div>
      )}

      <div className="h-[calc(100vh-6.3rem)] overflow-y-auto pb-20 bg-white">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-x-1 gap-y-2 p-4 w-full">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center h-40">
              <Loader />
            </div>
          ) : (
            filteredProducts.map((product: Product) => (
              <div
                key={product.id}
                className="w-full flex items-center justify-center"
              >
                <ProductCard {...product} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OutletProducts;
