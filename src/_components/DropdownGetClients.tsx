import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
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
  id_priceList: string;
}

interface ClientsProps {
  onSelectClient: (data: {
    enderecoDeEntrega: EnderecoDeEntrega | null;
    priceListId: string | null;
  }) => void;
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
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      }
    };

    fetchClientes();
  }, [db]);

  const handleSelectClient = (id: string) => {
    const client = clientes.find((cliente) => cliente.id === id) || null;

    if (client) {
      const enderecoDeEntrega: EnderecoDeEntrega = {
        bairro: client.neighborhood,
        cep: client.cep.toString(),
        codigoIbge: client.ibge,
        complemento: client.complement,
        logradouro: client.logra,
        numero: "",
      };

      setSelectedClient(client);
      onSelectClient({ enderecoDeEntrega, priceListId: client.id_priceList });
    } else {
      setSelectedClient(null);
      onSelectClient({ enderecoDeEntrega: null, priceListId: null });
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
                <MinusIcon /> Ocultar Detalhes
              </span>
            ) : (
              <span className="flex items-center gap-x-1">
                <PlusIcon /> Detalhes
              </span>
            )}
          </Button>

          {showDetails && (
            <div className="mt-4 space-y-2">
              <DetailField label="CPF" value={selectedClient.CPF} />
              {selectedClient.IE && (
                <DetailField
                  label="IE"
                  value={selectedClient.IE.toString() || "Não informado"}
                />
              )}
              <DetailField label="CEP" value={selectedClient.cep.toString()} />
              <DetailField
                label="Complemento"
                value={selectedClient.complement}
              />
              {selectedClient.fantasyName && (
                <DetailField
                  label="Nome Fantasia"
                  value={selectedClient.fantasyName || "Não informado"}
                />
              )}
              <DetailField
                label="IBGE"
                value={selectedClient.ibge.toString()}
              />
              <DetailField label="Logradouro" value={selectedClient.logra} />
              <DetailField label="Bairro" value={selectedClient.neighborhood} />
              <DetailField label="Telefone" value={selectedClient.phone} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente para exibir detalhes
const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}:</label>
    <input
      type="text"
      value={value}
      readOnly
      className="w-full border border-gray-300 rounded-md p-2"
    />
  </div>
);

export default Clients;
