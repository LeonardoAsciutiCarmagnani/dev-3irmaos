/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { Plus, Minus } from "lucide-react";
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

const LoadingSkeleton: React.FC = () => (
  <div className="flex gap-4 overflow-x-auto">
    {Array(8)
      .fill(null)
      .map((_, index) => (
        <div
          key={index}
          className="min-w-[150px] h-24 bg-gray-200 rounded-md animate-pulse"
        ></div>
      ))}
  </div>
);

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  handleAddItemInList,
  handleRemoveItemFromCart,
}) => (
  <div className="flex flex-col w-[180px] sm:w-[200px] p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
    {/* Imagem do Produto */}
    <div className="relative mb-3 group">
      {product.imagem ? (
        <img
          src={product.imagem}
          alt={product.nome}
          className="w-full h-28 sm:h-32 object-cover rounded-lg group-hover:brightness-90 transition duration-300"
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
        <span className="absolute bottom-2 left-2 px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-md">
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

const ProductCategory: React.FC<ProductCategoryProps> = ({
  categoria,
  products,
  handleAddItemInList,
  handleRemoveItemFromCart,
}) => (
  <div className="mb-6">
    <div className="flex justify-start ">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 bg-yellow-50 border-l-8 border-yellow-500 pl-4 p-2 mb-4 rounded-md shadow-md tracking-wider">
        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
      </h2>
    </div>
    <div className="grid grid-cols-2 gap-4">
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

export const FetchProducts: React.FC = React.memo(() => {
  const {
    handleAddItemInList,
    handleRemoveItemFromCart,
    products,
    loading,
    setProducts,
  } = useZustandContext();

  useEffect(() => {
    setProducts();
    console.log("Produtos: ", products);
  }, []);

  const categories = ["TRADICIONAIS", "ESPECIAIS"];

  return (
    <div className="p-4 bg-gray-50 h-screen overflow-y-auto mt-[6rem]">
      {loading && <LoadingSkeleton />}
      {!loading &&
        categories.map((categoria) => {
          const productsPerCategorie = products.filter(
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
