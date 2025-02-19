import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  User,
  Trash2,
  Eye,
  KeyRoundIcon,
  PlusIcon,
  PencilIcon,
  CheckIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import ToastNotifications from "./Toasts";
import Sidebar from "./Sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useZustandContext } from "@/context/cartContext";
import { Link } from "react-router-dom";
import apiBaseUrl from "@/lib/apiConfig";
import MaskedInput from "react-text-mask";
import useUserStore from "@/context/UserStore";

interface ClientInFirestore {
  id_priceList: string;
  priceListName: string;
  type_user: string;
  user_IE?: number;
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

export const Clients = () => {
  const { toastSuccess, toastError } = ToastNotifications();
  const [clientes, setClientes] = useState<ClientInFirestore[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<ClientInFirestore[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] =
    useState<ClientInFirestore | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ClientInFirestore | null>(
    null
  );

  const db = getFirestore();
  const { priceLists, fetchPriceLists } = useZustandContext();
  const [selectPriceList, setSelectPriceList] = useState({ id: "", name: "" });
  const [isUpdatePriceList, setIsUpdatePriceList] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { fetchTypeUser, fetchSaveUsername } = useUserStore();

  const initialClient: ClientInFirestore = selectedClient
    ? {
        id_priceList: selectedClient?.id_priceList,
        priceListName: selectedClient?.priceListName,
        type_user: selectedClient?.type_user,
        user_IE: selectedClient?.user_IE,
        user_cep: selectedClient?.user_cep,
        user_complement: selectedClient?.user_complement,
        user_fantasyName: selectedClient?.user_fantasyName,
        user_name: selectedClient?.user_name,
        user_email: selectedClient?.user_email,
        user_phone: selectedClient?.user_phone,
        user_CPF: selectedClient?.user_CPF,
        user_ibgeCode: selectedClient?.user_ibgeCode,
        user_logradouro: selectedClient?.user_logradouro,
        user_neighborhood: selectedClient?.user_neighborhood,
        user_houseNumber: selectedClient?.user_houseNumber,
        user_id: selectedClient?.user_id,
      }
    : {
        id_priceList: "",
        priceListName: "",
        type_user: "",
        user_IE: 0,
        user_cep: 0,
        user_complement: "",
        user_fantasyName: "",
        user_name: "",
        user_email: "",
        user_phone: "",
        user_CPF: "",
        user_ibgeCode: 0,
        user_logradouro: "",
        user_neighborhood: "",
        user_houseNumber: 0,
        user_id: "",
      };

  const [editedClient, setEditedClient] =
    useState<ClientInFirestore>(initialClient);

  const fetchClientes = async () => {
    try {
      const clientesCollection = collection(db, "clients");
      const clientesSnapshot = await getDocs(clientesCollection);
      const clientesList = clientesSnapshot.docs.map((doc) => {
        const data = doc.data() as Omit<ClientInFirestore, "user_id">;
        return { user_id: doc.id, ...data };
      });
      setClientes(clientesList);
      setFilteredClientes(clientesList);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setError("Erro ao buscar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
    fetchPriceLists();
    fetchTypeUser();
    fetchSaveUsername();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db]);

  useEffect(() => {
    if (selectedClient) {
      const newClient: ClientInFirestore = {
        id_priceList: selectedClient.id_priceList || "",
        priceListName: selectedClient.priceListName || "",
        type_user: selectedClient.type_user || "",
        user_IE: selectedClient.user_IE || 0,
        user_cep: selectedClient.user_cep || 0,
        user_complement: selectedClient.user_complement || "",
        user_fantasyName: selectedClient.user_fantasyName || "",
        user_name: selectedClient.user_name || "",
        user_email: selectedClient.user_email || "",
        user_phone: selectedClient.user_phone || "",
        user_CPF: selectedClient.user_CPF || "",
        user_ibgeCode: selectedClient.user_ibgeCode || 0,
        user_logradouro: selectedClient.user_logradouro || "",
        user_neighborhood: selectedClient.user_neighborhood || "",
        user_houseNumber: selectedClient.user_houseNumber || 0,
        user_id: selectedClient.user_id || "",
      };
      setEditedClient(newClient);
    }
  }, [selectedClient]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilteredClientes(
      clientes.filter((cliente) =>
        cliente.user_name.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const fetchCEP = async (cep: string) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/CEP`, { cep });

      const enderecoData = response.data;

      if (!enderecoData) {
        toastError("Erro ao buscar endereço, tente novamente");
      } else {
        toastSuccess("Endereço encontrado com sucesso!");
        setEditedClient((prev) => ({
          ...prev,
          user_ibgeCode: enderecoData.ibge,
          user_logradouro: enderecoData.logradouro,
          user_neighborhood: enderecoData.bairro,
          user_houseNumber: 0,
        }));
      }

      console.log("Endereço:", enderecoData);
    } catch (error) {
      console.error("Erro ao buscar o endereço:", error);
      toastError("Por favor, insira um CEP válido e tente novamente.");
    }
  };

  const handleFetchCEP = async (cep: string) => {
    console.log("Valor do cep:" + cep);
    const rawCep = cep.replace(/[^\d]/g, "");
    console.log("RawCep:", rawCep);
    if (!rawCep || rawCep.length !== 8) {
      toastError("O CEP deve conter 8 dígitos.");
      return;
    }
    try {
      await fetchCEP(cep);
    } catch (error) {
      console.error("Erro ao buscar o endereço:", error);
      toastError("Erro ao buscar o endereço.");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    console.log("Deletando o id:", confirmDelete.user_id);
    try {
      const response = await axios.delete(
        `${apiBaseUrl}/clients/${confirmDelete.user_id}`
      );

      if (response.status === 200) {
        setClientes(
          clientes.filter((client) => client.user_id !== confirmDelete.user_id)
        );
        setFilteredClientes(
          filteredClientes.filter(
            (client) => client.user_id !== confirmDelete.user_id
          )
        );
        setConfirmDelete(null);
        toastSuccess("Cliente excluido com sucesso!");
      } else {
        console.error("Erro inesperado:", response.data.message);
        setError(response.data.message || "Erro ao excluir cliente.");
        toastError("Erro ao excluir cliente.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erro na solicitação:", error.response?.data.message);
        toastError(error.response?.data.message || "Erro ao excluir cliente.");
        setError("Erro ao comunicar com o servidor.");
      } else {
        console.error("Erro desconhecido:", error);
        setError("Erro inesperado. Por favor, tente novamente.");
      }
    }
  };

  const handleUpdateClient = async (
    client_id: string,
    updatedData: ClientInFirestore
  ) => {
    event?.preventDefault();
    console.log("Fazendo update no cliente, ID: ", client_id);
    console.log("Novos dados: ", updatedData);
    try {
      const response = await axios.put(`${apiBaseUrl}/clients/${client_id}`, {
        ...updatedData,
      });

      if (response.status === 200) {
        console.log(response.data);
        toastSuccess(
          `Cliente ${selectedClient?.user_name} atualizado com sucesso.`
        );
        closeDialog();
        fetchClientes();
      } else {
        console.error("Erro inesperado:", response.data.message);
        setError(response.data.message || "Erro ao alterar cliente.");
        toastError("Erro ao atualizar cliente.");
        closeDialog();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erro na solicitação:", error.response?.data.message);
        toastError(error.response?.data.message || "Erro ao excluir cliente.");
        setError("Erro ao comunicar com o servidor.");
        closeDialog();
      } else {
        console.error("Erro desconhecido:", error);
        setError("Erro inesperado. Por favor, tente novamente.");
      }
    }
  };

  const handleResetPassword = async () => {
    if (selectedClient) {
      await sendPasswordResetEmail(auth, selectedClient.user_email);
      console.log(selectedClient.user_email);
      toastSuccess(
        `Um e-mail de redefinição de senha foi enviado para ${selectedClient.user_email}.`
      );
    } else {
      toastError("Ocorreu um erro ao redefinir senha.");
    }
  };

  const handleInputChange = (
    key: keyof ClientInFirestore,
    value: string | number
  ) => {
    setEditedClient((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const closeDialog = () => {
    setSelectedClient(null);
    setIsUpdatePriceList(false);
    setIsEditMode(false);
  };

  const handleUpdatePriceList = async () => {
    if (!selectedClient) {
      toastError("Selecione um cliente.");
      return;
    }

    const priceListIdToSave =
      selectPriceList.id === "default" ? "" : selectPriceList.id;

    try {
      const clientRef = doc(db, "clients", selectedClient.user_id);
      await updateDoc(clientRef, {
        id_priceList: priceListIdToSave,
        priceListName: selectPriceList.name,
      });

      const updatedClientes = clientes.map((client) =>
        client.user_id === selectedClient.user_id
          ? {
              ...client,
              id_priceList: priceListIdToSave,
              priceListName: selectPriceList.name,
            }
          : client
      );
      setClientes(updatedClientes);
      setFilteredClientes(updatedClientes);
      closeDialog();
      toastSuccess("Lista de preços atualizada com sucesso!");
      setIsUpdatePriceList(false);
    } catch (error) {
      closeDialog();
      console.error("Erro ao atualizar a lista de preços:", error);
      toastError("Erro ao atualizar a lista de preços.");
    }
  };

  const handleSubmit = () => {
    if (selectedClient) {
      handleUpdateClient(selectedClient.user_id, editedClient);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 min-h-screen ">
      <div className="w-full mb-4 flex items-center">
        <Sidebar />
        <Input
          placeholder="Buscar cliente..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
        />
      </div>

      {/* Loading e Mensagem de Erro */}
      {loading ? (
        <p className="text-gray-500">Carregando clientes...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className=" w-full flex justify-end mb-3">
            <Link
              to="/register"
              className="bg-green-400 p-2 flex items-center justify-center rounded-md text-sm text-white gap-x-[0.2rem] w-fit"
            >
              <PlusIcon size={18} />
              Novo cliente
            </Link>
          </div>
          {/* Lista de Clientes */}
          {filteredClientes.length === 0 ? (
            <p className="text-gray-500">Nenhum cliente encontrado.</p>
          ) : (
            <ul className="w-full space-y-4">
              {filteredClientes
                .sort((a, b) => {
                  // Primeiro, ordena por `type_user` (adm primeiro)
                  if (a.type_user === "adm" && b.type_user !== "adm") return -1;
                  if (a.type_user !== "adm" && b.type_user === "adm") return 1;

                  // Depois, ordena por `user_name` em ordem alfabética
                  return a.user_name.localeCompare(b.user_name);
                })
                .map((cliente) => (
                  <li
                    key={cliente.user_id}
                    className="flex items-center justify-between bg-white shadow rounded-lg p-4 pl-2"
                  >
                    <div className="flex items-center space-x-2">
                      <User
                        className="w-8 h-8 
                          cliente.type_user text-store-secondary"
                      />
                      <div>
                        <p className="text-gray-800 font-semibold">
                          {cliente.user_name}
                        </p>
                        <div className="flex space-x-2">
                          <Badge
                            variant={`${
                              cliente.type_user === "adm"
                                ? "destructive"
                                : "default"
                            }`}
                            className="text-xs"
                          >
                            {cliente.type_user.toUpperCase()}
                          </Badge>
                          {cliente.type_user === "cliente" && (
                            <Badge className="bg-store-secondary text-nowrap text-[0.7rem] w-fit">
                              {cliente.priceListName.toUpperCase() ||
                                "lista padrão".toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedClient(cliente)}
                        className="p-0"
                      >
                        <Eye size={15} />
                      </Button>
                      {cliente.type_user !== "adm" && (
                        <Button
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 p-0"
                          onClick={() => setConfirmDelete(cliente)}
                        >
                          <Trash2 className="w-5 h-5 p-0" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedClient} onOpenChange={closeDialog}>
        <DialogContent className="p-3 bg-gradient-to-r from-gray-100 via-white to-gray-100 rounded-lg shadow-xl max-w-3xl mx-auto h-fit">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              Detalhes do Cliente
              {!isEditMode ? (
                <div className="flex space-x-2 items-center justify-end">
                  <Button
                    onClick={() => setIsEditMode(true)}
                    className="bg-blue-500 hover:bg-blue-400"
                  >
                    <PencilIcon size={18} />
                    Editar
                  </Button>
                  <Button
                    onClick={closeDialog}
                    variant={"destructive"}
                    className="w-fit justify-end"
                  >
                    Fechar
                  </Button>
                </div>
              ) : null}
            </DialogTitle>
          </DialogHeader>
          {isEditMode ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <h2 className="font-semibold text-md text-store-secondary">
                Informações
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  type="text"
                  placeholder="Nome do cliente"
                  value={editedClient.user_name || ""}
                  onChange={(e) =>
                    handleInputChange("user_name", e.target.value)
                  }
                  required
                />

                <Input
                  type="email"
                  placeholder="E-mail do cliente"
                  value={editedClient.user_email || ""}
                  onChange={(e) =>
                    handleInputChange("user_email", e.target.value)
                  }
                  required
                />
                <MaskedInput
                  mask={[
                    "(",
                    /\d/,
                    /\d/,
                    ")",
                    " ",
                    /\d/,
                    /\d/,
                    /\d/,
                    /\d/,
                    /\d/,
                    "-",
                    /\d/,
                    /\d/,
                    /\d/,
                    /\d/,
                  ]}
                  type="tel"
                  required
                  placeholder="Telefone do cliente"
                  value={editedClient.user_phone}
                  className="p-1.5 rounded-sm bg-gray-50 text-sm"
                  onChange={(e) =>
                    handleInputChange("user_phone", e.target.value)
                  }
                />
                <MaskedInput
                  mask={[
                    /\d/,
                    /\d/,
                    /\d/,
                    ".",
                    /\d/,
                    /\d/,
                    /\d/,
                    ".",
                    /\d/,
                    /\d/,
                    /\d/,
                    "-",
                    /\d/,
                    /\d/,
                  ]}
                  type="text"
                  placeholder="CPF/CNPJ do cliente"
                  value={editedClient.user_CPF || ""}
                  onChange={(e) =>
                    handleInputChange("user_CPF", e.target.value)
                  }
                  className="p-1.5 rounded-sm bg-gray-50 text-sm"
                  required
                />
                <MaskedInput
                  mask={[
                    /\d/,
                    /\d/,
                    /\d/,
                    ".",
                    /\d/,
                    /\d/,
                    /\d/,
                    ".",
                    /\d/,
                    /\d/,
                    /\d/,
                    ".",
                    /\d/,
                    /\d/,
                    /\d/,
                  ]}
                  type="number"
                  placeholder="Inscrição Estadual do cliente"
                  value={editedClient.user_IE || ""}
                  onChange={(e) => handleInputChange("user_IE", e.target.value)}
                  className="p-1.5 rounded-sm bg-gray-50 text-sm"
                />
                <Input
                  type="text"
                  placeholder="Nome fantasia do cliente"
                  value={editedClient.user_fantasyName || ""}
                  onChange={(e) =>
                    handleInputChange("user_fantasyName", e.target.value)
                  }
                />
              </div>
              <div>
                <h1 className="font-semibold text-md text-store-secondary">
                  Endereço
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-[16px]">
                  <MaskedInput
                    mask={[/\d/, /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/]}
                    type="text"
                    className="text-sm p-1.5 rounded-sm bg-gray-50"
                    placeholder="CEP"
                    value={editedClient.user_cep || ""}
                    onChange={(e) =>
                      handleInputChange("user_cep", e.target.value)
                    }
                    onBlur={(e) => handleFetchCEP(e.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="Logradouro"
                    value={editedClient.user_logradouro || ""}
                    onChange={(e) =>
                      handleInputChange("user_logradouro", e.target.value)
                    }
                    readOnly
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Bairro"
                    value={editedClient.user_neighborhood || ""}
                    onChange={(e) =>
                      handleInputChange("user_neighborhood", e.target.value)
                    }
                    readOnly
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Número"
                    value={editedClient.user_houseNumber || ""}
                    onChange={(e) =>
                      handleInputChange("user_houseNumber", e.target.value)
                    }
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Complemento"
                    value={editedClient.user_complement || ""}
                    onChange={(e) =>
                      handleInputChange("user_complement", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Código IBGE"
                    value={editedClient.user_ibgeCode || ""}
                    onChange={(e) =>
                      handleInputChange("user_ibgeCode", e.target.value)
                    }
                    readOnly
                    required
                  />
                </div>
              </div>
              <DialogFooter className="flex flex-row justify-end gap-x-3 items-center">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsEditMode(false);
                    if (selectedClient) {
                      setEditedClient({ ...selectedClient });
                    }
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={() => {}}
                  className="bg-green-500 hover:bg-green-400"
                >
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
                <div className=" flex flex-col p-1.5 h-fit">
                  <h1 className="text-store-secondary w-fit border-b-[0.2rem] border-dashed border-store-secondary font-semibold">
                    Informações
                  </h1>
                  <p className="text-sm text-gray-600">
                    <strong className="text-gray-800">Nome:</strong>{" "}
                    {selectedClient?.user_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong className="text-gray-800">Email:</strong>{" "}
                    {selectedClient?.user_email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong className="text-gray-800">Telefone:</strong>{" "}
                    {selectedClient?.user_phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong className="text-gray-800">CPF:</strong>{" "}
                    {selectedClient?.user_CPF}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong className="text-gray-800">
                      Inscrição Estadual:
                    </strong>{" "}
                    {selectedClient?.user_IE || "Não informado"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong className="text-gray-800">Nome Fantasia:</strong>{" "}
                    {selectedClient?.user_fantasyName || "Não informado"}
                  </p>
                </div>
              </div>

              <div className="space-y-1 h-fit">
                <div>
                  <h1 className="font-semibold text-md text-store-secondary w-fit border-b-[0.2rem] border-dashed border-store-secondary">
                    Endereço
                  </h1>
                </div>
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-800">CEP:</strong>{" "}
                  {selectedClient?.user_cep}
                </p>
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-800">Bairro:</strong>{" "}
                  {selectedClient?.user_neighborhood}
                </p>
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-800">Rua:</strong>{" "}
                  {selectedClient?.user_logradouro}
                </p>
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-800">Número:</strong>{" "}
                  {selectedClient?.user_houseNumber}
                </p>
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-800">Complemento:</strong>{" "}
                  {selectedClient?.user_complement || "Não informado"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-800">Código IBGE:</strong>{" "}
                  {selectedClient?.user_ibgeCode}
                </p>
              </div>

              <div className=" flex items-center gap-x-3 h-fit">
                <strong className="text-store-secondary w-fit border-b-[0.2rem] border-dashed border-store-secondary text-nowrap">
                  Lista de preços:
                </strong>
                <div className="flex gap-x-1 pt-2 items-center">
                  <span className="px-2 py-1 text-xs rounded-full bg-store-primary text-black font-semibold w-fit text-nowrap">
                    {selectedClient?.priceListName || "Lista padrão"}
                  </span>
                  {selectedClient?.type_user === "cliente" && (
                    <span className="p-1 rounded-full border-[0.13rem] border-blue-500 relative bottom-[0.9rem] right-[0.3rem]">
                      <PencilIcon
                        className="text-blue-400 "
                        size={14}
                        onClick={() => setIsUpdatePriceList(!isUpdatePriceList)}
                      />
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
          {!isEditMode ? (
            <>
              {isUpdatePriceList && selectedClient?.type_user === "cliente" && (
                <div className="flex gap-x-4 ">
                  <Select
                    onValueChange={(value) => {
                      if (value === "default") {
                        setSelectPriceList({
                          id: "",
                          name: "Lista padrão",
                        });
                      } else {
                        const selected = priceLists.find(
                          (item) => item.id === value
                        );
                        if (selected) {
                          setSelectPriceList(selected);
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Lista de preços" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Lista padrão</SelectItem>
                      {priceLists.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleUpdatePriceList}
                    className="bg-green-400"
                  >
                    <CheckIcon size={30} className="text-gray-100" />
                  </Button>
                </div>
              )}
            </>
          ) : null}
          {!isEditMode ? (
            <div className="flex items-center gap-x-2 justify-start">
              <button
                className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 border-2 border-store-secondary "
                onClick={handleResetPassword}
              >
                <KeyRoundIcon className="w-5 h-5 mr-2 text-store-secondary" />
                <span className="text-xs">Redefinir Senha</span>
              </button>
            </div>
          ) : null}

          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Cliente</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza de que deseja excluir o cliente{" "}
            {confirmDelete?.user_name}?
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
