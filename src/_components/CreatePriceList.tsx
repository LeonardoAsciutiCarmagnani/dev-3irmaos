/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { collection, doc, getDoc } from "firebase/firestore";
import { firestore as db } from "../firebaseConfig";
import ToastNotifications from "./Toasts";
import apiBaseUrl from "@/lib/apiConfig";
interface ProductProps {
  id: string;
  nome: string;
  preco: number;
  imagem?: string;
  categoria?: string;
}

interface PriceListProps {
  name?: string;
  products: ProductProps[];
}

const PostPricesList = () => {
  const [defaultProducts, setDefaultProducts] = useState<ProductProps[]>([]);
  const [priceListName, setPriceListName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toastSuccess, toastError } = ToastNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDefaultProducts = async () => {
      try {
        const defaultDoc = doc(
          collection(db, "default_prices-list"),
          "DEFAULT"
        );
        const docSnap = await getDoc(defaultDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && Array.isArray(data.products)) {
            setDefaultProducts(data.products as ProductProps[]);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar produtos da coleção DEFAULT:", error);
        toastError("Erro ao buscar produtos da coleção DEFAULT.");
      }
    };

    fetchDefaultProducts();
  }, []);

  const handleProductValueChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const updatedProducts = [...defaultProducts];
    updatedProducts[index].preco = parseFloat(e.target.value) || 0;
    setDefaultProducts(updatedProducts);
  };

  const postPriceList = async () => {
    if (!priceListName || defaultProducts.length === 0) {
      toastError("Nome da lista de preços e produtos são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const newPriceList: PriceListProps = {
        name: priceListName,
        products: defaultProducts,
      };
      await axios.post(`${apiBaseUrl}/create-prices-list`, newPriceList, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toastSuccess("Lista de preços criada com sucesso!");
      navigate("/prices-lists");
    } catch (error) {
      console.error("Erro ao criar lista de preços:", error);
      toastError("Erro ao criar lista de preços.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
        Criar Lista de Preços
      </h1>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Nome da Lista
        </label>
        <input
          type="text"
          value={priceListName}
          onChange={(e) => setPriceListName(e.target.value)}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Produtos da Lista
        </h2>
        {defaultProducts.map((product, index) => (
          <div
            key={product.id}
            className="mb-4 p-4 bg-white rounded-lg shadow-sm border "
          >
            <div className="flex items-center justify-between text-gray-800 mb-4 gap-x-4 ">
              <p className="text-gray-700 font-sm">{product.nome}</p>
              <div className="rounded-full p-1 w-fit text-xs font-semibold uppercase text-amber-500">
                {product.categoria}
              </div>
            </div>
            <label className="block text-gray-700 font-medium mb-2">
              Valor
            </label>
            <input
              type="number"
              value={"" + product.preco}
              onChange={(e) => handleProductValueChange(e, index)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-x-2 items-end justify-start w-fit">
        <button
          onClick={() => navigate("/prices-lists")}
          disabled={loading}
          className={`w-fit p-2 mt-6 py-3 text-white font-semibold rounded-lg shadow-md ${
            loading ? "bg-gray-400" : "bg-red-500 hover:bg-red-400"
          } transition-colors`}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={postPriceList}
          className={`w-fit p-2 mt-6 py-3 text-white font-semibold rounded-lg shadow-md ${
            loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-400"
          } transition-colors`}
          disabled={loading}
        >
          {loading ? "Enviando..." : "Salvar Lista de Preços"}
        </button>
      </div>
    </div>
  );
};

export default PostPricesList;
