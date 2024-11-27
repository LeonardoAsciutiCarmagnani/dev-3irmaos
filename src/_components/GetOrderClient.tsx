import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import { useEffect, useState } from "react";
import { OrderSaleTypes } from "./PostSaleOrder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import ToastNotifications from "./Toasts";
import { format } from "date-fns";
import Sidebar from "./Sidebar";

interface StatusProps {
  [key: number]: string;
}

interface IFormInput {
  inputText: string;
  selectDate: string;
  selectStatus: StatusProps;
}

export function GetOrdersClientComponent() {
  const [orderList, setOrderList] = useState<OrderSaleTypes[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderSaleTypes[]>([]);
  const { register, handleSubmit } = useForm<IFormInput>();
  const { toastError } = ToastNotifications();

  const fetchOrders = async () => {
    try {
      const getUserCredentials = localStorage.getItem("loggedUser");
      console.log(getUserCredentials);
      let userCredentials: { uid: string } | null = null;
      if (getUserCredentials) {
        userCredentials = JSON.parse(getUserCredentials);
        console.log(userCredentials?.uid);
      }

      const queryList: OrderSaleTypes[] = [];
      const docRef = collection(firestore, "sales_orders");
      const q = query(docRef, where("IdClient", "==", userCredentials?.uid));
      const docSnap = await getDocs(q);
      if (!docSnap.empty) {
        docSnap.docs.map((item) => {
          const data = item.data() as OrderSaleTypes;

          const total = data.itens.reduce(
            (acc, item) => acc + (item.preco || 0) * item.quantidade,
            0
          );

          queryList.push({ ...data, total });

          queryList.sort((a, b) => (a.order_code ?? 0) - (b.order_code ?? 0));
        });
        setOrderList(queryList);
      }
    } catch (e) {
      console.error("Ocorreu um erro ao buscar os pedidos !", e);
    }
  };

  const handleSearchOrders: SubmitHandler<IFormInput> = (data) => {
    const selectedStatus = Number(data.selectStatus);
    const formalizedDate = data.selectDate.replace(/-/g, "/");
    console.log(formalizedDate);

    const filteredList = orderList.filter((order) => {
      const matchesStatus =
        selectedStatus > 0 ? order.status_order === selectedStatus : true;

      return matchesStatus;
    });

    if (filteredList.length > 0) {
      setFilteredOrders(filteredList);
    } else {
      toastError("Nenhum pedido encontrado!");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen">
      <div className="flex flex-col text-center border-2">
        <header className="flex  w-full items-center justify-between  p-4 bg-gray-100">
          <Sidebar />
          <div className="flex w-full text-center items-center justify-center">
            <h1 className="text-xl font-bold">Lista de Pedidos</h1>
          </div>
        </header>
        <form
          onSubmit={handleSubmit(handleSearchOrders)}
          className="flex flex-wrap items-center gap-4 p-4 bg-gray-50"
        >
          <select
            className="border px-4 py-2 rounded"
            {...register("selectStatus")}
          >
            <option value="0">Todos os status</option>
            <option value="1">Pedido Aberto</option>
            <option value="2">Em produção</option>
            <option value="3">Pedido pronto</option>
            <option value="4">Pedido faturado</option>
            <option value="5">Pedido enviado</option>
            <option value="6">Entregue</option>
          </select>
          <input
            type="date"
            className="border px-4 py-2 rounded"
            {...register("selectDate")}
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            type="submit"
          >
            Filtrar
          </button>
        </form>
      </div>
      <table className="w-full border-collapse text-center border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border md:px-4 py-2 text-sm md:text-base"></th>
            <th className="border md:px-4 py-2 hidden text-sm md:text-base md:table-cell">
              Número do pedido
            </th>
            <th className="border md:px-4 py-2 hidden md:table-cell text-sm md:text-base md:table-cel">
              Data de criação
            </th>
            <th className="border md:px-4 py-2 text-sm md:text-base">
              Cliente
            </th>
            <th className="border md:px-4 py-2 text-sm md:text-base">Status</th>
            <th className="border md:px-4 py-2 text-sm md:text-base">
              Detalhes
            </th>
            <th className="border md:px-4 py-2 text-sm md:text-base hidden md:table-cell">
              Valor
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            <>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className={
                    order.created_at === undefined
                      ? "hidden"
                      : "hover:bg-gray-50"
                  }
                >
                  <td className="border px-4 py-2 text-sm md:text-base ">
                    <input type="checkbox" name="" id="" />
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
                  <td className="border px-4 py-2 ">
                    <Button
                      disabled={(order.status_order ?? 0) >= 6}
                      className={`px-2 py-1 rounded text-xs md:text-base  ${
                        order.status_order === 1
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : order.status_order === 2
                          ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                          : order.status_order === 3
                          ? "bg-blue-200 text-blue-800 hover:bg-blue-300"
                          : order.status_order === 4
                          ? "bg-purple-200 text-purple-800 hover:bg-purple-300"
                          : order.status_order === 5
                          ? "bg-orange-200 text-orange-800 hover:bg-orange-300"
                          : order.status_order === 6
                          ? "bg-green-300 text-green-900 "
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {order.status_order === 1
                        ? "Pedido Aberto"
                        : order.status_order === 2
                        ? "Em produção"
                        : order.status_order === 3
                        ? "Pedido pronto"
                        : order.status_order === 4
                        ? "Pedido faturado"
                        : order.status_order === 5
                        ? "Pedido enviado"
                        : order.status_order === 6 && "Entregue"}
                    </Button>
                  </td>
                  <td className="border px-4 py-2 text-sm md:text-base">
                    <Dialog>
                      <DialogTrigger>
                        <span className="bg-blue-500 text-white px-2  text-xs md:text-base py-1 rounded hover:bg-blue-700">
                          Ver
                        </span>
                      </DialogTrigger>
                      <DialogContent
                        className="overflow-y-scroll h-96"
                        aria-describedby={undefined}
                      >
                        <DialogHeader>
                          <DialogTitle>Lista de produtos: </DialogTitle>
                        </DialogHeader>
                        <div className=" md:hidden space-y-2 flex flex-col items-center justify-center">
                          <div className="flex justify-between border-2 rounded-lg p-2">
                            <span className="font-semibold text-sm items-start">
                              ID:
                            </span>
                            <span className="text-sm text-center ">
                              {order.id}
                            </span>
                          </div>
                          <div></div>
                          <div className="flex justify-between border-2 rounded-lg items-center p-1">
                            <span className="text-sm font-semibold">
                              Valor total do pedido:
                            </span>
                            <span>
                              {order.total?.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className=" rounded-lg text-sm space-y-2 p-2 md:text-base">
                          {order.itens.map((product) => (
                            <div
                              key={product.produtoId}
                              className="flex flex-col border-2 space-y-2 p-2 rounded-lg items-center"
                            >
                              <span>{product.nome}</span>
                              <span>Quantidade: {product.quantidade}</span>
                              <span>
                                {product.preco?.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                  <td className="border px-4 py-2 hidden md:table-cell">
                    {order.total?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="border px-4 py-2 hidden md:table-cell">
                    <div>
                      <Button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700">
                        Imprimir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </>
          ) : (
            <>
              {orderList.map((order) => (
                <tr
                  key={order.id}
                  className={
                    order.created_at === undefined
                      ? "hidden"
                      : "hover:bg-gray-50"
                  }
                >
                  <td className="border px-4 py-2 text-sm md:text-base ">
                    <input type="checkbox" name="" id="" />
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
                  <td className="border px-4 py-2 ">
                    <Button
                      disabled={(order.status_order ?? 0) >= 6}
                      className={`px-2 opacity-60 py-1 rounded text-xs md:text-base  ${
                        order.status_order === 1
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : order.status_order === 2
                          ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                          : order.status_order === 3
                          ? "bg-blue-200 text-blue-800 hover:bg-blue-300"
                          : order.status_order === 4
                          ? "bg-purple-200 text-purple-800 hover:bg-purple-300"
                          : order.status_order === 5
                          ? "bg-orange-200 text-orange-800 hover:bg-orange-300"
                          : order.status_order === 6
                          ? "bg-green-300 text-green-900 "
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {order.status_order === 1
                        ? "Pedido Aberto"
                        : order.status_order === 2
                        ? "Em produção"
                        : order.status_order === 3
                        ? "Pedido pronto"
                        : order.status_order === 4
                        ? "Pedido faturado"
                        : order.status_order === 5
                        ? "Pedido enviado"
                        : order.status_order === 6 && "Entregue"}
                    </Button>
                  </td>
                  <td className="border px-4 py-2 text-sm md:text-base">
                    <Dialog>
                      <DialogTrigger>
                        <span className="bg-blue-500 text-white px-2  text-xs md:text-base py-1 rounded hover:bg-blue-700">
                          Ver
                        </span>
                      </DialogTrigger>
                      <DialogContent
                        className="overflow-y-scroll h-96"
                        aria-describedby={undefined}
                      >
                        <DialogHeader>
                          <DialogTitle>Lista de produtos: </DialogTitle>
                        </DialogHeader>
                        <div className=" md:hidden space-y-2 flex flex-col items-center justify-center">
                          <div className="flex justify-between border-2 rounded-lg p-2">
                            <span className="font-semibold text-sm items-start">
                              ID:
                            </span>
                            <span className="text-sm text-center ">
                              {order.id}
                            </span>
                          </div>
                          <div></div>
                          <div className="flex justify-between border-2 rounded-lg items-center p-1">
                            <span className="text-sm font-semibold">
                              Valor total do pedido:
                            </span>
                            <span>
                              {order.total?.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          </div>
                          <Button className="bg-blue-500 text-white px-2 py-1 rounded">
                            Imprimir
                          </Button>
                        </div>
                        <div className=" rounded-lg text-sm space-y-2 p-2 md:text-base">
                          {order.itens.map((product) => (
                            <div
                              key={product.produtoId}
                              className="flex flex-col border-2 space-y-2 p-2 rounded-lg items-center"
                            >
                              <span>{product.nome}</span>
                              <span>Quantidade: {product.quantidade}</span>
                              <span>
                                {product.preco?.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                  <td className="border px-4 py-2 hidden md:table-cell">
                    {order.total?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
