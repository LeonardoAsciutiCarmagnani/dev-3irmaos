import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import "tailwindcss/tailwind.css";
import { PlusIcon, MinusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnderecoDeEntrega } from "./PostSaleOrder";

interface Client {
  id: string;
  CPF: string;
  IE?: number;
  cep: number;
  complement: string;
  fantasyName?: string;
  ibge: number;
  logra: string;
  neighborhood: string;
  phone: string;
  userName: string;
}

interface ClientsProps {
  onSelectClient: (client: EnderecoDeEntrega | null) => void;
}

const Clients = ({ onSelectClient }: ClientsProps) => {
  const [clientes, setClientes] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const clientesCollection = collection(db, "clients");
        const clientesSnapshot = await getDocs(clientesCollection);
        const clientesList = clientesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Client[];
        setClientes(clientesList);
        console.log("Requisição feita");
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      }
    };

    fetchClientes();
  }, [db]);

  const handleSelectClient = (id: string) => {
    const client = clientes.find((cliente) => cliente.id === id) || null;

    if (client) {
      const enderecoDeEntrega = {
        bairro: client.neighborhood,
        cep: client.cep.toString(),
        codigoIbge: client.ibge,
        complemento: client.complement,
        logradouro: client.logra,
        numero: "",
      };

      setSelectedClient(client);
      onSelectClient(enderecoDeEntrega); // Envia apenas o endereço para o componente pai
    } else {
      setSelectedClient(null);
      onSelectClient(null);
    }

    setShowDetails(false);
  };

  return (
    <div className="p-4">
      <Select onValueChange={(value) => handleSelectClient(value)}>
        <SelectTrigger className="w-full flex items-center justify-between border border-gray-300 rounded-md p-2">
          <SelectValue placeholder="Selecione um cliente" />
        </SelectTrigger>
        <SelectContent className="w-full border border-gray-300 rounded-md mt-2">
          {clientes.map((cliente) => (
            <SelectItem
              key={cliente.id}
              value={cliente.id}
              className="p-2 hover:bg-gray-100"
            >
              {cliente.userName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedClient && (
        <div className="mt-4 space-y-2">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="link"
            className="text-blue-500 hover:underline"
            type="button"
          >
            {showDetails ? (
              <span className="flex items-center gap-x-1">
                {" "}
                <MinusIcon /> Ocultar Detalhes
              </span>
            ) : (
              <span className="flex items-center gap-x-1">
                {" "}
                <PlusIcon /> Detalhes
              </span>
            )}
          </Button>

          {/* Detalhes do cliente */}
          {showDetails && (
            <div className="mt-4 space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CPF:
                </label>
                <input
                  type="text"
                  value={selectedClient.CPF}
                  readOnly
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              {selectedClient.IE !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    IE:
                  </label>
                  <input
                    type="text"
                    value={
                      selectedClient.IE
                        ? selectedClient.IE.toString()
                        : "Não informado"
                    }
                    readOnly
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CEP:
                </label>
                <input
                  type="text"
                  value={
                    selectedClient.cep ? selectedClient.cep.toString() : ""
                  }
                  readOnly
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Complemento:
                </label>
                <input
                  type="text"
                  value={selectedClient.complement}
                  readOnly
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              {selectedClient.fantasyName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome Fantasia:
                  </label>
                  <input
                    type="text"
                    value={selectedClient.fantasyName || "Não informado"}
                    readOnly
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  IBGE:
                </label>
                <input
                  type="text"
                  value={
                    selectedClient.ibge ? selectedClient.ibge.toString() : ""
                  }
                  readOnly
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Logradouro:
                </label>
                <input
                  type="text"
                  value={selectedClient.logra}
                  readOnly
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bairro:
                </label>
                <input
                  type="text"
                  value={selectedClient.neighborhood}
                  readOnly
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Telefone:
                </label>
                <input
                  type="text"
                  value={selectedClient.phone}
                  readOnly
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Clients;
