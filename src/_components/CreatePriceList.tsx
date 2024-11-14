import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { collection, doc, getDoc } from "firebase/firestore";
import { firestore as db } from "../firebaseConfig";

interface ProductProps {
  id: string;
  name: string;
  value: number;
}

interface PriceListProps {
  name: string;
  products: ProductProps[];
}

const PostPricesList = () => {
  const [defaultProducts, setDefaultProducts] = useState<ProductProps[]>([]);
  const [priceListName, setPriceListName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        setError("Erro ao buscar produtos da coleção DEFAULT.");
      }
    };

    fetchDefaultProducts();
  }, []);

  const handleProductValueChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const updatedProducts = [...defaultProducts];
    updatedProducts[index].value = parseFloat(e.target.value) || 0;
    setDefaultProducts(updatedProducts);
  };

  const postPriceList = async () => {
    if (!priceListName || defaultProducts.length === 0) {
      setError("Nome da lista de preços e produtos são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const newPriceList: PriceListProps = {
        name: priceListName,
        products: defaultProducts,
      };
      await axios.post(
        "https://us-central1-server-kyoto.cloudfunctions.net/api/v1/create-prices-list",
        newPriceList,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Lista de preços criada com sucesso!");
      navigate("/prices-lists");
    } catch (error) {
      console.error("Erro ao criar lista de preços:", error);
      setError("Erro ao criar lista de preços.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
        Criar Lista de Preços
      </h1>

      {error && <p className="text-center text-red-500 mb-4">{error}</p>}

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
            className="mb-4 p-4 bg-white rounded-lg shadow-sm border"
          >
            <p className="text-gray-700 font-medium mb-2">{product.name}</p>
            <label className="block text-gray-700 font-medium mb-2">
              Valor
            </label>
            <input
              type="number"
              value={product.value}
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
