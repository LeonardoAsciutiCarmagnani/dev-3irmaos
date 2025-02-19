/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Minus,
  Search,
  ChevronLeft,
  ChevronRight,
  ImageOff,
} from "lucide-react";
import { useZustandContext } from "@/context/cartContext";
import LazyLoad from "react-lazyload";
import useUserStore from "@/context/UserStore";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Product {
  id: string;
  nome: string;
  categoria?: string;
  preco: number;
  ativo?: boolean;
  quantidade: number;
  imagem?: string;
  descricao: string;
}

interface ProductCardProps {
  product: Product;
  handleAddItemInList: (product: Product) => void;
  handleRemoveItemFromCart: (id: string) => void;
}

interface ProductCategoryProps {
  categoria: string;
  products: Product[];
  handleAddItemInList: (product: Product) => void;
  handleRemoveItemFromCart: (id: string) => void;
}

export const FetchProducts: React.FC = React.memo(() => {
  const {
    handleAddItemInList,
    handleRemoveItemFromCart,
    products,
    loading,
    setProducts,
  } = useZustandContext();
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30; // Exibir 30 produtos por página
  const categoryOrder = [
    "tradicionais",
    "diferenciados",
    "mini especial",
    "especiais",
    "doces",
    "outros",
  ];
  const { typeUser, fetchTypeUser, fetchSaveUsername } = useUserStore();
  const { clearListProductsInCart } = useZustandContext();
  const navigate = useNavigate();

  // Filtrar produtos baseado na busca e na paginação
  const filteredProducts = React.useMemo(() => {
    const baseFiltered =
      searchTerm === ""
        ? products
        : products.filter(
            (product) =>
              product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.descricao
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
          );

    // Aplicar paginação
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return baseFiltered.slice(startIndex, endIndex);
  }, [searchTerm, products, currentPage, itemsPerPage]);

  useEffect(() => {
    setProducts();
    clearListProductsInCart([]);
    fetchTypeUser();
    fetchSaveUsername();
  }, [setProducts, navigate, typeUser]);

  useEffect(() => {
    if (products.length > 0) {
      const categoriesSet = new Set(
        products
          .map((product) => product.categoria)
          .filter(
            (categoria): categoria is string =>
              categoria !== undefined && categoria !== null
          )
      );

      const sortedCategories = Array.from(categoriesSet).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a.toLowerCase());
        const indexB = categoryOrder.indexOf(b.toLowerCase());

        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

      setCategories(new Set(sortedCategories));
    }
  }, [products]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      // Resetar para a primeira página ao realizar uma nova busca
      setCurrentPage(1);
    },
    []
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <div className="sticky top-0 z-1 bg-white shadow-sm py-2">
        <div className="px-4">
          <div className="flex items-center border rounded-md px-3 py-2">
            <Search className="text-gray-500 w-5 h-5 mr-2" />
            <Input
              type="text"
              placeholder="Busque pelo nome ou referência do produto"
              value={searchTerm}
              onChange={handleSearchChange}
              className="focus:outline-none focus:ring-0 border-0 rounded-md placeholder-gray-400 h-auto py-0"
            />
          </div>
        </div>
      </div>

      <main className="flex-grow py-4">
        <div className="px-4">
          {loading && <LoadingSkeleton />}
          {!loading &&
            Array.from(categories).map((categoria) => {
              // Filtrar produtos por categoria e aplicar paginação
              const productsPerCategory = filteredProducts.filter(
                (product) => product.categoria === categoria
              );

              return (
                productsPerCategory.length > 0 && (
                  <ProductCategory
                    key={categoria}
                    categoria={categoria}
                    products={productsPerCategory}
                    handleAddItemInList={handleAddItemInList}
                    handleRemoveItemFromCart={handleRemoveItemFromCart}
                  />
                )
              );
            })}
        </div>

        <div className="py-6 px-4">
          <PaginationComponent
            totalItems={
              searchTerm === ""
                ? products.length
                : products.filter(
                    (product) =>
                      product.nome
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      product.descricao
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  ).length
            }
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
});

const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="flex flex-col gap-2">
      {Array(5)
        .fill(null)
        .map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-3 flex items-center"
          >
            <div className="w-12 h-12 bg-gray-300 rounded-md mr-3"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded-md mb-1 w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded-md w-1/2"></div>
            </div>
          </div>
        ))}
    </div>
  </div>
);

const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ product, handleAddItemInList, handleRemoveItemFromCart }) => {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-between p-3">
              <div className="flex items-center">
                <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                  {/* Placeholder ou Imagem */}
                  {product.imagem ? (
                    <LazyLoad height={48} offset={100} once>
                      <img
                        src={product.imagem}
                        alt={product.nome}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </LazyLoad>
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                      <span className="text-xs">
                        <ImageOff className="w-6 h-6" />
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 truncate max-w-[11rem]">
                    {product.nome}
                  </h3>
                  {product.descricao && (
                    <p className="text-[0.75rem] text-white font-bold bg-blue-400 w-fit max-w-[10rem] p-[0.2rem] px-2 text-ellipsis rounded-lg">
                      {product.descricao}
                    </p>
                  )}
                  <p className="text-sm text-emerald-600 font-semibold">
                    {product.preco.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => handleRemoveItemFromCart(product.id)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-7 h-7 flex items-center justify-center transition-colors duration-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="mx-2 text-sm text-gray-700 font-medium">
                  {product.quantidade}
                </span>
                <button
                  onClick={() => handleAddItemInList(product)}
                  className="bg-blue-400 hover:bg-blue-500  text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm font-medium">{product.nome}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

const ProductCategory: React.FC<ProductCategoryProps> = ({
  categoria,
  products,
  handleAddItemInList,
  handleRemoveItemFromCart,
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-2 antialiased">
        {categoria.toUpperCase()}
      </h2>
      <div className="flex flex-col gap-2">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            handleAddItemInList={handleAddItemInList}
            handleRemoveItemFromCart={handleRemoveItemFromCart}
          />
        ))}
      </div>
    </div>
  );
};

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const PaginationComponent: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Não renderizar paginação se houver apenas uma página ou nenhuma
  if (totalPages <= 1) {
    return null;
  }

  // Renderizar até 5 botões de página
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "ghost"}
          className="mx-[0.2rem]"
          onClick={() => onPageChange(i)}
        >
          {i}
        </Button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1>Total de produtos: {totalItems}</h1>
      </div>
      <div></div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center">
        {renderPageNumbers()}
        {/* Correção Aqui */}
        {totalPages > 5 && currentPage + 2 < totalPages && (
          <>
            <span className="mx-1 text-gray-600">...</span>
            <Button variant="ghost" onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
export default FetchProducts;
