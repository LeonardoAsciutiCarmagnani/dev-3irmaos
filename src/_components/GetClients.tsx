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
  CheckCircleIcon,
  SquarePenIcon,
  PlusIcon,
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
  const [resetPasswordError, setResetPasswordError] = useState("");
  const [resetPasswordSucess, setPasswordSucess] = useState<React.ReactNode>();
  const db = getFirestore();
  const { priceLists, fetchPriceLists } = useZustandContext();
  const [selectPriceList, setSelectPriceList] = useState({ id: "", name: "" });
  const [isUpdatePriceList, setIsUpdatePriceList] = useState(false);

  useEffect(() => {
    fetchPriceLists();
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
    fetchClientes();
  }, [db]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilteredClientes(
      clientes.filter((cliente) =>
        cliente.user_name.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    console.log("Deletando o id:", confirmDelete.user_id);
    try {
      const response = await axios.delete(
        `https://us-central1-kyoto-f1764.cloudfunctions.net/api/v1/clients/${confirmDelete.user_id}`
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

  const handleResetPassword = async () => {
    if (selectedClient) {
      await sendPasswordResetEmail(auth, selectedClient.user_email);
      console.log(selectedClient.user_email);
      setPasswordSucess(<CheckCircleIcon size={30} />);
    } else {
      setResetPasswordError("Ocorreu um erro.");
      setPasswordSucess(null);
      toastError("Ocorreu um erro ao redefinir senha.");
    }
  };

  const closeDialog = () => {
    setResetPasswordError("");
    setPasswordSucess(null);
    setSelectedClient(null);
    setIsUpdatePriceList(false);
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
                    className="flex items-center justify-between bg-white shadow rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <User
                        className={`w-8 h-8 ${
                          cliente.type_user === "adm"
                            ? "text-red-500"
                            : "text-amber-500"
                        }`}
                      />
                      <div>
                        <p className="text-gray-800 font-semibold">
                          {cliente.user_name}
                        </p>
                        <div className="flex space-x-2">
                          <Badge
                            variant={`${
                              cliente.type_user == "adm"
                                ? "destructive"
                                : "default"
                            }`}
                          >
                            {cliente.type_user.toUpperCase()}
                          </Badge>
                          {cliente.type_user !== "adm" && (
                            <Badge className="bg-amber-500">
                              {cliente.priceListName.toUpperCase() ||
                                "lista padrão".toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-x-4 ml-10">
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedClient(cliente)}
                        className="p-0"
                      >
                        <Eye size={15} />
                      </Button>
                      {cliente.type_user === "cliente" && (
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>

          <p>
            <strong>Nome:</strong> {selectedClient?.user_name}
          </p>
          <p>
            <strong>Email:</strong> {selectedClient?.user_email}
          </p>
          <p>
            <strong>Telefone:</strong> {selectedClient?.user_phone}
          </p>
          <p>
            <strong>CEP:</strong> {selectedClient?.user_cep}
          </p>
          <p>
            <strong>Bairro:</strong> {selectedClient?.user_neighborhood}
          </p>
          <p>
            <strong>Rua:</strong> {selectedClient?.user_logradouro}
          </p>
          <div>
            <strong>Lista de preços:</strong>
            <div className="flex gap-x-2">
              {selectedClient?.priceListName || "Não atribuída"}
              {selectedClient?.type_user !== "adm" && (
                <SquarePenIcon
                  color="#3b82f6"
                  size={20}
                  onClick={() => setIsUpdatePriceList(true)}
                />
              )}
            </div>
          </div>
          {isUpdatePriceList && selectedClient?.type_user !== "adm" && (
            <div className="flex gap-x-4">
              <Select
                onValueChange={(value) => {
                  if (value === "default") {
                    setSelectPriceList({ id: "", name: "Lista padrão" });
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
              <Button onClick={handleUpdatePriceList}>
                <CheckCircleIcon className="size-8" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-x-2">
            <button
              className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={handleResetPassword}
            >
              <KeyRoundIcon className="w-5 h-5 mr-2" />
              <span>Redefinir Senha</span>
            </button>
            {resetPasswordError && (
              <p className="text-red-500 mt-2">{resetPasswordError}</p>
            )}
            {resetPasswordSucess && (
              <p className="text-green-500 mt-2">{resetPasswordSucess}</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={closeDialog} variant="ghost">
              Fechar
            </Button>
          </DialogFooter>
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
