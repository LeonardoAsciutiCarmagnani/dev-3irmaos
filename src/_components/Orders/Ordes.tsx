import { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoIcon, PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
// import { toast } from "sonner";
// import {
//   collection,
//   doc,
//   getDocs,
//   onSnapshot,
//   query,
//   updateDoc,
//   where,
// } from "firebase/firestore";

import Dropzone from "../DropzoneImage/DropzoneImage";
import { Input } from "@/components/ui/input";
import DetaisOrder from "../DetailsOrder/DetailsOrder";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";

export interface ProductsInOrderProps {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface SellerProps {
  id: number;
  name: string;
}

export interface IClient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface IDeliveryAddress {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  ibge: string;
}

interface IPaymentMethod {
  id: string;
  name: string;
}

export interface Order {
  id: string;
  client: IClient;
  deliveryAddress: IDeliveryAddress;
  products: ProductsInOrderProps[];
  orderId: number;
  orderStatus: number;
  totalValue: number;
  createdAt: string;
  paymentMethod?: IPaymentMethod;
}

/* 
[] Incluir nas props do produto as medidas informadas
[] Receber os sketches que o cliente informar
[] Poder subir novas imagens para o envio da proposta comercial
*/

const OrdersTable = () => {
  const [date, setDate] = useState<DateRange>();

  const [data, setData] = useState<Order[]>([
    {
      orderId: 1,
      client: {
        id: "1",
        name: "Lucas Seidel",
        email: "lsilva@multipoint.com.br",
        phone: "11994217053",
      },
      createdAt: "14/04/2025",
      deliveryAddress: {
        cep: "09230600",
        city: "Santo André",
        ibge: "1234567",
        neighborhood: "Vila Alzira",
        number: "303",
        state: "SP",
        street: "São Camilo",
      },
      id: "2",
      orderStatus: 1,
      products: [
        {
          productId: 33001,
          productName: "Produto para Teste Mock",
          price: 265.9,
          quantity: 2,
        },
      ],
      totalValue: 531.8,
    },
    {
      orderId: 2,
      client: {
        id: "1",
        name: "Rodinei",
        email: "rodinei@multipoint.com.br",
        phone: "11994217053",
      },
      createdAt: "14/04/2025",
      deliveryAddress: {
        cep: "09230600",
        city: "Santo André",
        ibge: "1234567",
        neighborhood: "Vila Alzira",
        number: "303",
        state: "SP",
        street: "São Camilo",
      },
      id: "2",
      orderStatus: 2,
      products: [
        {
          productId: 33001,
          productName: "Produto para Teste Mock",
          price: 265.9,
          quantity: 2,
        },
      ],
      totalValue: 531.8,
    },
  ]);
  const [filteredData, setFilteredData] = useState<Order[]>(data);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(0); // zero igual a todos os status
  const [showCardOrder, setShowCardOrder] = useState<number | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [formaDePagamento, setformaDePagamento] = useState("");
  const [entrega, setEntrega] = useState("");
  const [frete, setFrete] = useState("");
  const [total, setTotal] = useState("");

  const navigate = useNavigate();

  const lisToUse = filteredData.length > 0 ? filteredData : data;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/getOrders");
        setData(response.data);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };
    fetchOrders();
  }, []);

  const filterOrders = () => {
    const filtered = data.filter((order) => {
      const orderDate = order.createdAt.split(" ")[0];
      const from = date?.from
        ? format(new Date(date.from), "dd/MM/yyyy")
        : null;
      const to = date?.to ? format(new Date(date.to), "dd/MM/yyyy") : null;

      const isWithinRange =
        !from || !to || (orderDate >= from && orderDate <= to);

      return (
        (statusFilter === 0 || order.orderStatus === statusFilter) &&
        (searchTerm === "" ||
          order.client.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        isWithinRange
      );
    });

    setFilteredData(filtered);
  };
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "orderId",
        cell: ({ row }) => row.getValue("orderId"),
      },
      {
        header: "Data",
        accessorKey: "createdAt",
        cell: ({ row }) =>
          new Date(row.getValue("createdAt")).toLocaleDateString(),
      },
      {
        header: "Cliente",
        accessorKey: "customerName",
        cell: ({ row }) => row.getValue("customerName"),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => row.getValue("status"),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData ? filteredData : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // const typeUser = "commom";

  const formattedFrom = date?.from
    ? format(date.from, "dd/MM/yyyy")
    : "--/--/----";
  const formattedTo = date?.to ? format(date.to, "dd/MM/yyyy") : "--/--/----";

  const selectedOptions = [
    { id: 1, option: "Orçamento", value: 1 },
    { id: 2, option: "Proposta enviada", value: 2 },
    { id: 3, option: "Proposta recusada", value: 3 },
    { id: 4, option: "Aprovado", value: 4 },
    { id: 5, option: "Pedido em produção", value: 5 },
    { id: 6, option: "Faturado", value: 6 },
    { id: 7, option: "Despachado", value: 7 },
    { id: 8, option: "Pedido Concluído", value: 8 },
    { id: 9, option: "Cancelado", value: 9 },
  ];
  async function handleStatusChange(id: number, newStatus: number) {
    console.log(newStatus);
    console.log(id);
    /*  try {
      const collectionRef = collection(db, "orders");
      const q = query(collectionRef, where("orderId", "==", id));
      const orderData = await getDocs(q);

      if (orderData.empty) {
        console.log("Pedido não encontrado!");
        toast.error("Pedido não encontrado.");
        return;
      }

      let orderDocRef = null;

      orderData.forEach((docSnap) => {
        orderDocRef = doc(db, "orders", docSnap.id);
      });

      if (!orderDocRef) return;

      await updateDoc(orderDocRef, {
        orderStatus: newStatus,
      });

      setData((prevData) =>
        prevData.map((order) =>
          order.orderId === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.log("Ocorreu um erro ao tentar atualizar o pedido", error);
      toast.error("Ocorreu um erro ao tentar atualizar o pedido");
    } */
  }

  function handleShowCard(orderId: number) {
    setShowCardOrder(orderId);
  }

  /* useEffect(() => {
    const collectionRef = collection(db, "orders");
    const q = query(collectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedData = snapshot.docs.map((doc) => ({
        ...(doc.data() as Order),
      }));
      setData(updatedData);
    });

    return () => unsubscribe(); // Para evitar vazamento de memória
  }, []); */

  return (
    <div className="space-y-2 py-2 md:p-4 bg-white rounded-lg shadow w-full h-full">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-start md:items-center p-2 gap-4">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded-sm md:w-1/3"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(Number(e.target.value))}
          className="border p-2 rounded w-fit hover:cursor-pointer"
        >
          <option value={0}>Todos os status</option>
          {selectedOptions.map((option) => (
            <option key={option.id} value={option.value}>
              {option.option}
            </option>
          ))}
        </select>
        <Popover>
          <PopoverTrigger className="flex items-center border p-2 w-52 rounded-sm hover:cursor-pointer">
            {date?.from || date?.to ? (
              <div className="flex gap-1 items-center  text-center ">
                <span>{formattedFrom}</span>
                <span className="border border-l-black h-[1rem]" />
                <span className="border border-l-black h-[1rem]" />
                <span>{formattedTo}</span>
              </div>
            ) : (
              <span className=" w-full">Filtrar por periodo</span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-full">
            <Calendar
              mode="range"
              selected={date}
              onSelect={setDate}
              className="border p-2 rounded "
              lang={"pt-BR"}
            />
          </PopoverContent>
        </Popover>
        <Button onClick={() => filterOrders()}>Filtrar</Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between px-2">
        <div className="flex items-center gap-x-2">
          <InfoIcon className="w-4 h-4 text-blue-500" />
          <h2 className="text-[0.67rem] text-gray-500">
            Para visualizar os detalhes do pedido, clique duas vezes sobre ele.
          </h2>
        </div>
        <button
          onClick={() => {
            navigate("/criacao-de-pedido");
          }}
          className="flex gap-x-1 items-center text-[0.7rem] w-fit py-[0.45rem] px-2 bg-green-600 text-white rounded-sm font-semibold uppercase tracking-wide hover:shadow-lg hover:scale-[1.015] transition-all duration-300 hover:cursor-pointer"
        >
          <span>
            <PlusIcon size={19} />
          </span>
          Novo pedido
        </button>
      </div>

      {/* Tabela */}

      <div className="flex w-full border rounded-lg overflow-y-auto max-h-[72vh]">
        <table className="w-full overflow-y-scroll max-h-[73vh]">
          <thead className="bg-gray-50">
            {table
              ? table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))
              : undefined}
          </thead>
          {data ? (
            <>
              <tbody className="divide-y divide-gray-200">
                {data &&
                  lisToUse
                    .sort((a, b) => {
                      return b.orderId - a.orderId;
                    })
                    .map((order) => (
                      <Dialog
                        key={order.orderId}
                        open={showCardOrder === order.orderId}
                        onOpenChange={() => setShowCardOrder(null)}
                      >
                        <DialogTrigger asChild>
                          <tr
                            key={order.orderId}
                            className="hover:bg-gray-50 cursor-pointer text-sm"
                            onDoubleClick={() => handleShowCard(order.orderId)}
                          >
                            <td className="px-4 py-3">{order.orderId}</td>
                            <td className="px-4 py-3">{order.createdAt}</td>
                            <td className="px-4 py-3">{order.client.name}</td>
                            <td className="px-4 py-3">
                              <select
                                className={`w-fit rounded-full p-1 text-white font-semibold text-xs hover:cursor-pointer ${
                                  order.orderStatus === 1
                                    ? "bg-orange-500"
                                    : order.orderStatus === 2
                                    ? "bg-green-500"
                                    : order.orderStatus === 3
                                    ? "bg-gray-500"
                                    : ""
                                }`}
                                value={order.orderStatus}
                                onChange={(e) =>
                                  handleStatusChange(
                                    order.orderId,
                                    Number(e.target.value)
                                  )
                                }
                              >
                                {selectedOptions &&
                                  selectedOptions.map((option) => (
                                    <option
                                      key={option.id}
                                      value={option.value}
                                    >
                                      {option.option}
                                    </option>
                                  ))}
                              </select>
                            </td>
                          </tr>
                        </DialogTrigger>

                        <DialogContent className="flex flex-col border bg-gray-100 w-2/3 h-[80vh] overflow-y-scroll">
                          <DialogHeader>
                            <div className="flex justify-between items-center">
                              <DialogTitle>Detalhes do pedido</DialogTitle>
                            </div>
                            <div className="flex justify-between w-full bg-gray-200 p-2 rounded-xl items-center shadow-md">
                              <div>
                                <span className="text-xl font-bold text-gray-700">
                                  Pedido {order.orderId}
                                </span>
                                <div className=" flex flex-col justify-between">
                                  <div className="flex gap-2 items-center">
                                    <span className="font-semibold  text-gray-700">
                                      Cliente:
                                    </span>
                                    <span className="text-lg text-gray-700 ">
                                      {order.client.name}
                                    </span>
                                  </div>
                                  <div className="flex gap-2 items-center">
                                    <span className="font-semibold  text-gray-700">
                                      Email:
                                    </span>
                                    <span className="text-lg text-gray-700 ">
                                      {order.client.email}
                                    </span>
                                  </div>
                                  <div className="flex gap-2 items-center">
                                    <span className="font-semibold  text-gray-700">
                                      Telefone:
                                    </span>
                                    <span className="text-lg  text-gray-700 ">
                                      {order.client.phone}
                                    </span>
                                  </div>
                                  <div className="flex gap-2 items-center">
                                    <span className="font-semibold  text-gray-700">
                                      Data:{" "}
                                    </span>
                                    <span className="  text-gray-700">
                                      {order.createdAt}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogHeader>
                          <div>
                            <div className="font-semibold text-lg">
                              Produtos do orçamento
                            </div>
                            <div className="p-2 rounded-lg bg-gray-200 max-h-40 w-1/2 overflow-y-scroll  ">
                              {order.products &&
                                order.products.map((item) => {
                                  return (
                                    <div
                                      key={item.productId}
                                      className="flex flex-col  w-full justify-around"
                                    >
                                      <div className="flex   w-full">
                                        <span className="flex-1 text-lg text-gray-700">
                                          {item.productName}
                                        </span>
                                        <div className="flex gap-2 w-[9rem] items-center">
                                          <div className="border-r border-gray-700 h-4" />
                                          <span className="text-lg text-gray-700">
                                            {item.quantity} x{" "}
                                            {item.price.toLocaleString(
                                              "pt-BR",
                                              {
                                                style: "currency",
                                                currency: "BRL",
                                              }
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            {/* Sketches */}
                            <div className="flex flex-col gap-2">
                              <h1 className="font-semibold">
                                Imagens fornecidas
                              </h1>
                              <div className="flex gap-2 items-center">
                                <img
                                  src="https://images.unsplash.com/photo-1503898362-59e068e7f9d8?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                  alt="Sketch"
                                  className="size-32 rounded-lg hover:scale-105 transition-all duration-300"
                                />
                                <img
                                  src="https://images.unsplash.com/photo-1536160885591-301854e2ed04?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                  alt="Sketch"
                                  className="size-32 rounded-lg hover:scale-105 transition-all duration-300"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-4">
                            {/* Upload de imagens */}
                            <h1 className="font-semibold text-lg">
                              Projeto (imagens ilustrativas)
                            </h1>
                            <Dropzone />
                          </div>

                          <div>
                            {/* Inputs para alteração das informações dinâmicas da proposta */}
                            <Accordion type="single" collapsible>
                              <AccordionItem value="item-1">
                                <AccordionTrigger className="text-lg">
                                  Informar detalhes da proposta
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col space-y-2">
                                  <div className="flex flex-col gap-2 w-1/2">
                                    <label
                                      htmlFor="observacoes"
                                      className="font-semibold"
                                    >
                                      Observações:
                                    </label>
                                    <Textarea
                                      placeholder="Observações da proposta"
                                      id="observacoes"
                                      onChange={(e) => {
                                        setObservacoes(e.target.value);
                                      }}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-2 w-1/2">
                                    <label
                                      htmlFor="pagamento"
                                      className="font-semibold"
                                    >
                                      Forma de pagamento:
                                    </label>
                                    <Input
                                      placeholder="Forma de pagamento"
                                      id="pagamento"
                                      onChange={(e) => {
                                        setformaDePagamento(e.target.value);
                                      }}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-2 w-1/2">
                                    <label
                                      htmlFor="prazo"
                                      className="font-semibold"
                                    >
                                      Prazo de entrega:
                                    </label>
                                    <Input
                                      placeholder="Prazo de entrega"
                                      id="prazo"
                                      onChange={(e) => {
                                        setEntrega(e.target.value);
                                      }}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-2 w-1/2">
                                    <label
                                      htmlFor="prazo"
                                      className="font-semibold"
                                    >
                                      Frete:
                                    </label>
                                    <Input
                                      placeholder="Prazo de entrega"
                                      id="prazo"
                                      onChange={(e) => setFrete(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-2 w-1/2">
                                    <label
                                      htmlFor="prazo"
                                      className="font-semibold"
                                    >
                                      Valor final da proposta:
                                    </label>
                                    <Input
                                      placeholder="Prazo de entrega"
                                      id="prazo"
                                      onChange={(e) => setTotal(e.target.value)}
                                    />
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>

                            <DetaisOrder
                              observacoes={observacoes}
                              formaDePagamento={formaDePagamento}
                              prazoEntrega={entrega}
                              frete={Number(frete)}
                              total={Number(total)}
                            />
                          </div>
                          <Button>Enviar proposta</Button>
                        </DialogContent>
                      </Dialog>
                    ))}
              </tbody>
            </>
          ) : (
            <span className="p-2 font-semibold text-gray-700">
              Nenhum pedido encontrado
            </span>
          )}
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
