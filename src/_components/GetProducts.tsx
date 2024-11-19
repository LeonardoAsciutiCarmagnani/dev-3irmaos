/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { useZustandContext } from "@/context/cartContext";

export const FetchProducts = React.memo(() => {
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

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Produtos</h1>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl">
          {Array(8)
            .fill(null)
            .map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-pulse"
              >
                <div className="bg-gray-300 h-48 w-full rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                    <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Error Handling */}
      {error && <p className="text-center text-red-500 mt-4">{error}</p>}

      {/* Product Grid */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className={`${
                  product.ativo ? "opacity-100" : "opacity-60"
                } bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 duration-300 flex flex-col`}
                style={{ height: "360px" }}
              >
                {product.imagem ? (
                  <img
                    src={product.imagem}
                    alt={product.nome}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded-t-lg">
                    <span className="text-gray-500">Sem imagem</span>
                  </div>
                )}

                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div className="text-sm font-semibold text-gray-800">
                    <h2 className="leading-snug text-center line-clamp-2">
                      {product.nome}
                    </h2>
                  </div>
                  <p className="text-gray-500 text-xs text-center">
                    {product.categoria || "Sem categoria"}
                  </p>
                  <p className="text-lg font-bold text-green-600 text-center">
                    {product.preco?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                  <p
                    className={`text-sm font-medium text-center ${
                      product.ativo ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.ativo ? "Disponível" : "Indisponível"}
                  </p>

                  {/* Quantity Controls */}
                  <div className="mt-4 flex items-center justify-center space-x-4">
                    <button
                      disabled={!product.ativo}
                      className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 focus:outline-none transition-colors"
                      onClick={() => handleRemoveItemFromCart(product.id)}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-lg font-semibold">
                      {product.quantidade}
                    </span>
                    <button
                      disabled={!product.ativo}
                      className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 focus:outline-none transition-colors"
                      onClick={() => handleAddItemInList(product)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              Nenhum produto encontrado.
            </p>
          )}
        </div>
      )}
    </div>
  );
});
