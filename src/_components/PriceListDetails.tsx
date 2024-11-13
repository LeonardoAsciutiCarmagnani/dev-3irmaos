/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

interface ProductProps {
  id: string;
  name: string;
  value: number;
}

interface PriceListProps {
  id: string;
  name: string;
  products: ProductProps | ProductProps[];
}

interface ApiResponse {
  priceList: PriceListProps;
}

const PriceListDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [priceList, setPriceList] = useState<PriceListProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchPriceList = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse>(
        `https://us-central1-server-kyoto.cloudfunctions.net/api/v1/prices-lists/${id}`
      );
      setPriceList(response.data.priceList);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data || error.message);
      } else {
        setError("Erro desconhecido");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPriceList();
    }
  }, [id]);

  const handleValueChange = (productId: string, newValue: number) => {
    if (priceList) {
      const updatedProducts = Array.isArray(priceList.products)
        ? priceList.products.map((product) =>
            product.id === productId ? { ...product, value: newValue } : product
          )
        : { ...priceList.products, value: newValue };

      setPriceList({ ...priceList, products: updatedProducts });
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    setError(null);
    try {
      await axios.put(
        `https://us-central1-server-kyoto.cloudfunctions.net/api/v1/prices-lists/${id}`,
        { products: priceList?.products }
      );
      alert("Alterações salvas com sucesso!");
      navigate("/prices-lists");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError("Erro ao salvar alterações.");
      } else {
        setError("Erro desconhecido.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
        Detalhes da Lista de Preços
      </h1>
      {loading ? (
        <p className="text-center text-gray-500">
          Carregando lista de preços...
        </p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : priceList ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-800 mb-6 text-center">
            {priceList.name}
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-100 text-gray-700">
                <th className="p-3 text-left text-xs font-semibold">Produto</th>
                <th className="p-3 text-left text-xs font-semibold">
                  Valor Atual
                </th>
                <th className="p-3 text-left text-xs font-bold text-nowrap">
                  Novo Valor
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(priceList?.products) ? (
                priceList.products.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="p-3 text-gray-800 text-xs font-bold antialiased md:text-md">
                      {product.name}
                    </td>
                    <td className="p-3 text-gray-900 text-xs">
                      {product.value.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="p-3 text-xs text-center">
                      <input
                        type="number"
                        value={product.value}
                        onChange={(e) =>
                          handleValueChange(
                            product.id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b">
                  <td className="p-3 text-gray-800">
                    {(priceList?.products as ProductProps).name}
                  </td>
                  <td className="p-3 text-gray-600">
                    {(priceList?.products as ProductProps).value.toLocaleString(
                      "pt-BR",
                      {
                        style: "currency",
                        currency: "BRL",
                      }
                    )}
                  </td>
                  <td className="p-3 text-xs">
                    <input
                      type="number"
                      value={(priceList?.products as ProductProps).value}
                      onChange={(e) =>
                        handleValueChange(
                          (priceList?.products as ProductProps).id,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex gap-x-2 items-center justify-start w-fit">
            <button
              onClick={() => navigate("/prices-lists")}
              disabled={saving}
              className={`w-fit p-2 mt-6 py-3 text-white font-semibold rounded-lg shadow-md ${
                saving ? "bg-gray-400" : "bg-red-500 hover:bg-red-300"
              } transition-colors`}
            >
              Cancelar
            </button>
            <button
              onClick={saveChanges}
              disabled={saving}
              className={`w-fit p-2 mt-6 py-3 text-white font-semibold rounded-lg shadow-md ${
                saving ? "bg-gray-400" : "bg-green-500 hover:bg-green-300"
              } transition-colors`}
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          Lista de preços não encontrada.
        </p>
      )}
    </div>
  );
};

export default PriceListDetails;
