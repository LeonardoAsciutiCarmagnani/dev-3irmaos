/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  flexRender,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  collection,
  doc,
  updateDoc,
  getDocs,
  type OrderByDirection,
  query,
  where,
} from "firebase/firestore";
import {
  FiAlertCircle,
  FiArrowUp,
  FiArrowDown,
  FiSearch,
} from "react-icons/fi";

// import Loader from "@/_components/Loader/loader";
// import GetClients from "@/_components/CreateOrderADM/getClients";
import type { Client } from "@/interfaces/Client";
import { auth, db } from "@/_components/Utils/FirebaseConfig";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cpf, cnpj } from "cpf-cnpj-validator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { InfoIcon, Loader2 } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";

import { api } from "@/lib/axios";
import Loader from "../Loader/loader";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";

const EditClientFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("E-mail inválido").trim().toLowerCase(),
  document: z.string().refine((value) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.length === 11 ? cpf.isValid(cleaned) : cnpj.isValid(cleaned);
  }, "documento inválido."),
  phone: z.string().min(15, "Telefone inválido."),
  ie: z.string().optional(),
  fantasyName: z.string().optional(),
  address: z.object({
    cep: z.string().length(9, "CEP inválido."),
    street: z.string().min(3, "Logradouro inválido."),
    number: z.coerce.number().min(1, "Número inválido."),
    neighborhood: z.string().min(2, "Bairro inválido."),
    city: z.string().min(2, "Cidade inválida."),
    state: z.string().length(2, "UF inválida."),
    ibge: z.string().min(7, "Código IBGE inválido."),
  }),
  minValue: z.number(),
});

type EditClientFormSchemaType = z.infer<typeof EditClientFormSchema>;

const ClientsTable = () => {
  const [showCardClient, setShowCardClient] = useState<string | null>(null);
  const [editedClient, setEditedClient] = useState<Client>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [sorting, setSorting] = useState<{
    column: string;
    direction: OrderByDirection;
  }>({
    column: "createdAt",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [originalData, setOriginalData] = useState<Client[]>([]);

  const [email, setemail] = useState<string>("");
  const [isSubmittingResetForPassword, setIsSubmittingResetForPassword] =
    useState<boolean>(false);

  const {
    setValue,
    register,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<EditClientFormSchemaType>({
    resolver: zodResolver(EditClientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      document: "",
      phone: "",
      ie: "",
      fantasyName: "",
      address: {
        cep: "",
        street: "",
        number: 0,
        neighborhood: "",
        city: "",
        state: "",
        ibge: "",
      },
    },
  });
  /* Quando eu tiver o editedClient chama esse useEffect para preencher os campos */
  useEffect(() => {
    if (editedClient) {
      reset({
        name: editedClient?.name,
        email: editedClient?.email,
        document: editedClient?.document,
        phone: editedClient?.phone,
        ie: editedClient?.ie,
        fantasyName: editedClient?.fantasyName,
        address: {
          cep: editedClient?.address.cep,
          street: editedClient?.address.street,
          number: editedClient?.address.number,
          neighborhood: editedClient?.address.neighborhood,
          city: editedClient?.address.city,
          state: editedClient?.address.state,
          ibge: editedClient?.address.ibge,
        },
      });
    }
  }, [editedClient, reset]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return originalData;
    return originalData.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [originalData, searchTerm]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const clientsCollection = collection(db, "clients");
      const clientsSnapshot = await getDocs(clientsCollection);
      const clientsList = clientsSnapshot.docs.map((doc) => ({
        ...(doc.data() as Client),
        clientId: doc.id,
      }));

      setOriginalData(clientsList);
    } catch (err) {
      setError("Falha ao buscar os clientes.");
      console.error("Firestore Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [sorting]);

  const handleSorting = (columnId: string) => {
    setSorting((prev) => ({
      column: columnId,
      direction:
        prev.column === columnId && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const sortedData = useMemo<Client[]>(() => {
    if (!sorting.column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const column = sorting.column as keyof Client;
      const aValue = a[column];
      const bValue = b[column];

      // Trata valores undefined
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sorting.direction === "asc" ? 1 : -1;
      if (bValue === undefined) return sorting.direction === "asc" ? -1 : 1;

      // Ordenação numérica específica para productId
      if (column === "name") {
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sorting.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
      }

      // Ordenação genérica para outros tipos
      if (aValue < bValue) return sorting.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sorting.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sorting.column, sorting.direction]);

  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        header: "Nome",
        accessorKey: "name",
        cell: ({ row }) => row.getValue("name"),
        meta: {
          sortable: true,
        },
      },
      {
        header: "Email",
        accessorKey: "email",
        cell: ({ row }) => row.getValue("email"),
      },
      {
        header: "Documento",
        accessorKey: "document",
        cell: ({ row }) => row.getValue("document") || "-",
      },
      {
        header: "Cidade/UF",
        accessorKey: "city",
        cell: ({ row }) => row.getValue("city") || "-",
      },
      {
        header: "Telefone",
        accessorKey: "phone",
        cell: ({ row }) => row.getValue("phone") || "-",
      },
    ],
    []
  );

  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  const renderError = () => (
    <div className="rounded-xs bg-red-50 p-4 flex items-center">
      <FiAlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
      <h3 className="ml-3 text-sm font-medium text-red-800">{error}</h3>
    </div>
  );

  if (error) return renderError();

  const selectedClientForEdit = async (client: Client) => {
    console.log("Selected client for edit:", client);
    if (!client.Id) {
      console.error("Client Id is undefined.");
      return;
    }
    setemail(client.email);
    setShowCardClient(client.Id ? client.Id : null);
    setEditedClient(client);
  };

  async function handleEditClientSubmit(data: EditClientFormSchemaType) {
    console.log(data);
    setIsLoading(true);

    try {
      if (!data.document) {
        console.error("CPF is undefined.");
        return;
      }

      // Busca o cliente pelo CPF
      const clientsRef = collection(db, "clients");
      const q = query(clientsRef, where("document", "==", data.document));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("No client found with this CPF.");
        return;
      }

      // Como CPF deve ser único, pegamos o primeiro documento encontrado
      const clientDoc = querySnapshot.docs[0];
      const clientDocRef = doc(db, "clients", clientDoc.id);

      // Atualiza os dados do cliente
      await updateDoc(clientDocRef, {
        name: data.name,
        email: data.email,
        document: data.document,
        phone: data.phone,
        ie: data.ie,
        fantasyName: data.fantasyName,
        address: data.address,
      });

      fetchClients();
      setShowCardClient(null);

      toast.success("Cliente atualizado com sucesso!");
    } catch (err) {
      console.error("Error updating client:", err);
      toast.error("Ocorreu um erro ao tentar atualizar o cliente!");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword() {
    setIsSubmittingResetForPassword(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSubmittingResetForPassword(false);
      toast.success(
        `Para redefinir a senha, acesse ${email} e siga as instruções!`
      );
    } catch (e) {
      setIsSubmittingResetForPassword(false);
      toast.error("Erro ao enviar o email de redefinição!");
      console.error("Erro ao redefinir a senha:", e);
    }
  }

  const fetchAddress = useCallback(
    async (cep: string) => {
      const cleanCep = cep.replace(/\D/g, ""); // Remove caracteres não numéricos

      if (cleanCep.length !== 8) {
        toast.warning("Digite um CEP válido com 8 dígitos.");
        return;
      }

      try {
        const { data } = await api.get(
          `https://viacep.com.br/ws/${cleanCep}/json/`
        );

        if (data.erro) throw new Error("CEP não encontrado");

        setValue("address.cep", data.cep);
        setValue("address.street", data.logradouro);
        setValue("address.neighborhood", data.bairro);
        setValue("address.city", data.localidade);
        setValue("address.state", data.uf);
        setValue("address.ibge", data.ibge);
        setValue("address.number", 0);

        toast.success("Endereço encontrado !");
      } catch (error) {
        toast.error("CEP inválido ou não encontrado");
        console.error(error);
      }
    },
    [setValue]
  );

  const {
    onBlur: rhfOnBlur,
    onChange: rhfOnChange,
    name,
    ref,
  } = register("address.cep");

  return (
    <div className="space-y-3 p-4 bg-white rounded-xs shadow w-full h-[calc(100vh-4.5rem)] overflow-y-auto">
      <div className="relative">
        <FiSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome do cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xs border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>
      <div className="flex justify-between gap-x-2 p-2">
        <div className="flex items-center gap-x-2">
          <InfoIcon className="w-4 h-4 text-blue-500" />
          <h2 className="text-[0.67rem] text-gray-500">
            Para visualizar os detalhes do cliente, clique duas vezes sobre ele.
          </h2>
        </div>
      </div>

      <div className="border rounded-xs overflow-hidden">
        <table className="w-full relative">
          <thead className="bg-gray-100 sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 hover:cursor-pointer hover:text-red-500"
                    onClick={() => handleSorting(header.column.id)}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {sorting.column === header.column.id &&
                        (sorting.direction === "asc" ? (
                          <FiArrowUp className="h-4 w-4" />
                        ) : (
                          <FiArrowDown className="h-4 w-4" />
                        ))}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-200">
            {sortedData.map((client) => (
              <>
                <Dialog
                  open={client.Id === showCardClient}
                  onOpenChange={() => setShowCardClient(null)}
                >
                  <DialogTrigger asChild>
                    <tr
                      onDoubleClick={() => selectedClientForEdit(client)}
                      className="hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {client.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {client.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {client.document}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{`${client.address.city} - ${client.address.state}`}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {client.phone}
                      </td>
                    </tr>
                  </DialogTrigger>

                  <DialogContent className="max-w-2xl bg-white rounded-xs shadow-lg p-6">
                    <DialogTitle className="text-2xl font-bold mb-2">
                      Editar Cliente
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 mb-4">
                      Atualize as informações do cliente abaixo.
                    </DialogDescription>

                    <form
                      id="editClientForm"
                      onSubmit={handleSubmit(handleEditClientSubmit)}
                      className="space-y-6"
                    >
                      {/* Informações do Usuário */}
                      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold">Usuário</h3>
                          <div>
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Nome
                            </label>
                            <Input
                              id="name"
                              defaultValue={client.name}
                              {...register("name")}
                              className="mt-1 bg-white w-full"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="fantasyName"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Nome Fantasia
                            </label>
                            <Input
                              id="fantasyName"
                              defaultValue={client.fantasyName}
                              {...register("fantasyName")}
                              className="mt-1 bg-white w-full"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="document"
                              className="block text-sm font-medium text-gray-700"
                            >
                              CPF/CNPJ
                            </label>
                            <Input
                              id="document"
                              defaultValue={client.document}
                              disabled
                              {...register("document")}
                              className="mt-1 bg-gray-100 w-full"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium text-gray-700"
                            >
                              E-mail
                            </label>
                            <Input
                              id="email"
                              defaultValue={client.email}
                              disabled
                              {...register("email")}
                              className="mt-1 bg-gray-100 w-full"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="phone"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Telefone
                            </label>
                            <Input
                              id="phone"
                              defaultValue={client.phone}
                              {...register("phone")}
                              className="mt-1 bg-white w-full"
                            />
                          </div>
                        </div>

                        {/* Endereço */}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold">
                            Endereço de entrega
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label
                                htmlFor="cep"
                                className="block text-sm font-medium text-gray-700"
                              >
                                CEP
                              </label>
                              <Input
                                id="cep"
                                name={name}
                                defaultValue={client.address.cep}
                                ref={ref}
                                onBlur={(e) => {
                                  rhfOnBlur(e);
                                  fetchAddress(e.target.value);
                                }}
                                onChange={rhfOnChange}
                                className="mt-1 bg-white w-full"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="neighborhood"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Bairro
                              </label>
                              <Input
                                id="neighborhood"
                                value={client.address.neighborhood}
                                readOnly
                                {...register("address.neighborhood")}
                                className="mt-1 bg-gray-100 w-full"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="street"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Rua
                              </label>
                              <Input
                                id="street"
                                value={client.address.street}
                                readOnly
                                {...register("address.street")}
                                className="mt-1 bg-gray-100 w-full"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="number"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Número
                              </label>
                              <Input
                                id="number"
                                defaultValue={client.address.number}
                                {...register("address.number")}
                                className="mt-1 bg-white w-full"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="city"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Cidade
                              </label>
                              <Input
                                id="city"
                                value={client.address.city}
                                readOnly
                                {...register("address.city")}
                                className="mt-1 bg-gray-100 w-full"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="state"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Estado
                              </label>
                              <Input
                                id="state"
                                value={client.address.state}
                                readOnly
                                {...register("address.state")}
                                className="mt-1 bg-gray-100 w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Lista de preços e redefinir senha */}
                      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold">
                            Redefinir senha
                          </h3>
                          <div>
                            <label
                              htmlFor="resetEmail"
                              className="block text-sm font-medium text-gray-700"
                            >
                              E-mail
                            </label>
                            <Input
                              id="resetEmail"
                              type="email"
                              value={email}
                              disabled
                              className="mt-1 bg-gray-100 w-full"
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={handleResetPassword}
                            disabled={isLoading || isSubmittingResetForPassword}
                            className="w-full"
                          >
                            {isSubmittingResetForPassword ? (
                              <Loader2 className="animate-spin mr-2" />
                            ) : null}
                            Redefinir
                          </Button>
                        </div>
                      </section>

                      {/* Ações */}
                      <div className="flex justify-end space-x-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="secondary">Salvar</Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-64">
                            <p className="text-center text-sm text-gray-700">
                              Deseja confirmar as alterações?
                            </p>
                            <div className="mt-4 flex justify-between">
                              <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button
                                  form="editClientForm"
                                  type="submit"
                                  disabled={isSubmitting}
                                >
                                  Confirmar
                                </Button>
                              </DialogClose>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            ))}
          </tbody>
        </table>
        {sortedData.length === 0 && (
          <div className="py-16 text-center">
            <h2>Nenhum cliente encontrado.</h2>
          </div>
        )}
      </div>
      {isLoading && <Loader />}
    </div>
  );
};

export default ClientsTable;
