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

  const categories = ["TRADICIONAIS", "ESPECIAIS"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center gap-6">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
        Produtos
      </h1>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl">
          {Array(8)
            .fill(null)
            .map((_, index) => (
              <div
                key={index}
                className="bg-gray-100 border border-gray-300 rounded-lg shadow-md overflow-hidden animate-pulse"
              >
                <div className="bg-gray-300 h-40 w-full rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Error Handling */}
      {error && <p className="text-center text-red-600 mt-4">{error}</p>}

      {/* Renderizando produtos agrupados por categoria */}
      {!loading &&
        categories.map((categoria) => {
          const productsPerCategorie = products.filter(
            (product) => product.categoria === categoria
          );

          return (
            productsPerCategorie.length > 0 && (
              <div key={categoria} className="w-full max-w-6xl">
                <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-dashed border-yellow-400 p-2 w-fit shadow-sm text-center mb-3">
                  {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {productsPerCategorie.map((product) => (
                    <div
                      key={product.id}
                      className={`${
                        product.ativo ? "opacity-100" : "opacity-60"
                      } bg-white border border-yellow-300 rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 duration-300 flex flex-col`}
                    >
                      {product.imagem ? (
                        <img
                          src={product.imagem}
                          alt={product.nome}
                          className="w-full h-40 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-40 flex items-center justify-center bg-yellow-200 rounded-t-lg">
                          <span className="text-yellow-600">Sem imagem</span>
                        </div>
                      )}

                      <div className="p-4 flex flex-col justify-between h-full">
                        <h2 className="text-md font-bold text-gray-700 leading-tight text-center">
                          {product.nome}
                        </h2>
                        <p className="text-xs text-gray-500 text-center">
                          {product.categoria || "Sem categoria"}
                        </p>
                        <p className="text-lg font-semibold text-yellow-600 text-center">
                          {product.preco.toLocaleString("pt-BR", {
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
                            className="p-2 bg-yellow-100 rounded-full text-yellow-700 hover:bg-yellow-200 focus:outline-none transition-colors"
                            onClick={() => handleRemoveItemFromCart(product.id)}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-lg font-semibold text-gray-800">
                            {product.quantidade}
                          </span>
                          <button
                            disabled={!product.ativo}
                            className="p-2 bg-yellow-100 rounded-full text-yellow-700 hover:bg-yellow-200 focus:outline-none transition-colors"
                            onClick={() => handleAddItemInList(product)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          );
        })}
    </div>
  );
});
