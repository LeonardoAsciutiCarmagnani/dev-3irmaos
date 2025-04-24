/* eslint-disable react-hooks/exhaustive-deps */
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
import { InfoIcon, LoaderCircle } from "lucide-react";
import Dropzone from "../DropzoneImage/DropzoneImage";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, storage } from "../Utils/FirebaseConfig";
import { toast } from "sonner";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import DetailsOrder from "./DetailsOrder/DetailsOrder";
import { IMaskInput } from "react-imask";
import { useAuthStore } from "@/context/authContext";
import { Link } from "react-router-dom";

export interface ProductsInOrderProps {
  id: number;
  nome: string;
  quantidade: number;
  preco: number;
  altura: number;
  largura: number;
  comprimento: number;
  listImages: { imagem: string }[];
  selectedVariation: { id: string; nomeVariacao: string };
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
interface DetailsPropostalProps {
  obs: string;
  payment: string;
  time: string;
  delivery: number;
}
export interface Order {
  id: number;
  client: IClient;
  deliveryAddress: IDeliveryAddress;
  products: ProductsInOrderProps[];
  orderId: number;
  orderStatus: number;
  totalValue: number;
  createdAt: string;
  paymentMethod?: IPaymentMethod;
  detailsPropostal: DetailsPropostalProps;
  imagesUrls: string[];
}

type OrderStatusType = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

const ClientOrdersTable = () => {
  const { user } = useAuthStore();

  const [date, setDate] = useState<DateRange>();

  const [data, setData] = useState<Order[]>([]);
  const [filteredData, setFilteredData] = useState<Order[]>(data);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(0); // zero igual a todos os status
  const [showCardOrder, setShowCardOrder] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [sendPropostal, setSendPropostal] = useState(false);

  /* Detalhes do orçamento */
  const [obs, setObs] = useState("");
  const [payment, setPayment] = useState("");
  const [time, setTime] = useState("");
  const [delivery, setDelivery] = useState(0);

  const lisToUse = filteredData.length > 0 ? filteredData : data;

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

  function handleAllData(
    obs: string,
    payment: string,
    time: string,
    delivery: number
  ) {
    setObs(obs);
    setPayment(payment);
    setTime(time);
    setDelivery(delivery);
    return { obs, payment, time, delivery };
  }

  function handleChangePrice(
    orderId: number,
    productId: string,
    newPrice: number
  ) {
    setData((prevData) => {
      // Atualiza os produtos com novo preço e recalcula totalValue por produto
      const updatedData = prevData.map((order) => {
        if (order.orderId !== orderId) return order;

        const updatedProducts = order.products.map((product) => {
          if (product.selectedVariation.id === productId) {
            const quantidade = product.quantidade || 1;
            return {
              ...product,
              preco: newPrice,
              totalValue: newPrice * quantidade,
            };
          }

          // Garante que totalValue seja sempre coerente
          const preco = product.preco || 0;
          const quantidade = product.quantidade || 1;
          return {
            ...product,
            totalValue: preco * quantidade,
          };
        });

        // Calcula o total do pedido com base nos totalValue dos produtos
        const orderTotal = updatedProducts.reduce((sum, product) => {
          return sum + (product.totalValue || 0);
        }, 0);

        return {
          ...order,
          products: updatedProducts,
          totalValue: orderTotal,
        };
      });

      return updatedData;
    });
  }

  function handleImagesSelected(files: File[]) {
    setSelectedImages(Array.from(files));
  }

  async function UploadImagesForStorage(
    images: FileList | File[],
    orderId: number
  ): Promise<string[]> {
    if (!images || images.length === 0) return [];

    const uploadPromises = Array.from(images).map(async (file) => {
      const uniqueFileName = `${Date.now()}_${file.name}_order_${orderId}`;
      const storagePath = `imagens/${uniqueFileName}`;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    });

    return Promise.all(uploadPromises); // retorna todas as URLs das imagens
  }

  async function handleUpdatedStatusOrder(
    orderToPush: Order,
    newOrderStatus: number
  ) {
    try {
      setSendPropostal(true);
      console.log("Order to push =>", orderToPush);
      const collectionRef = collection(db, "budgets");
      const q = query(
        collectionRef,
        where("orderId", "==", orderToPush.orderId)
      );
      const orderData = await getDocs(q);

      if (orderData.empty) {
        console.log("Pedido não encontrado!");
        toast.error("Pedido não encontrado.");
        return;
      }

      let orderDocRef = null;

      orderData.forEach((docSnap) => {
        orderDocRef = doc(db, "budgets", docSnap.id);
      });

      if (!orderDocRef) return;

      const imagesUrls = await UploadImagesForStorage(
        selectedImages,
        orderToPush.orderId
      );

      const updatedPriceInProduct = orderToPush.products.map((product) => ({
        ...product,
        preco: product.preco,
      }));

      await updateDoc(orderDocRef, {
        orderStatus: newOrderStatus,
        products: updatedPriceInProduct,
        imagesUrls: imagesUrls,
        detailsPropostal: { obs, payment, time, delivery },
        totalValue: orderToPush.totalValue,
      });

      setData((prevData) =>
        prevData.map((order) =>
          order.orderId === orderToPush.orderId
            ? { ...order, status: 2 }
            : order
        )
      );
      setSendPropostal(false);
      toast.success("Status atualizado com sucesso !");
    } catch (error) {
      setSendPropostal(false);
      console.log("Ocorreu um erro ao tentar atualizar o pedido", error);
      toast.error("Ocorreu um erro ao tentar atualizar o pedido");
    }
  }

  function handleShowCard(orderId: number) {
    setShowCardOrder(orderId);
  }

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

  const statusMap: Record<OrderStatusType, { label: string; color: string }> = {
    2: { label: "Proposta recebida", color: "bg-amber-500" },
    3: { label: "Proposta recusada", color: "bg-red-500" },
    4: { label: "Proposta aceita", color: "bg-emerald-500" },
    5: { label: "Proposta aprovada", color: "bg-emerald-500" },
    6: { label: "Pedido em produção", color: "bg-yellow-500" },
    7: { label: "Faturado", color: "bg-blue-500" },
    8: { label: "Despachado", color: "bg-purple-500" },
    9: { label: "Pedido concluído", color: "bg-green-600" },
    10: { label: "Pedido cancelado", color: "bg-gray-500" },
  };

  useEffect(() => {
    const collectionRef = collection(db, "budgets");
    const q = query(collectionRef, where("client.id", "==", user?.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedData = snapshot.docs.map((doc) => ({
        ...(doc.data() as Order),
      }));
      console.log("Dados atualizados:", updatedData);
      setData(updatedData);
    });

    return () => unsubscribe(); // Para evitar vazamento de memória
  }, []);

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
          {data.length !== 0 ? (
            <>
              <tbody className="divide-y divide-gray-200">
                {data &&
                  lisToUse
                    .sort((a, b) => {
                      return b.orderId - a.orderId;
                    })
                    .map((order) => {
                      const status =
                        statusMap[order.orderStatus as OrderStatusType];

                      return (
                        <Dialog
                          key={order.orderId}
                          open={showCardOrder === order.orderId}
                          onOpenChange={() => setShowCardOrder(null)}
                        >
                          <DialogTrigger asChild>
                            <tr
                              key={order.orderId}
                              className="hover:bg-gray-50 cursor-pointer text-sm"
                              onDoubleClick={() =>
                                handleShowCard(order.orderId)
                              }
                            >
                              <td className="px-4 py-3">{order.orderId}</td>
                              <td className="px-4 py-3">{order.createdAt}</td>
                              <td className="px-4 py-3">{order.client.name}</td>
                              <td className="px-4 py-3">
                                <div
                                  className={`w-fit rounded-full p-1 text-white font-semibold text-xs hover:cursor-pointer ${
                                    status?.color || "bg-zinc-300"
                                  }`}
                                >
                                  {status?.label || "Status desconhecido"}
                                </div>
                              </td>
                            </tr>
                          </DialogTrigger>

                          <DialogContent className="flex flex-col border bg-gray-100 w-2/3 h-[80vh] overflow-y-scroll">
                            <DialogHeader>
                              <div className="flex justify-between items-center">
                                <DialogTitle>Detalhes do pedido</DialogTitle>
                                <Link
                                  to={"/imprimir"}
                                  state={{
                                    id: order.orderId,
                                    createdAt: order.createdAt,
                                    client: order.client,
                                    products: order.products,
                                    imagesUrls: order.imagesUrls,
                                    details: order.detailsPropostal,
                                    address: order.deliveryAddress,
                                    totalValue: order.totalValue,
                                  }}
                                >
                                  <Button>Imprimir</Button>
                                </Link>
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
                              <div className="p-2 max-h-50 w-2/3 overflow-y-scroll space-y-2">
                                {order.products &&
                                  order.products.map((item) => {
                                    return (
                                      <>
                                        <div
                                          key={item.id}
                                          className="flex flex-col  rounded-lg bg-gray-200 w-full justify-around"
                                        >
                                          <div className="flex p-2 gap-2 w-full">
                                            <div className="flex-1">
                                              <span className="flex-1 text-lg text-gray-700">
                                                {item.nome}
                                              </span>
                                              <div className="text-sm text-gray-500 flex gap-2">
                                                <span>
                                                  Altura: {item.altura}
                                                </span>
                                                <span>
                                                  Largura: {item.largura}
                                                </span>
                                                <span>
                                                  Comprimento:{" "}
                                                  {item.comprimento}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="flex gap-2 w-[12rem] items-center">
                                              <div className="border-r border-gray-700 h-4" />
                                              <div className="flex  items-center">
                                                <span className="text-lg text-gray-700">
                                                  {item.quantidade} x{" "}
                                                </span>
                                                <IMaskInput
                                                  mask="R$ num"
                                                  blocks={{
                                                    num: {
                                                      mask: Number,
                                                      scale: 2,
                                                      thousandsSeparator: ".",
                                                      padFractionalZeros: true,
                                                      normalizeZeros: true,
                                                      radix: ",",
                                                      mapToRadix: ["."],
                                                    },
                                                  }}
                                                  value={String(item.preco)}
                                                  unmask={true} // isso faz com que o valor passado seja numérico
                                                  disabled={
                                                    order.orderStatus > 1
                                                  }
                                                  onAccept={(value: string) => {
                                                    const precoFloat =
                                                      parseFloat(value);
                                                    handleChangePrice(
                                                      order.orderId,
                                                      item.selectedVariation.id,
                                                      precoFloat
                                                    );
                                                  }}
                                                  className="border rounded px-2 py-1 w-[8rem] text-right"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </>
                                    );
                                  })}
                              </div>
                            </div>

                            <div className="flex gap-2 items-center">
                              <div className="flex flex-col gap-2">
                                <h1 className="font-semibold text-lg">
                                  Imagens do produto
                                </h1>
                                <div className="flex flex-col gap-2 items-start">
                                  {order.products.map((item) => {
                                    return (
                                      <div
                                        key={item.id}
                                        className="flex flex-col gap-2 items-start"
                                      >
                                        <span className="text-lg text-gray-700">
                                          {item.nome}
                                        </span>
                                        <div className="flex gap-2 ">
                                          {item.listImages.map(
                                            (image, index) => {
                                              return (
                                                <img
                                                  key={index}
                                                  src={image.imagem}
                                                  alt="Imagem do produto"
                                                  className="size-40 rounded-lg hover:scale-105 transition-all duration-300"
                                                />
                                              );
                                            }
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-4">
                              {/* Upload de imagens */}
                              <h1 className="font-semibold text-lg">
                                Projeto (imagens ilustrativas)
                              </h1>
                              {order.orderStatus > 1 ? (
                                <>
                                  {order.imagesUrls &&
                                  order.imagesUrls.length > 0 ? (
                                    order.imagesUrls.map((url, index) => (
                                      <img
                                        key={index}
                                        src={url}
                                        alt="Imagem fornecida pela 3 irmãos"
                                        className="size-40 rounded-lg hover:scale-105 transition-all duration-300"
                                      />
                                    ))
                                  ) : (
                                    <span>Nenhuma imagem fornecida</span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <Dropzone
                                    onFileSelect={handleImagesSelected}
                                  />
                                </>
                              )}
                            </div>

                            <div>
                              {/* Inputs para alteração das informações dinâmicas da proposta */}

                              <DetailsOrder
                                statusOrder={order.orderStatus}
                                detailsPropostal={order.detailsPropostal}
                                getAllData={handleAllData}
                                propostalValue={order?.totalValue}
                              />
                            </div>
                            <div className="flex items-center justify-center gap-10">
                              <Button
                                className={`bg-emerald-500 hover:bg-emerald-600 ${
                                  order.orderStatus >= 3 &&
                                  order.orderStatus === 4 &&
                                  "hidden"
                                } `}
                                disabled={sendPropostal}
                                onClick={() =>
                                  handleUpdatedStatusOrder(order, 4)
                                }
                              >
                                {sendPropostal ? (
                                  <>
                                    <LoaderCircle className={`animate-spin`} />
                                    Enviando...
                                  </>
                                ) : (
                                  "Aceitar proposta"
                                )}
                              </Button>
                              <Button
                                className={`bg-red-500 hover:bg-red-600 ${
                                  order.orderStatus >= 3 &&
                                  order.orderStatus === 4 &&
                                  "hidden"
                                } `}
                                disabled={sendPropostal}
                                onClick={() =>
                                  handleUpdatedStatusOrder(order, 3)
                                }
                              >
                                {sendPropostal ? (
                                  <>
                                    <LoaderCircle className={`animate-spin`} />
                                    Enviando...
                                  </>
                                ) : (
                                  "Recusar proposta"
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      );
                    })}
              </tbody>
            </>
          ) : (
            <tbody>
              <tr>
                <td
                  colSpan={999}
                  className="p-2 text-center font-semibold text-gray-700"
                >
                  Nenhum pedido encontrado
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};

export default ClientOrdersTable;
