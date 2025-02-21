/* eslint-disable react-hooks/exhaustive-deps */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import { useEffect, useState } from "react";
import { OrderSaleTypes } from "./PostSaleOrder";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ToastNotifications from "@/_components/Toasts";
import { format } from "date-fns";
import Sidebar from "./Sidebar";
import { DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { ChevronsRightIcon, CircleIcon, Trash } from "lucide-react";
import useUserStore from "@/context/UserStore";
import { CardHeader, CardTitle } from "@/components/ui/card";
import logo from "../assets/logo_sem_fundo.png";

interface StatusProps {
  [key: number]: string;
}

interface IFormInput {
  dateRange: { from: string; to: string };
  inputText: string;
  selectDate: string;
  selectStatus: StatusProps;
  selectData?: string;
}

export function GetOrdersComponent() {
  const [orderList, setOrderList] = useState<OrderSaleTypes[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderSaleTypes[]>([]);
  const [selectedOrderList, setSelectedOrderList] = useState<OrderSaleTypes[]>(
    []
  );
  const [range, setRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [check, setCheck] = useState(false);
  const [isCleared, setIsCleared] = useState(false);

  const { typeUser, setTypeUser } = useUserStore();

  /* Alterar o valor da createAt pelo timestamp  */

  const { register, handleSubmit } = useForm<IFormInput>();
  const { toastError } = ToastNotifications();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const queryList: OrderSaleTypes[] = [];
      const docRef = collection(firestore, "sales_orders");
      const docSnap = await getDocs(docRef);
      if (!docSnap.empty) {
        docSnap.docs.map((item) => {
          const data = item.data() as OrderSaleTypes;

          const total = data.itens.reduce(
            (acc, item) => acc + (item.preco || 0) * item.quantidade,
            0
          );

          queryList.push({ ...data, total });

          queryList.sort((a, b) => {
            const numA = Number(a.order_code.toString().match(/\d+/)?.[0]);
            const numB = Number(b.order_code.toString().match(/\d+/)?.[0]);
            return numB - numA;
          });
        });
        console.log(queryList);
        setOrderList(queryList);
        setFilteredOrders(queryList);
      }
    } catch (e) {
      console.error(e);
      toastError("Ocorreu um erro ao buscar os pedidos !");
    }
  };

  const handleUpdatedStatusOrder = async (
    orderId: string,
    newStatus: number
  ) => {
    try {
      const orderUpdateDate = format(new Date(), "yyyy/MM/dd HH:mm:ss");
      const orderRef = doc(firestore, "sales_orders", orderId);

      await updateDoc(orderRef, {
        status_order: newStatus,
        updated_at: orderUpdateDate,
      });

      setOrderList((prevList) => {
        return prevList.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status_order: newStatus,
            };
          }
          return order;
        });
      });

      setFilteredOrders((prevList) => {
        return prevList.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status_order: newStatus,
            };
          }
          return order;
        });
      });
    } catch {
      console.error("Ocorreu um erro ao atualizar o status do pedido !");
    }

    console.log("Verificando a atualização da propriedade: ", orderList);
  };

  const handleSearchOrders: SubmitHandler<IFormInput> = (data) => {
    const searchArgument = data.inputText.trim().toLowerCase();
    const selectStatus = isNaN(Number(data.selectStatus))
      ? 0
      : Number(data.selectStatus);

    console.log(range);

    // Desestruturação do `range`
    const { from, to } = range || {}; // Garantindo que `range` pode estar vazio

    console.log("from", from);
    console.log("to", to);

    const filteredList = orderList.filter((order) => {
      // Filtro por nome
      const matchesName =
        searchArgument.length >= 1
          ? searchArgument.toLowerCase().includes(searchArgument) ===
            order.cliente?.nomeDoCliente?.toLowerCase().includes(searchArgument)
          : true;

      const matchesStatus =
        selectStatus > 0 ? order.status_order === selectStatus : true;

      const matchesDateRange =
        from && to
          ? (() => {
              if (order.created_at) {
                const orderDate = new Date(order.created_at);
                const startDate = new Date(
                  from.getFullYear(),
                  from.getMonth(),
                  from.getDate()
                );
                const endDate = new Date(
                  to.getFullYear(),
                  to.getMonth(),
                  to.getDate() + 1
                );
                return orderDate >= startDate && orderDate < endDate;
              }
              return false;
            })()
          : true; // Se `from` ou `to` não estiverem definidos, ignora o filtro de data

      return matchesName && matchesStatus && matchesDateRange;
    });

    if (filteredList.length > 0) {
      setFilteredOrders(filteredList);
    } else {
      toastError("Nenhum pedido encontrado!");
    }
  };

  // Definir o tipo Esteira
  type Esteira = {
    1: Array<
      | "Carne"
      | "Carne c/ Ovo"
      | "Brasileirinho"
      | "Carne c/ Queijo"
      | "Carne com queijo"
      | "Caipira"
      | "Frango"
      | "Frango c/ catupiry"
      | "Frango catupiry"
      | "Caipira"
      | "Frango c/ Queijo"
      | "Frango puro"
      | "Milho catupiry"
      | "Milho c/ Catupiry"
      | "4 Queijos"
      | "Costela c/ Queijo"
      | "Costela"
      | "Camarão"
      | "Cupim c/ Catupiry"
      | "Cupim"
      | "Carne louca"
      | "Mini Especial de Carne"
      | "Mini Especial De Carne"
      | "Mini Especial de Palmito"
      | "Mini Especial de Frango"
      | "Especial de Carne"
      | "Especial de Frango"
    >;
    2: Array<
      | "Queijo"
      | "Pizza"
      | "Bauru"
      | "Calabresa c/ Queijo"
      | "Calabresa c/ Catupiry"
      | "Carne seca"
      | "Carne Seca c/ Queijo"
      | "Calabresa c/ Catupiry"
      | "Calabresa com queijo"
      | "Baião de dois"
      | "Palmito"
      | "Palmito c/ Queijo"
      | "Escarola c/ Queijo"
      | "Bacalhau"
      | "Portuguesa"
      | "Baiano"
      | "Chocolate"
      | "Chocolate Harald"
      | "Doce de Leite"
      | "Laka"
      | "Suflair"
      | "Escarola com queijo"
      | "Rúcula com tomate"
      | "Brócolis"
      | "Doce de leite"
    >;
  };

  // Objeto que representa os valores permitidos para cada categoria
  const EsteiraValues: Esteira = {
    1: [
      "Carne",
      "Carne c/ Ovo",
      "Brasileirinho",
      "Carne c/ Queijo",
      "Carne com queijo",
      "Frango c/ catupiry",
      "Frango catupiry",
      "Caipira",
      "Frango",
      "Frango c/ Queijo",
      "Frango puro",
      "Milho catupiry",
      "Milho c/ Catupiry",
      "4 Queijos",
      "Costela c/ Queijo",
      "Costela",
      "Camarão",
      "Cupim c/ Catupiry",
      "Cupim",
      "Carne louca",
      "Mini Especial de Carne",
      "Mini Especial De Carne",
      "Mini Especial de Palmito",
      "Mini Especial de Frango",
      "Especial de Carne",
      "Especial de Frango",
    ],
    2: [
      "Queijo",
      "Pizza",
      "Bauru",
      "Calabresa c/ Queijo",
      "Calabresa c/ Catupiry",
      "Carne seca",
      "Carne Seca c/ Queijo",
      "Calabresa c/ Catupiry",
      "Calabresa com queijo",
      "Baião de dois",
      "Palmito",
      "Palmito c/ Queijo",
      "Escarola c/ Queijo",
      "Escarola com queijo",
      "Rúcula com tomate",
      "Brócolis",
      "Bacalhau",
      "Portuguesa",
      "Baiano",
      "Chocolate",
      "Chocolate Harald",
      "Doce de Leite",
      "Doce de leite",
      "Laka",
      "Suflair",
    ],
  };

  // Função atualizada
  const handlePrintItens = (pedido: OrderSaleTypes, type: string) => {
    const normalizeName = (name: string) => name.trim().toLowerCase(); // Normaliza o nome para comparação

    const EsteiraValuesNormalized = {
      1: EsteiraValues[1].map(normalizeName),
      2: EsteiraValues[2].map(normalizeName),
    };

    let arrayForPrint: {
      produtoId?: string;
      nome?: string;
      preco?: number;
      categoria?: string;
      quantidade: number;
      esteira?: number;
      precoUnitarioBruto?: number;
      precoUnitarioLiquido?: number;
      id_seq?: number;
    }[] = [];

    const orderNumber = pedido.order_code;

    // Validação dos itens usando EsteiraValues normalizado
    arrayForPrint = pedido.itens.map((item, index) => {
      if (item.nome) {
        const normalizedItemName = normalizeName(item.nome);

        if (EsteiraValuesNormalized[1].includes(normalizedItemName)) {
          return {
            produtoId: item.produtoId,
            nome: item.nome,
            preco: item.preco,
            categoria: item.categoria,
            quantidade: item.quantidade,
            esteira: 1, // Categoria 1
            precoUnitarioBruto: item.precoUnitarioBruto,
            precoUnitarioLiquido: item.precoUnitarioLiquido,
            id_seq: index + 1,
          };
        }

        if (EsteiraValuesNormalized[2].includes(normalizedItemName)) {
          return {
            produtoId: item.produtoId,
            nome: item.nome,
            preco: item.preco,
            categoria: item.categoria,
            quantidade: item.quantidade,
            esteira: 2, // Categoria 2
            precoUnitarioBruto: item.precoUnitarioBruto,
            precoUnitarioLiquido: item.precoUnitarioLiquido,
            id_seq: index + 1,
          };
        }
      }

      // Retorna o item original caso não pertença a nenhuma esteira
      return item;
    });

    const user = pedido.cliente &&
      pedido.created_at && {
        IdClient: pedido.IdClient,
        document: pedido.cliente?.documento,
        userName: pedido.cliente?.nomeDoCliente,
        userEmail: pedido.cliente?.email,
        userIE: pedido.cliente.inscricaoEstadual,
        date: pedido?.created_at,
      };

    navigate("/printPage", {
      state: { arrayForPrint, user, type, orderNumber },
    });
  };

  const handleSelectAllOrders = () => {
    const allSelected =
      filteredOrders.length > 0
        ? filteredOrders.every((order) =>
            selectedOrderList.some(
              (selectedOrder) => selectedOrder.id === order.id
            )
          )
        : orderList.every((order) =>
            selectedOrderList.some(
              (selectedOrder) => selectedOrder.id === order.id
            )
          );

    if (allSelected) {
      // Remove todos os pedidos da lista
      setSelectedOrderList([]);
    } else {
      // Adiciona todos os pedidos à lista
      if (filteredOrders.length > 0) {
        setSelectedOrderList(filteredOrders);
      } else {
        setSelectedOrderList(orderList);
      }
    }
  };

  const handleClearSelectList = () => {
    setSelectedOrderList([]);
    setCheck(false);
    setIsCleared(true); // Sinaliza que os checkboxes devem ser desmarcados
    setTimeout(() => setIsCleared(false), 0); // Reseta o estado após a atualização
  };

  const handleSelectOrder = (orderSelected: OrderSaleTypes) => {
    const isAlreadySelected = selectedOrderList.some(
      (order) => order.id === orderSelected.id
    );

    if (isAlreadySelected) {
      setSelectedOrderList((prev) =>
        prev.filter((selectOrder) => selectOrder.id !== orderSelected.id)
      );
      console.log(selectedOrderList);
    } else {
      setSelectedOrderList((prev) => [...prev, orderSelected]);
      console.log(selectedOrderList);
    }
  };

  const handleBatchChange: SubmitHandler<IFormInput> = async (data) => {
    try {
      const updateList = selectedOrderList.map((order) => {
        const newValueStatus = Number(data.selectData);

        return {
          ...order,
          status_order: newValueStatus,
        };
      });

      setSelectedOrderList(updateList);

      setOrderList(updateList);
      setFilteredOrders(updateList);

      const collectionRef = collection(firestore, "sales_orders");

      const updatePromises = updateList.map((order) => {
        updateDoc(doc(collectionRef, order.id), {
          status_order: order.status_order,
        });
      });

      await Promise.all(updatePromises);
      setCheck(false);
      setSelectedOrderList([]);
      await fetchOrders();
    } catch (e) {
      console.error("Ocorreu um erro ao atualizar os status dos pedidos !", e);
    }
  };

  const fetchTypeUser = async (): Promise<string | null> => {
    const getUserCredentials = localStorage.getItem("loggedUser");
    const userCredentials =
      getUserCredentials && JSON.parse(getUserCredentials);

    const id = userCredentials.uid;

    if (!id) {
      console.error("ID não encontrado no localStorage.");
      return null;
    }

    try {
      const clientDoc = doc(firestore, "clients", id);
      const docSnap = await getDoc(clientDoc);
      console.log("Tipo do usuário encontrado.");

      if (docSnap.exists()) {
        const typeUser = docSnap.data()?.type_user || null;

        setTypeUser(typeUser);

        return typeUser;
      } else {
        console.error("Usuário não encontrado.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar user_name no Firestore:", error);
      return null;
    }
  };

  const handleAprovedOrder = async (
    orderId: string | null,
    newStatus: number
  ) => {
    if (!orderId) {
      console.error("Order ID is undefined.");
      return;
    }
    try {
      const orderUpdateDate = format(new Date(), "yyyy/MM/dd HH:mm:ss");

      const collectionRef = doc(firestore, "sales_orders", orderId);

      await updateDoc(collectionRef, {
        status_order: newStatus,
        updated_at: orderUpdateDate,
      });

      setOrderList((prevList) => {
        return prevList.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status_order: newStatus,
            };
          }
          return order;
        });
      });

      setFilteredOrders((prevList) => {
        return prevList.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status_order: newStatus,
            };
          }
          return order;
        });
      });
      console.log("Order status updated successfully.");
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };
  const selectOptions = [
    // { value: 1, label: "Orçamento" },
    // { value: 2, label: "Pedido" },
    // { value: 3, label: "Não faturado" },
    // { value: 4, label: "Faturado" },
    { value: 5, label: "Em separação" },
    { value: 6, label: "Enviado" },
    { value: 7, label: "Concluído" },
  ];

  const formattedFrom = range?.from
    ? format(range.from, "dd/MM/yyyy")
    : "--/--/----";
  const formattedTo = range?.to ? format(range.to, "dd/MM/yyyy") : "--/--/----";

  useEffect(() => {
    fetchOrders();
    fetchTypeUser();
    console.log("Type User: ", typeUser);
  }, [typeUser]);

  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  return (
    <>
      <div className="flex flex-col ">
        <Sidebar />
        <CardHeader className="bg-white rounded w-full flex  justify-between ">
          <CardTitle className="text-xl font-bold">
            <div className="flex items-center justify-start gap-x-12">
              <img src={logo} className="size-[8rem] rounded-full " />
              <h1 className="antialised text-[1.7rem]  flex items-center gap-x-1 text-gray-600">
                <span>
                  <ChevronsRightIcon size={26} className="text-store-primary" />
                </span>
                Lista de pedidos
              </h1>
            </div>
          </CardTitle>
        </CardHeader>
        <form
          onSubmit={handleSubmit(handleSearchOrders)}
          className="flex flex-wrap items-center gap-4 p-4  bg-gray-50"
        >
          <Input
            type="text"
            placeholder="Nome do cliente"
            {...register("inputText")}
            className="border px-4 py-2 rounded w-full text-sm md:w-1/3 placeholder:text-sm"
          />
          <select
            className="border px-4 py-2 rounded"
            {...register("selectStatus")}
          >
            <option value="0">Todos os status</option>
            {/* <option value="3">Não faturado</option> */}
            <option value="5">Em separação</option>
            <option value="6">Enviado</option>
            <option value="7">Concluído</option>
          </select>

          <Popover>
            <PopoverTrigger asChild>
              <div className="w-[200px] border p-2 rounded-lg cursor-pointer hover:bg-gray-200">
                {formattedTo !== "--/--/----" ? (
                  <span className="text-sm">
                    {formattedFrom} || {formattedTo}
                  </span>
                ) : (
                  <span>Selecione o periodo</span>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                footer={
                  formattedFrom &&
                  formattedTo &&
                  `${formattedFrom} a ${formattedTo}`
                }
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
            type="submit"
          >
            Filtrar
          </button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Alteração em lote</Button>
            </DialogTrigger>
            <DialogContent
              aria-describedby={undefined}
              className="flex flex-col "
            >
              <DialogHeader>
                <DialogTitle>
                  Produtos Selecionados para a alteração em lote :
                </DialogTitle>
              </DialogHeader>
              <form
                id="batchChange"
                onSubmit={handleSubmit(handleBatchChange)}
                className="space-y-3 w-full"
              >
                <select
                  className="border-2 px-4 py-2 rounded"
                  {...register("selectData")}
                  disabled={selectedOrderList.length === 0}
                >
                  <option value="0">Todos os status</option>
                  {/* <option value="3">Não faturado</option> */}
                  <option value="5">Em separação</option>
                  <option value="6">Enviado</option>
                  <option value="7">Concluído</option>
                </select>
                <div className="space-y-2 overflow-y-scroll h-56">
                  {selectedOrderList.length > 0 ? (
                    <>
                      {selectedOrderList.map((order, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row items-center border-2 rounded-lg p-2 justify-between w-full"
                        >
                          <div className="flex items-center overflow-hidden">
                            <span className=" px-4 py-2 text-sm md:text-base">
                              {order.order_code}
                            </span>
                            <span className=" px-4 py-2 text-center items-center text-sm md:text-base">
                              {order.created_at
                                ? format(
                                    order.created_at,
                                    "dd/MM/yyyy HH:mm:ss"
                                  )
                                : "Data indisponível"}
                            </span>
                            <span className=" px-4 py-2 text-sm md:text-base text-nowrap truncate">
                              {order.cliente?.nomeDoCliente}
                            </span>
                          </div>
                          <div
                            className={`px-2 py-1 rounded ${
                              order.status_order === 3
                                ? "bg-blue-200 text-blue-800 hover:bg-blue-300"
                                : order.status_order === 4
                                ? "bg-purple-200 text-purple-800 hover:bg-purple-300"
                                : order.status_order === 5
                                ? "bg-green-200 text-green-800"
                                : order.status_order === 6
                                ? "bg-red-500"
                                : order.status_order === 7
                                ? "bg-green-300 text-green-900 "
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                          >
                            <span className="text-sm md:text-base text-nowrap">
                              {order.status_order === 1
                                ? "Em aprovação"
                                : order.status_order === 2
                                ? "Em aprovação"
                                : /* : order.status_order === 3
                                ? "Não faturado" */
                                /*   order.status_order === 4
                                ? "Faturado" */
                                order.status_order === 5
                                ? "Em separação"
                                : order.status_order === 6
                                ? "Entregue"
                                : order.status_order === 7 && "Concluído"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <h1 className="font-semibold">
                        Você ainda não tem items para alterar
                      </h1>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button disabled={selectedOrderList.length === 0}>
                        Atualizar Status
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="flex flex-col">
                        <span>Deseja confirmar as alterações de status ?</span>
                        <div className="flex justify-between">
                          <DialogClose asChild>
                            <Button>Cancelar</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button type="submit" form="batchChange">
                              Confirmar
                            </Button>
                          </DialogClose>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant={"outline"} onClick={handleClearSelectList}>
            <Trash />
            {selectedOrderList.length}
          </Button>
        </form>
      </div>
      {/*   <div className="flex flex-col p-2 bg-gray-50 ">
        <span className="font-semibold ">Legenda:</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <CircleIcon className={`fill-orange-200 text-orange-400`} />
          </div>
          <span>Cotação</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <CircleIcon className={`fill-blue-200 text-blue-400`} />
          </div>
          <span>Pedido de venda</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <CircleIcon className={`fill-purple-200 text-purple-400`} />
          </div>
          <span>Faturado</span>
        </div>
      </div> */}
      <table className="w-full border-collapse text-center border-gray-200 pl-[3rem]">
        <thead className="bg-gray-100 ">
          <tr>
            <th className="border md:px-4 py-2 text-xs md:text-base">
              <input
                type="checkbox"
                name=""
                id=""
                checked={check}
                onChange={() => {
                  setCheck(!check);
                  handleSelectAllOrders();
                }}
              />
            </th>
            <th className="border md:px-4 py-2 hidden text-xs md:text-base md:table-cell">
              Número do pedido
            </th>
            <th className="border md:px-4 py-2 hidden text-sm md:text-base md:table-cell">
              Data de criação
            </th>
            <th className="border md:px-4 py-2 text-xs md:text-base">
              Cliente
            </th>
            <th className="border md:px-4 py-2 text-xs md:text-base">Status</th>
            <th className="border md:px-4 py-2 text-xs md:text-base">
              Aprovação
            </th>
            <th className="border md:px-4 py-2 text-xs md:text-base">
              Logística
            </th>
            {typeUser !== "fábrica" && (
              <th className={`border md:px-4 py-2 hidden md:table-cell`}>
                Valor
              </th>
            )}
            <th className="border md:px-4 py-2 hidden md:table-cell">
              Imprimir
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            <>
              {/*  */}
              {filteredOrders.map((order) => (
                <Dialog
                  open={openDialogId === order.id}
                  onOpenChange={(isOpen) => {
                    setOpenDialogId(isOpen ? order.id ?? null : null);
                  }}
                  key={order.id}
                >
                  <tr
                    onDoubleClick={() =>
                      setOpenDialogId(order.id ? order.id : null)
                    }
                    className={` 
                    ${order.created_at === undefined && "hidden"}
                     
                  `}
                  >
                    <td className="border px-4 py-2 text-sm md:text-base ">
                      <input
                        type="checkbox"
                        name=""
                        id=""
                        checked={
                          selectedOrderList.includes(order) && !isCleared
                        }
                        onChange={() => {
                          handleSelectOrder(order);
                        }}
                      />
                    </td>
                    <td className="border px-4 py-2 hidden md:table-cell text-sm md:text-base">
                      {order.order_code}
                    </td>
                    <td className="border px-4 py-2 hidden md:table-cell text-sm md:text-base">
                      {order.created_at
                        ? format(order.created_at, "dd/MM/yyyy 'ás' HH:mm:ss")
                        : "Data indisponível"}
                    </td>
                    <td className="border px-4 py-2 text-xs md:text-base">
                      {order.cliente?.nomeDoCliente}
                    </td>
                    <td className=" border px-4 py-2 ">
                      <div className="flex  justify-center">
                        <div
                          className={` border-2 p-1 rounded-lg ${
                            order.status_order === 1
                              ? " bg-orange-200  text-orange-400 border-orange-500"
                              : order.status_order === 2
                              ? "text-blue-500 bg-blue-300 border-blue-500"
                              : order.status_order === 4
                              ? "bg-purple-100 border-purple-500 text-purple-900"
                              : order.status_order > 4 &&
                                "bg-purple-100 border-purple-500 text-purple-900"
                          } `}
                        >
                          {order.status_order === 1
                            ? "Cotação"
                            : order.status_order === 2
                            ? "Pedido de venda"
                            : order.status_order === 4
                            ? "Pedido faturado"
                            : order.status_order > 4 && "Pedido faturado"}
                        </div>
                      </div>
                    </td>
                    <td className=" border px-4 py-2 ">
                      <Button
                        className={` " bg-gray-200  text-black border border-slate-400 hover:bg-orange-300" 
                          `}
                        onClick={() =>
                          handleAprovedOrder(
                            order.id ?? null,
                            order.status_order + 1
                          )
                        }
                        disabled={order.status_order > 1}
                      >
                        {order.status_order <= 1 ? "Aprovar" : "Aprovado"}
                      </Button>
                    </td>
                    <td className="border px-4 py-2 ">
                      <select
                        value={order.status_order}
                        onChange={(e) => {
                          if (order.status_order && order.id) {
                            const nextStatus = Number(e.target.value);
                            handleUpdatedStatusOrder(order.id, nextStatus);
                          }
                        }}
                        // disabled={(order.status_order ?? 0) >= 7}
                        className={`px-2 py-1 rounded text-xs md:text-base  ${
                          order.status_order === 3
                            ? "bg-blue-200 text-blue-800 hover:bg-blue-300"
                            : order.status_order === 4
                            ? "bg-purple-200 text-purple-800 hover:bg-purple-300"
                            : order.status_order === 5
                            ? "bg-red-300 text-yellow-900 "
                            : order.status_order === 6
                            ? "bg-amber-300"
                            : order.status_order === 7
                            ? "bg-green-200"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        {selectOptions.map((option, index) => {
                          return (
                            <option key={index} value={option.value}>
                              {option.label}
                            </option>
                          );
                        })}
                      </select>
                      {/*  <Dialog>
                      <DialogTrigger>
                        <span className="bg-amber-500 text-white px-2  text-xs md:text-base py-1 rounded hover:bg-amber-600">
                          Ver
                        </span>
                      </DialogTrigger>
                      <DialogContent
                        className="overflow-y-scroll h-96"
                        aria-describedby={undefined}
                      >
                        <DialogHeader className="items-center">
                          <DialogTitle>Detalhes</DialogTitle>
                        </DialogHeader>
                      
                          )}

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded">
                                Imprimir
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                              <div className="flex flex-col">
                                <span>Escolha o tipo de impressão:</span>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => {
                                      const type = "A4";
                                      handlePrintItens(order, type);
                                    }}
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded"
                                  >
                                    Imprimir A4
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      const type = "termica";
                                      handlePrintItens(order, type);
                                    }}
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded"
                                  >
                                    Imprimir Térmica
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog> */}
                    </td>
                    {typeUser !== "fábrica" && (
                      <td className="border px-4 py-2 hidden md:table-cell">
                        {order.total?.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                    )}
                    <td className="border px-4 py-2 hidden md:table-cell">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">
                            Imprimir
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="flex flex-col">
                            <span>Escolha o tipo de impressão:</span>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  const type = "A4";
                                  handlePrintItens(order, type);
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                              >
                                Imprimir A4
                              </Button>
                              <Button
                                onClick={() => {
                                  const type = "termica";
                                  handlePrintItens(order, type);
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                              >
                                Imprimir Térmica
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                  </tr>

                  <DialogContent
                    aria-describedby={undefined}
                    className="flex flex-col w-screen max-w-6xl items-center "
                  >
                    <DialogTitle className="w-full text-gray-700">
                      Orçamento: {order.order_code}
                    </DialogTitle>
                    <div className="flex w-9/12 justify-around">
                      <div className="flex flex-col items-start w-fit gap-2">
                        <span className="text-gray-700">Cliente:</span>
                        <Input
                          type="text"
                          disabled
                          className="bg-gray-100"
                          defaultValue={order.cliente?.nomeDoCliente}
                        />
                        <Input
                          type="text"
                          disabled
                          className="bg-gray-100"
                          defaultValue={order.cliente?.documento}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-gray-700">
                          Endereço de entrega:{" "}
                        </span>
                        <div className="flex items-center gap-2 ">
                          <Input
                            type="text"
                            disabled
                            className="bg-gray-100"
                            defaultValue={order.enderecoDeEntrega?.cep}
                          />
                          <Input
                            type="text"
                            disabled
                            className="bg-gray-100"
                            defaultValue={order.enderecoDeEntrega?.logradouro}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            disabled
                            className="bg-gray-100"
                            defaultValue={order.enderecoDeEntrega?.bairro}
                          />
                          <Input
                            type="text"
                            disabled
                            className="bg-gray-100"
                            defaultValue={order.enderecoDeEntrega?.numero}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 flex flex-col  justify-center items-center">
                      <div className="text-lg font-semibold text-center text-gray-700">
                        Produtos:
                      </div>
                      <div className="flex flex-col border w-full  rounded-lg text-sm   p-2 md:text-sm">
                        <div className="grid grid-cols-3  text-center">
                          <span className="font-semibold text-lg col-span-1 text-gray-700">
                            Produto
                          </span>
                          <span className="font-semibold text-lg col-span-1 text-gray-700">
                            Quantidade
                          </span>
                          <span className="font-semibold text-lg col-span-1 text-gray-700">
                            Valor unitário
                          </span>
                        </div>
                        {order.itens.map((product) => {
                          return (
                            <div
                              key={product.produtoId}
                              className="grid grid-cols-3 text-center items-center justify-around border-b space-y-2 p-2 "
                            >
                              <span className="font-semibold  col-span-1 ">
                                {product.nome}
                              </span>
                              <span className="col-span-1">
                                {product.quantidade}
                              </span>
                              {typeUser !== "fábrica" && (
                                <span className="col-span-1">
                                  {product.preco?.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </span>
                              )}
                            </div>
                          );
                        })}

                        {typeUser !== "fábrica" && (
                          <div className="flex gap-1 justify-between rounded-lg items-center p-1">
                            <div className="flex-1" />
                            <div>
                              <span className="text-base font-semibold text-gray-700">
                                Total do pedido:
                              </span>{" "}
                              <span className="text-lg">
                                {order.total?.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between w-full">
                        <div className="flex flex-col   rounded-lg p-1 w-9/12">
                          <span className="border w-fit p-2 rounded-lg">
                            <span className="font-semibold text-gray-700  text-nowrap">
                              Métodos de pagamento
                            </span>
                            <span className="flex ">
                              {order.meiosDePagamento.map((method) => {
                                return (
                                  <div className="flex flex-col text-sm">
                                    <span>
                                      {method.idMeioDePagamento === 1
                                        ? "Dinheiro"
                                        : method.idMeioDePagamento === 2
                                        ? "Cheque"
                                        : method.idMeioDePagamento === 3
                                        ? "Devolução"
                                        : method.idMeioDePagamento === 4
                                        ? "Cartão de crédito"
                                        : method.idMeioDePagamento === 5
                                        ? "Cartão de Débito"
                                        : method.idMeioDePagamento === 6
                                        ? "Boleto"
                                        : method.idMeioDePagamento === 7
                                        ? "Crédito do cliente"
                                        : method.idMeioDePagamento === 8 &&
                                          "Pix"}
                                    </span>
                                    <span>
                                      {method.parcelas === 1
                                        ? "Á vista"
                                        : method.parcelas}
                                    </span>
                                  </div>
                                );
                              })}
                            </span>
                          </span>
                        </div>

                        <div className="flex flex-col border rounded-lg p-1 w-9/12">
                          Observações:
                          <span className="text-sm">
                            {order.observacaoDoPedidoDeVenda}
                          </span>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </>
          ) : (
            <>
              {orderList.map((order) => (
                <tr
                  key={order.id}
                  className={`
              ${order.created_at === undefined && "hidden"}
                ${
                  order.status_order === 1
                    ? "bg-orange-100 hover:bg-orange-200"
                    : order.status_order === 2
                    ? "bg-blue-100 hover:bg-blue-200"
                    : order.status_order === 4 &&
                      "bg-purple-100 hover:bg-purple-200"
                }
            `}
                >
                  <td className="border px-4 py-2 text-sm md:text-base ">
                    <input
                      type="checkbox"
                      name=""
                      id=""
                      checked={selectedOrderList.includes(order) && !isCleared}
                      onChange={() => {
                        handleSelectOrder(order);
                      }}
                    />
                  </td>
                  <td className="border px-4 py-2 hidden md:table-cell text-sm md:text-base">
                    {order.order_code}
                  </td>
                  <td className="border px-4 py-2 hidden md:table-cell text-sm md:text-base">
                    {order.created_at
                      ? format(order.created_at, "dd/MM/yyyy 'ás' HH:mm:ss")
                      : "Data indisponível"}
                  </td>
                  <td className="border px-4 py-2 text-xs md:text-base">
                    {order.cliente?.nomeDoCliente}
                  </td>
                  <td className=" border px-4 py-2 ">
                    <div className="flex  justify-center">
                      <CircleIcon
                        className={`${
                          order.status_order === 1
                            ? " fill-orange-200  text-orange-400"
                            : order.status_order === 2
                            ? "text-blue-500 fill-blue-300 "
                            : order.status_order === 4 &&
                              "fill-purple-200 text-purple-400"
                        } `}
                      />
                    </div>
                  </td>
                  <td className=" border px-4 py-2 ">
                    <Button
                      className={` ${
                        order.status_order === 1
                          ? " bg-orange-100  text-orange-400 hover:bg-orange-300"
                          : order.status_order === 2
                          ? "text-blue-500 bg-blue-300"
                          : order.status_order === 4
                          ? "bg-purple-200 text-purple-400"
                          : "bg-slate-200 text-black"
                      } `}
                      onClick={() =>
                        handleAprovedOrder(
                          order.id ?? null,
                          order.status_order + 1
                        )
                      }
                      disabled={order.status_order > 1}
                    >
                      {order.status_order <= 1 ? "Aprovar" : "Aprovado"}
                    </Button>
                  </td>
                  <td className="border px-4 py-2 ">
                    <select
                      value={order.status_order}
                      onChange={(e) => {
                        if (order.status_order && order.id) {
                          const nextStatus = Number(e.target.value);
                          handleUpdatedStatusOrder(order.id, nextStatus);
                        }
                      }}
                      disabled={(order.status_order ?? 0) >= 6}
                      className={`px-2 py-1 rounded text-xs md:text-base  ${
                        order.status_order === 3
                          ? "bg-blue-200 text-blue-800 hover:bg-blue-300"
                          : order.status_order === 4
                          ? "bg-purple-200 text-purple-800 hover:bg-purple-300"
                          : order.status_order === 5
                          ? "bg-green-300 text-green-900 "
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {selectOptions.map((option, index) => {
                        return (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  {typeUser !== "fábrica" && (
                    <td className="border px-4 py-2 hidden md:table-cell">
                      {order.total?.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                  )}
                  <td className="border px-4 py-2 hidden md:table-cell">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded">
                          Imprimir
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="flex flex-col">
                          <span>Escolha o tipo de impressão:</span>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                const type = "A4";
                                handlePrintItens(order, type);
                              }}
                              className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded"
                            >
                              Imprimir A4
                            </Button>
                            <Button
                              onClick={() => {
                                const type = "termica";
                                handlePrintItens(order, type);
                              }}
                              className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded"
                            >
                              Imprimir Térmica
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </>
  );
}
