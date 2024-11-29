import { useEffect, useState } from "react";
import axios from "axios";
import apiBaseUrl from "@/lib/apiConfig";

interface Stock {
  pontoDeSincronizacao: number;
  produtoId: string;
  quantidadeEmEstoque: number;
  quantidadeMinimaEmEstoque: number;
}

const FetchStock = () => {
  const [stock, setStock] = useState<Stock>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/estoque`);
      console.log(response.data);
      setStock(response.data.stock || null);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
      setError("Erro ao buscar estoque.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <div>
      <h1>Estoque</h1>
      {loading && <p>Carregando Estoque...</p>}
      {error && <p>{error}</p>}
      {stock ? (
        <>
          <p>Quantidade em estoque: {stock.quantidadeEmEstoque}</p>
          <p>Quantidade mínima em estoque: {stock.quantidadeMinimaEmEstoque}</p>
          <p>Ponto de sincronização: {stock.pontoDeSincronizacao}</p>
        </>
      ) : (
        <p>Sem dados disponíveis.</p>
      )}
    </div>
  );
};

export default FetchStock;
