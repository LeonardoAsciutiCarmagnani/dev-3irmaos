import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { User, Trash2, Eye, KeyRoundIcon, CheckCircleIcon } from "lucide-react";
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

  useEffect(() => {
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

    try {
      const response = await axios.delete(
        `https://us-central1-server-kyoto.cloudfunctions.net/api/v1/clientes/${confirmDelete.user_id}`
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
        console.log("Cliente excluído com sucesso!");
      } else {
        console.error("Erro inesperado:", response.data.message);
        setError(response.data.message || "Erro ao excluir cliente.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erro na solicitação:", error.response?.data.message);
        setError(
          error.response?.data.message || "Erro ao comunicar com o servidor."
        );
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
    }
  };

  const closeDialog = () => {
    setResetPasswordError("");
    setPasswordSucess(null);
    setSelectedClient(null);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 min-h-screen">
      <div className="w-full mb-4">
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
          {/* Lista de Clientes */}
          {filteredClientes.length === 0 ? (
            <p className="text-gray-500">Nenhum cliente encontrado.</p>
          ) : (
            <ul className="w-full space-y-4">
              {filteredClientes.map((cliente) => (
                <li
                  key={cliente.user_id}
                  className="flex items-center justify-between bg-white shadow rounded-lg p-4"
                >
                  <div className="flex items-center space-x-4">
                    <User className="w-6 h-6 text-gray-500" />
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
                        {cliente.priceListName && (
                          <Badge className="bg-cyan-500">
                            {cliente.priceListName}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedClient(cliente)}
                    >
                      <Eye size={15} />
                    </Button>
                    {cliente.type_user === "cliente" && (
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => setConfirmDelete(cliente)}
                      >
                        <Trash2 className="w-5 h-5" />
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
          <p>
            <strong>Lista de preços:</strong> {selectedClient?.priceListName}
          </p>
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
