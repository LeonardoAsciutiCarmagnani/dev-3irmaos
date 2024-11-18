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

interface StatusProps {
  0: "Todos os pedidos";
  1: "Pedido Aberto";
  2: "Em produção";
  3: "Pedido pronto";
  4: "Pedido faturado";
  5: "Pedido enviado";
  6: "Entregue";
}

interface IFormInput {
  inputText: string;
  selectStatus: StatusProps;
}

export function GetOrdersClientComponent() {
  const [orderList, setOrderList] = useState<OrderSaleTypes[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderSaleTypes[]>([]);
  const { register, handleSubmit } = useForm<IFormInput>();
  const { toastError } = ToastNotifications();

  const fetchOrders = async () => {
    try {
      const getUserCredentials = localStorage.getItem("user");
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
        });
        setOrderList(queryList);
      }
    } catch (e) {
      console.error("Ocorreu um erro ao buscar os pedidos !", e);
    }
  };

  const handleSearchOrders: SubmitHandler<IFormInput> = (data) => {
    // const searchName = data.inputText.trim();
    const selectedStatus = Number(data.selectStatus);

    const filteredList = orderList.filter((order) => {
      //   const matchesName =
      //     searchName.length > 1
      //       ? order.cliente?.nomeDoCliente === searchName
      //       : true;
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
        <header className="flex flex-1   p-4 bg-gray-100">
          <h1 className="text-xl font-bold">Lista de Pedidos</h1>
        </header>
        <form
          onSubmit={handleSubmit(handleSearchOrders)}
          className="flex flex-wrap items-center gap-4 p-4 bg-gray-50"
        >
          {/* <Input
            type="text"
            placeholder="Buscar por cliente ou ID"
            {...register("inputText")}
            className="border px-4 py-2 rounded w-full text-sm md:w-1/3 placeholder:text-sm"
          /> */}
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
          {/* <input type="date" className="border px-4 py-2 rounded" /> */}
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
            <th className="border md:px-4 py-2 hidden md:table-cell">ID</th>
            <th className="border md:px-4 py-2">Cliente</th>
            <th className="border md:px-4 py-2">Status</th>
            <th className="border md:px-4 py-2">Vizualizar produtos</th>
            <th className="border md:px-4 py-2 hidden md:table-cell">Valor</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            <>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 hidden md:table-cell">
                    {order.id}
                  </td>
                  <td className="border px-4 py-2">
                    {order.cliente?.nomeDoCliente}
                  </td>
                  <td className="border px-4 py-2 ">
                    <Button
                      disabled
                      className={`px-2 py-1 rounded  ${
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
                  <td className="border px-4 py-2">
                    <Dialog>
                      <DialogTrigger>
                        <span className="bg-blue-500 text-white px-2 py-1 rounded">
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
                        <div className=" md:hidden space-y-2">
                          <div className="flex justify-between border-2 rounded-lg p-2">
                            <span className="font-semibold text-sm items-start">
                              ID:
                            </span>
                            <span className="text-sm text-center ">
                              {order.id}
                            </span>
                          </div>
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
                </tr>
              ))}
            </>
          ) : (
            <>
              {orderList.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 hidden md:table-cell">
                    {order.id}
                  </td>
                  <td className="border px-4 py-2">
                    {order.cliente?.nomeDoCliente}
                  </td>
                  <td className="border px-4 py-2 ">
                    <Button
                      disabled
                      className={`px-2 py-1 rounded opacity-100  ${
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
                  <td className="border px-4 py-2">
                    <Dialog>
                      <DialogTrigger>
                        <span className="bg-blue-500 text-white px-2 py-1 rounded">
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
                        <div className=" md:hidden space-y-2">
                          <div className="flex justify-between border-2 rounded-lg p-2">
                            <span className="font-semibold text-sm items-start">
                              ID:
                            </span>
                            <span className="text-sm text-center ">
                              {order.id}
                            </span>
                          </div>
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
                        <div className="text-sm space-y-2 p-2 md:text-base">
                          {order.itens.map((product) => (
                            <div
                              key={product.produtoId}
                              className="flex flex-col border-2  space-y-2 p-2 rounded-lg items-center"
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
