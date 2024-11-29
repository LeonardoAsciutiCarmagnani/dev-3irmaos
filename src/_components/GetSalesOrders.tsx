import { useState, useEffect } from "react";
import axios from "axios";
import apiBaseUrl from "@/lib/apiConfig";

interface Evento {
  chaveDocumentoFiscal: string | null;
  codigoDoTipoDeEvento: number;
  data: string;
  observacao: string;
  tipoDocumentoFiscal: string | null;
  urlArquivoXml: string | null;
}

interface PedidoDeVenda {
  cancelado: boolean;
  codigoDaSituacaoDeProcessamento: number;
  codigoDoPedidoDeVenda: string;
  data: string;
  eventos: Evento[];
  pedidoDeVendaId: string;
  errors: string[];
  message: string | null;
}

export const GetSalesOrders = () => {
  console.log("GetSalesOrders component mounted");
  const [orders, setOrders] = useState<PedidoDeVenda[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGetSalesOrders = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/pedido-de-venda`, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Full order: ", response.data);

      setOrders(response.data.order || []);
      if (
        Array.isArray(response.data.errors) &&
        response.data.errors.length > 0
      ) {
        setError(response.data.errors.join(", "));
      } else {
        setError(null);
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos de venda:", error);
      setError("Erro ao buscar pedidos de venda.");
    }
  };

  useEffect(() => {
    handleGetSalesOrders();
  }, []);

  return (
    <div>
      <h1>Pedidos de Venda</h1>
      {Object.entries(orders).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {JSON.stringify(value)}
        </div>
      ))}
      <div>{error}</div>
    </div>
  );
};

export default GetSalesOrders;
