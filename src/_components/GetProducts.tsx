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
  <div className="flex flex-col w-[180px] sm:w-[200px] p-4 bg-white rounded-lg shadow-xl border-[0.1rem]  border-gray-100">
    <div className="mb-3">
      {product.imagem ? (
        <img
          src={product.imagem}
          alt={product.nome}
          className="w-full h-24 sm:h-28 object-cover rounded-md border border-yellow-400"
        />
      ) : (
        <div className="w-full h-24 sm:h-28 bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-500">
          Sem imagem
        </div>
      )}
    </div>
    <h3 className="text-sm font-semibold truncate text-gray-900 mb-1">
      {product.nome}
    </h3>
    <p className="text-xs text-gray-500 mb-2">
      {product.categoria || "Sem categoria"}
    </p>
    <p className="text-lg font-bold text-yellow-600 mb-2">
      {product.preco.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}
    </p>
    <p
      className={`text-sm font-medium ${
        product.ativo ? "text-green-600" : "text-red-600"
      }`}
    >
      {product.ativo ? "Disponível" : "Indisponível"}
    </p>
    <div className="flex items-center gap-3 mt-3">
      <button
        onClick={() => handleRemoveItemFromCart(product.id)}
        className="flex items-center justify-center w-8 h-8 bg-yellow-100 hover:bg-yellow-200 rounded-full text-yellow-600 shadow-sm transition-all"
      >
        <Minus className="w-5 h-5" />
      </button>
      <span className="text-sm font-medium">{product.quantidade}</span>
      <button
        onClick={() => handleAddItemInList(product)}
        className="flex items-center justify-center w-8 h-8 bg-yellow-100 hover:bg-yellow-200 rounded-full text-yellow-600 shadow-sm transition-all"
      >
        <Plus className="w-5 h-5" />
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
    <div className="flex justify-start">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 bg-yellow-50 border-l-8 border-yellow-500 pl-4 p-2 mb-4 rounded-md shadow-md tracking-wider">
        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
      </h2>
    </div>
    <div className="flex gap-4 overflow-x-auto">
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
    error,
    setProducts,
  } = useZustandContext();

  useEffect(() => {
    setProducts();
    console.log("Produtos: ", products);
  }, []);

  const categories = ["TRADICIONAIS", "ESPECIAIS"];

  return (
    <div className="p-4 bg-white h-screen overflow-y-auto mt-[6rem]">
      {loading && <LoadingSkeleton />}
      {error && <div className="text-red-600 text-center mt-4">{error}</div>}
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
