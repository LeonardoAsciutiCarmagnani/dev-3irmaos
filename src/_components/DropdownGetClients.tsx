/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
// import { PlusIcon, MinusIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";
import { ClientData, EnderecoDeEntrega } from "./PostSaleOrder";
import { BadgeDollarSignIcon, DollarSignIcon } from "lucide-react";
// import InputMask from "react-input-mask";

export interface Client {
  id_priceList?: string;
  type_user: string;
  user_IE?: string;
  CEP: number;
  user_complement?: string;
  user_fantasyName?: string;
  IBGE: number;
  logradouro: string;
  user_id: string;
  name: string;
  email: string;
  bairro: string;
  phoneNumber: string;
  numberHouse: number;
  cpf: string;
  creditos?: number;
}

interface ClientsProps {
  onSelectClient: (data: {
    clientData: ClientData | null;
    enderecoDeEntrega: EnderecoDeEntrega | null;
    priceListId: string;
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
        setClientes(
          clientesList.filter((client) => client.type_user === "common")
        );
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
        documento: client.cpf,
        email: client.email,
        inscricaoEstadual: client.user_IE || "",
        nomeDoCliente: client.name,
        nomeFantasia: client.user_fantasyName || "",
      };

      const enderecoDeEntrega: EnderecoDeEntrega = {
        bairro: client.bairro,
        cep: client.CEP.toString(),
        codigoIbge: client.IBGE,
        complemento: client.user_complement || "",
        logradouro: client.logradouro,
        numero: client.numberHouse,
      };

      setSelectedClient(client);
      onSelectClient({
        enderecoDeEntrega,
        priceListId: client.id_priceList || "",
        clientData,
      });
      console.log(
        "Lista de preço do cliente selecionado:",
        client.id_priceList,
        "length:",
        client.id_priceList?.length
      );
    } else {
      setSelectedClient(null);
      onSelectClient({
        enderecoDeEntrega: null,
        priceListId: "",
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
              className="p-2 hover:bg-gray-100 antialiased text-xs font-semibold"
            >
              {cliente.name.toLocaleUpperCase()} - {cliente.cpf}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* 
      {selectedClient && (
        <div className="mt-4 space-y-2">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="link"
            className="text-blue-500 hover:underline"
            type="button"
          > */}
      {/* {showDetails ? (
              <span className="flex items-center gap-x-1">
                <MinusIcon /> Ocultar Detalhes
              </span>
            ) : (
              <span className="flex items-center gap-x-1">
                <PlusIcon /> Detalhes
              </span>
            )} */}
      {/* </Button> */}

      {/* {showDetails && (
            <div className="mt-4 space-y-1 flex flex-col">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Inscrição Estadual
                </label>
                {selectedClient.user_IE && (
                  <InputMask
                    mask={"999.999.999.999"}
                    readOnly
                    defaultValue={selectedClient.user_IE.toString() || ""}
                    className="p-2 border border-gray-300 rounded-md w-full text-sm"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  CEP
                </label>
                <InputMask
                  readOnly
                  mask={"99999-999"}
                  defaultValue={selectedClient.CEP.toString()}
                  className="p-2 border border-gray-300 rounded-md w-full text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Endereço
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    readOnly
                    defaultValue={selectedClient.logradouro || ""}
                    className="p-2 border border-gray-300 rounded-md w-full text-sm"
                  />
                  <input
                    readOnly
                    defaultValue={selectedClient.bairro || ""}
                    className="p-2 border border-gray-300 rounded-md w-full text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Número e Complemento
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    readOnly
                    defaultValue={
                      selectedClient.numberHouse.toString() || ""
                    }
                    className="p-2 border border-gray-300 rounded-md w-full text-sm"
                  />
                  <input
                    readOnly
                    defaultValue={selectedClient.user_complement || ""}
                    className="p-2 border border-gray-300 rounded-md w-full text-sm"
                  />
                </div>
              </div>

              {selectedClient.user_fantasyName && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Nome Fantasia
                  </label>
                  <input
                    readOnly
                    defaultValue={selectedClient.user_fantasyName || ""}
                    className="p-2 border border-gray-300 rounded-md w-full text-sm"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Código IBGE
                </label>
                <input
                  readOnly
                  defaultValue={selectedClient.IBGE.toString() || ""}
                  className="p-2 border border-gray-300 rounded-md w-full text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">
                  Telefone
                </label>
                <input
                  readOnly
                  defaultValue={selectedClient.user_phone || ""}
                  className="p-2 border border-gray-300 rounded-md w-full text-sm"
                />
              </div>
            </div>
          )} */}
      {/* </div> */}
      {/* )} */}
      <div className="flex gap-x-2 py-2 antialiased font-semibold text-green-600">
        {selectedClient && (
          <span className="flex items-center gap-x-1">
            <BadgeDollarSignIcon />
            {selectedClient?.creditos}
          </span>
        )}
      </div>
    </div>
  );
};

export default Clients;
