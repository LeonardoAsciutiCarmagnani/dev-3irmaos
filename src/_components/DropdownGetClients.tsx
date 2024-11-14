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
import { ClientData, EnderecoDeEntrega } from "./PostSaleOrder";

interface Client {
  id_priceList: string;
  type_user: string;
  user_IE?: string;
  user_cep: number;
  user_complement?: string;
  user_fantasyName?: string;
  user_ibgeCode: number;
  user_logradouro: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_neighborhood: string;
  user_phone: string;
  user_houseNumber: number;
  user_CPF: string;
}

interface ClientsProps {
  onSelectClient: (data: {
    clientData: ClientData | null;
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
        const clientesList = clientesSnapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Client, "user_id">;
          return { user_id: doc.id, ...data };
        });
        console.log(clientesList);
        setClientes(clientesList);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      }
    };

    fetchClientes();
  }, [db]);

  const handleSelectClient = (id: string) => {
    const client = clientes.find((cliente) => cliente.user_id === id) || null;

    if (client) {
      const clientData: ClientData = {
        documento: client.user_CPF,
        email: client.user_email,
        inscricaoEstadual: client.user_IE || "",
        nomeDoCliente: client.user_name,
        nomeFantasia: client.user_fantasyName || "",
      };

      const enderecoDeEntrega: EnderecoDeEntrega = {
        bairro: client.user_neighborhood,
        cep: client.user_cep.toString(),
        codigoIbge: client.user_ibgeCode,
        complemento: client.user_complement || "",
        logradouro: client.user_logradouro,
        numero: client.user_houseNumber,
      };

      setSelectedClient(client);
      onSelectClient({
        enderecoDeEntrega,
        priceListId: client.id_priceList,
        clientData,
      });
    } else {
      setSelectedClient(null);
      onSelectClient({
        enderecoDeEntrega: null,
        priceListId: null,
        clientData: null,
      });
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
              key={cliente.user_id}
              value={cliente.user_id}
              className="p-2 hover:bg-gray-100"
            >
              {cliente.user_name}
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
              <DetailField label="CPF" value={selectedClient.user_CPF} />
              {selectedClient.user_IE && (
                <DetailField
                  label="IE"
                  value={selectedClient.user_IE.toString() || "Não informado"}
                />
              )}
              <DetailField
                label="CEP"
                value={selectedClient.user_cep.toString()}
              />
              <DetailField
                label="Complemento"
                value={selectedClient.user_complement || "Não informado"}
              />
              {selectedClient.user_fantasyName && (
                <DetailField
                  label="Nome Fantasia"
                  value={selectedClient.user_fantasyName || "Não informado"}
                />
              )}
              <DetailField
                label="IBGE"
                value={selectedClient.user_ibgeCode.toString()}
              />
              <DetailField
                label="Bairro"
                value={selectedClient.user_neighborhood}
              />
              <DetailField
                label="Logradouro"
                value={selectedClient.user_logradouro}
              />
              <DetailField
                label="Logradouro"
                value={selectedClient.user_houseNumber.toString()}
              />
              <DetailField label="Telefone" value={selectedClient.user_phone} />
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
