/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ToastNotifications from "./Toasts";
import { Input } from "@/components/ui/input";

interface ProductProps {
  id: string;
  nome: string;
  preco: number;
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
  const { toastSuccess, toastError } = ToastNotifications();
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
        toastError(error.response?.data || error.message);
      } else {
        toastError("Erro desconhecido");
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
            product.id === productId ? { ...product, preco: newValue } : product
          )
        : priceList.products.id === productId
        ? { ...priceList.products, preco: newValue }
        : priceList.products;

      setPriceList({ ...priceList, products: updatedProducts });
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      await axios.put(
        `https://us-central1-server-kyoto.cloudfunctions.net/api/v1/prices-lists/${id}`,
        { products: priceList?.products }
      );
      toastSuccess("Alterações salvas com sucesso!.");
      navigate("/prices-lists");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toastError("Erro ao salvar alterações.");
      } else {
        toastError("Erro desconhecido.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen flex flex-col items-center">
      <h1 className="text-xl sm:text-2xl font-semibold text-center mb-4 text-gray-800">
        Detalhes da Lista de Preços
      </h1>
      {loading ? (
        <p className="text-center text-gray-500">
          Carregando lista de preços...
        </p>
      ) : priceList ? (
        <div className="bg-white shadow rounded-lg p-4 w-full max-w-md">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center">
            {priceList.name}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-yellow-200 text-gray-700 rounded-md">
                  <th className="p-3 text-left font-semibold">Produto</th>
                  <th className="p-3 text-left font-semibold">Valor Atual</th>
                  <th className="p-3 text-left font-bold text-nowrap">
                    Novo Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(priceList?.products) ? (
                  priceList.products.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="p-3 text-gray-800 font-medium">
                        {product.nome}
                      </td>
                      <td className="p-3 text-gray-900">
                        {product.preco.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td className="p-3 text-center">
                        <Input
                          type="number"
                          value={"" + product.preco}
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
                      {(priceList?.products as ProductProps).nome}
                    </td>
                    <td className="p-3 text-gray-600">
                      {(
                        priceList?.products as ProductProps
                      ).preco.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={(priceList?.products as ProductProps).preco}
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
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={() => navigate("/prices-lists")}
              disabled={saving}
              className={`flex-1 p-3 text-sm sm:text-base text-white font-semibold rounded-lg shadow-md ${
                saving ? "bg-gray-400" : "bg-red-500 hover:bg-red-300"
              } transition-colors`}
            >
              Cancelar
            </button>
            <button
              onClick={saveChanges}
              disabled={saving}
              className={`flex-1 p-3 text-sm sm:text-base text-white font-semibold rounded-lg shadow-md ${
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
