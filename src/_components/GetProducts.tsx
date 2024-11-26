import React, { useEffect, useState } from "react";
import { Plus, Minus, SearchIcon, LoaderPinwheelIcon } from "lucide-react";
import { useZustandContext } from "@/context/cartContext";

interface Product {
  id: string;
  nome: string;
  categoria?: string;
  preco: number;
  ativo?: boolean;
  quantidade: number;
  imagem?: string;
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  useEffect(() => {
    setProducts();
  }, [setProducts]);

  useEffect(() => {
    if (products.length > 0) {
      const categoriesSet = new Set(
        products
          .map((product) => product.categoria)
          .filter((categoria): categoria is string => categoria !== undefined)
      );
      setCategories(categoriesSet);
    }
  }, [products]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((product) =>
          product.nome.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, products]);

  console.log(products);

  return (
    <div className="p-4 bg-gray-50 h-screen overflow-y-auto mt-[6rem]">
      <div className="mb-4 flex items-center border rounded-lg">
        {/* Ícone de Pesquisa */}
        <SearchIcon className="w-5 h-5 ml-3 text-gray-500" />
        {/* Input de Pesquisa */}
        <input
          type="text"
          placeholder="Pesquisar por nome do produto..."
          className="w-full p-2 pl-3 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {loading && <LoadingSkeleton />}
      {!loading &&
        Array.from(categories).map((categoria) => {
          const productsPerCategorie = filteredProducts.filter(
            (product) => product.categoria === categoria
          );

          return (
            productsPerCategorie.length > 0 && (
              <ProductCategory
                key={categoria}
                categoria={categoria}
                products={productsPerCategorie}
                handleAddItemInList={handleAddItemInList}
                handleRemoveItemFromCart={handleRemoveItemFromCart}
              />
            )
          );
        })}
    </div>
  );
});
const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 gap-4 p-4">
    {Array(8)
      .fill(null)
      .map((_, index) => (
        <div
          key={index}
          className="w-full h-[350px] bg-gray-200 rounded-md animate-pulse"
        >
          {/* Imagem do Produto */}
          <div className="relative mb-3 group">
            <div className="w-full h-32 bg-gray-300 rounded-lg"></div>
            {/* Categoria */}
            <div className="absolute top-2 left-2 px-3 py-1 text-xs font-bold text-white rounded-lg bg-gray-400"></div>
            {/* Status Indisponível */}
            <div className="absolute bottom-2 left-2 px-2 py-1 text-xs font-bold text-white bg-gray-400 rounded-md"></div>
          </div>

          {/* Informações do Produto */}
          <div className="flex flex-col flex-1">
            {/* Nome do Produto */}
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            {/* Preço do Produto */}
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
          </div>

          {/* Controle de Quantidade */}
          <div className="flex items-center justify-between gap-2 mt-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="h-4 bg-gray-300 w-12 rounded"></div>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      ))}
  </div>
);

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  handleAddItemInList,
  handleRemoveItemFromCart,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col w-[165px] sm:w-[180px] p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      {/* Imagem do Produto */}
      <div className="relative mb-3 group">
        {/* Exibe o spinner apenas se a imagem existir e estiver carregando */}
        {product.imagem && isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-lg">
            <LoaderPinwheelIcon className="w-8 h-8 text-yellow-500 animate-spin duration-1000" />{" "}
            {/* Animação do Spinner */}
          </div>
        )}

        {product.imagem ? (
          <img
            src={product.imagem}
            alt={product.nome}
            onLoad={handleImageLoad}
            className="w-full h-28 sm:h-32 object-cover rounded-lg group-hover:brightness-90 transition duration-100"
          />
        ) : (
          <div className="w-full h-28 sm:h-32 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
            Sem imagem
          </div>
        )}

        {product.categoria && (
          <span
            className={`absolute top-2 left-2 px-3 py-1 text-xs font-bold text-white rounded-lg ${
              product.categoria === "ESPECIAIS" ? "bg-yellow-500" : "bg-red-500"
            }`}
          >
            {product.categoria}
          </span>
        )}
        {!product.ativo && (
          <span className="absolute bottom-2 left-[1.2rem] px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-md">
            Indisponível
          </span>
        )}
      </div>

      {/* Informações do Produto */}
      <div className="flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
          {product.nome}
        </h3>
        <p className="text-lg font-bold text-green-600 mb-2">
          {product.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
      </div>

      {/* Controle de Quantidade */}
      <div className="flex items-center justify-between gap-2 mt-3">
        <button
          onClick={() => handleRemoveItemFromCart(product.id)}
          className="flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 shadow-sm transition-transform hover:scale-105"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-gray-800">
          {product.quantidade}
        </span>
        <button
          onClick={() => handleAddItemInList(product)}
          className="flex items-center justify-center w-8 h-8 bg-yellow-500 hover:bg-yellow-600 rounded-full text-white shadow-sm transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
const ProductCategory: React.FC<ProductCategoryProps> = ({
  categoria,
  products,
  handleAddItemInList,
  handleRemoveItemFromCart,
}) => (
  <div className="mb-6 px-4">
    <div className="flex justify-start">
      <h2 className="relative right-[1rem] text-md sm:text-2xl font-bold text-gray-800 bg-yellow-50 border-l-8 border-yellow-500 pl-4 p-2 mb-4 rounded-md shadow-md tracking-wider">
        {categoria
          ? categoria.charAt(0).toUpperCase() + categoria.slice(1)
          : "SEM CATEGORIA"}
      </h2>
    </div>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
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
