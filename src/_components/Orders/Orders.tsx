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
import { CircleCheckBig, InfoIcon, LoaderCircle } from "lucide-react";
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
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
import DetailsOrder from "./DetailsOrder/DetailsOrder";
import { IMaskInput } from "react-imask";
import { Order } from "@/interfaces/Order";
import { api } from "@/lib/axios";
import hiperLogo from "@/assets/hiper_logo.svg";

/* 
[] Incluir nas props do produto as medidas informadas
[] Receber os sketches que o cliente informar
[] Poder subir novas imagens para o envio da proposta comercial
*/

const OrdersTable = () => {
  const [date, setDate] = useState<DateRange>();

  const [data, setData] = useState<Order[]>([]);
  const [filteredData, setFilteredData] = useState<Order[]>(data);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(0); // zero igual a todos os status
  const [showCardOrder, setShowCardOrder] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [sendPropostal, setSendPropostal] = useState(false);
  const [loadingSendOrderForHiper, setLoadingSendOrderForHiper] = useState<
    number | null
  >(null);

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
      {
        header: "",
        accessorKey: "hiper",
        cell: ({ row }) => row.getValue("hiper"),
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

  async function handleStatusChangeForHiper(id: number, newStatus: number) {
    setLoadingSendOrderForHiper(id);
    try {
      const collectionRef = collection(db, "budgets");
      const q = query(collectionRef, where("orderId", "==", id));
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

      const orderDocData = orderData.docs[0].data();

      if (orderDocData) {
        const data = orderDocData as Order;
        await api.post("/post-order", data);
      }

      await updateDoc(orderDocRef, {
        orderStatus: newStatus,
      });

      setData((prevData) =>
        prevData.map((order) =>
          order.orderId === id ? { ...order, status: newStatus } : order
        )
      );
      setLoadingSendOrderForHiper(null);
    } catch (error) {
      setLoadingSendOrderForHiper(null);
      console.log(
        "Ocorreu um erro ao tentar enviar o pedido para hiper !",
        error
      );
      toast.error("Ocorreu um erro ao tentar enviar o pedido para hiper !");
    }
  }

  async function handleStatusChange(id: number, newStatus: number) {
    console.log("Novo status => ", newStatus);
    console.log("Id do orçamento => ", id);

    try {
      const collectionRef = collection(db, "budgets");
      const q = query(collectionRef, where("orderId", "==", id));
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

      if (newStatus === 10) {
        const listRef = ref(storage, "imagens/");

        try {
          const response = await listAll(listRef);

          const imagesToDelete = response.items.filter((item) =>
            item.name.endsWith(`order_${id}`)
          );

          console.log("Imagens para exclusão => ", imagesToDelete);

          await Promise.all(
            imagesToDelete.map(async (item) => {
              await deleteObject(item);
              console.log(`Imagem deletada: ${item.fullPath}`);
            })
          );

          await updateDoc(orderDocRef, {
            imagesUrls: [],
          });

          console.log(`Todas as imagens do orçamento ${id} foram deletadas.`);
        } catch (error) {
          console.log("Erro ao excluir imagens do storage:", error);
          toast.error("Erro ao excluir imagens do storage.");
        }
      }

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
    }
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

  async function handlePushProposal(orderToPush: Order) {
    try {
      console.log("Order to push =>", orderToPush);
      setSendPropostal(true);

      const q = query(
        collection(db, "budgets"),
        where("orderId", "==", orderToPush.orderId)
      );
      const orderData = await getDocs(q);

      const [firstDoc] = orderData.docs;
      if (!firstDoc) {
        toast.error("Pedido não encontrado.");
        return;
      }

      const orderDocRef = doc(db, "budgets", firstDoc.id);

      const uploadedImages = await UploadImagesForStorage(
        selectedImages,
        orderToPush.orderId
      );

      const allImages = [...uploadedImages, ...(orderToPush.imagesUrls || [])];

      const updatedPriceInProduct = orderToPush.products.map((product) => ({
        ...product,
        preco: product.preco,
      }));

      await updateDoc(orderDocRef, {
        orderStatus: 2,
        products: updatedPriceInProduct,
        imagesUrls: allImages,
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

      toast.success("Proposta enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao tentar atualizar o pedido:", error);
      toast.error("Ocorreu um erro ao tentar atualizar o pedido");
    } finally {
      setSendPropostal(false);
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
    { id: 4, option: "Proposta aceita", value: 4 },
    { id: 5, option: "Aprovado", value: 5 },
    { id: 6, option: "Pedido em produção", value: 6 },
    { id: 7, option: "Faturado", value: 7 },
    { id: 8, option: "Despachado", value: 8 },
    { id: 9, option: "Pedido Concluído", value: 9 },
    { id: 10, option: "Cancelado", value: 10 },
  ];

  useEffect(() => {
    const collectionRef = collection(db, "budgets");
    const q = query(collectionRef);

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
    <div className="space-y-2 py-2 md:p-4 bg-white rounded-xs shadow w-full h-full">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-start md:items-center p-2 gap-4">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded-xs md:w-1/3"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(Number(e.target.value))}
          className="border p-2 rounded-xs w-fit hover:cursor-pointer"
        >
          <option value={0}>Todos os status</option>
          {selectedOptions.map((option) => (
            <option key={option.id} value={option.value}>
              {option.option}
            </option>
          ))}
        </select>
        <Popover>
          <PopoverTrigger className="flex items-center border p-2 w-52 rounded-xs hover:cursor-pointer">
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
              className="border p-2 rounded-xs"
              lang={"pt-BR"}
            />
          </PopoverContent>
        </Popover>
        <Button onClick={() => filterOrders()} className="rounded-xs">
          Filtrar
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between px-2">
        <div className="flex items-center gap-x-2">
          <InfoIcon className="w-4 h-4 text-blue-500" />
          <h2 className="text-[0.67rem] text-gray-500">
            Para visualizar os detalhes do pedido, clique duas vezes sobre o
            nome do cliente.
          </h2>
        </div>
      </div>

      {/* Tabela */}

      <div className="flex w-full border rounded-xs h-[80vh] overflow-y-scroll">
        <table className="w-full">
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
                          >
                            <td
                              className={`px-4 py-3 ${
                                order.orderStatus === 10 && "line-through"
                              }`}
                            >
                              {order.orderId}
                            </td>
                            <td
                              className={`px-4 py-3 ${
                                order.orderStatus === 10 && "line-through"
                              }`}
                            >
                              {order.createdAt}
                            </td>
                            <td
                              className={`px-4 py-3 hover:underline ${
                                order.orderStatus === 10 && "line-through"
                              }`}
                            >
                              <span
                                onDoubleClick={() =>
                                  handleShowCard(order.orderId)
                                }
                              >
                                {order.client.name}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                className={`w-40 rounded-xs p-1 text-white font-semibold text-xs md:text-sm hover:cursor-pointer ${
                                  order.orderStatus === 1
                                    ? "bg-amber-500"
                                    : order.orderStatus === 2
                                    ? "bg-amber-500"
                                    : order.orderStatus === 3
                                    ? "bg-red-500"
                                    : order.orderStatus === 4
                                    ? "bg-emerald-500"
                                    : order.orderStatus === 5
                                    ? "bg-emerald-500"
                                    : order.orderStatus === 6
                                    ? "bg-yellow-500"
                                    : order.orderStatus === 7
                                    ? "bg-blue-500"
                                    : order.orderStatus === 8
                                    ? "bg-purple-500"
                                    : order.orderStatus === 9
                                    ? "bg-green-600"
                                    : order.orderStatus === 10 && "bg-gray-400"
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
                                  selectedOptions.map((option) => {
                                    return (
                                      <option
                                        disabled={
                                          order.orderStatus >= 5 &&
                                          order.orderStatus !== 10
                                            ? option.value <= 5
                                            : option.value >= 5 &&
                                              option.value !== 10
                                        }
                                        key={option.id}
                                        value={option.value}
                                        className="w-fit"
                                      >
                                        {option.option}
                                      </option>
                                    );
                                  })}
                              </select>
                            </td>
                            <td
                              onDoubleClick={() =>
                                handleShowCard(order.orderId)
                              }
                              className={`px-4 py-3 hover:underline`}
                            >
                              {order.orderStatus !== 1 &&
                                order.orderStatus !== 3 &&
                                order.orderStatus !== 10 && (
                                  <Button
                                    onClick={() =>
                                      handleStatusChangeForHiper(
                                        order.orderId,
                                        5
                                      )
                                    }
                                    disabled={order.orderStatus >= 5}
                                    className={`w-[8rem] bg-purple-300 hover:bg-purple-500 rounded-xs ${
                                      order.orderStatus >= 5 &&
                                      "bg-blue-200 hover:bg-blue-300 disabled:opacity-100 disabled:cursor-not-allowed"
                                    }`}
                                  >
                                    <img
                                      src={hiperLogo}
                                      alt=""
                                      className="w-1/2"
                                    />{" "}
                                    {order.orderStatus >= 5 && (
                                      <CircleCheckBig color="green" />
                                    )}
                                    {loadingSendOrderForHiper ===
                                      order.orderId && (
                                      <LoaderCircle className="text-white animate-spin" />
                                    )}
                                  </Button>
                                )}
                            </td>
                          </tr>
                        </DialogTrigger>

                        <DialogContent className="flex flex-col border rounded-xs bg-gray-100 md:w-2/3 h-[86vh] overflow-y-scroll">
                          <DialogHeader>
                            <div className="flex justify-between items-center">
                              <DialogTitle>Detalhes do pedido</DialogTitle>
                            </div>
                            <div className="flex justify-around w-full bg-gray-200 p-2 rounded-xs items-center shadow-md">
                              <div className="flex flex-col w-full ">
                                <div className="flex flex-col md:flex-row space-x-32 items-start ">
                                  {/* Dados do cliente */}
                                  <div className=" flex flex-col  ">
                                    <span className="text-xl font-bold text-gray-700">
                                      Pedido {order.orderId}
                                    </span>
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
                                      <span className="text-lg text-gray-700 truncate">
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
                                  {/* Endereço */}
                                  <div className=" flex flex-col justify-between">
                                    <div className="flex gap-2 items-center">
                                      <span className="font-semibold  text-gray-700">
                                        Rua:
                                      </span>
                                      <span className="text-lg text-gray-700 ">
                                        {order.deliveryAddress.street}
                                      </span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      <span className="font-semibold  text-gray-700">
                                        Numero:
                                      </span>
                                      <span className="text-lg text-gray-700 ">
                                        {order.deliveryAddress.number}
                                      </span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      <span className="font-semibold  text-gray-700">
                                        Bairro:
                                      </span>
                                      <span className="text-lg text-gray-700 truncate">
                                        {order.deliveryAddress.neighborhood}
                                      </span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      <span className="font-semibold  text-gray-700">
                                        Cidade:
                                      </span>
                                      <span className="text-lg  text-gray-700 ">
                                        {order.deliveryAddress.city}
                                      </span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      <span className="font-semibold  text-gray-700">
                                        Estado:{" "}
                                      </span>
                                      <span className="  text-gray-700">
                                        {" "}
                                        {order.deliveryAddress.state}
                                      </span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      <span className="font-semibold  text-gray-700">
                                        CEP:
                                      </span>
                                      <span className="text-gray-700 text-lg">
                                        {order.deliveryAddress.cep}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogHeader>
                          <div>
                            <div className="font-semibold text-lg">
                              Produtos
                            </div>
                            <div className="p-2 max-h-50 w-full md:w-2/3 overflow-y-scroll space-y-2">
                              {order.products &&
                                order.products.map((item) => {
                                  return (
                                    <>
                                      <div
                                        key={item.id}
                                        className="flex flex-col  rounded-xs bg-gray-200 w-full justify-around"
                                      >
                                        <div className="flex p-2 gap-2 w-full">
                                          <div className="flex-1 flex flex-col">
                                            <span className=" text-lg text-gray-700">
                                              {item.nome}
                                            </span>
                                            <span className=" text-md text-gray-700">
                                              {
                                                item.selectedVariation
                                                  .nomeVariacao
                                              }
                                            </span>
                                            <div className="text-sm text-gray-500 flex gap-2">
                                              <span>Altura: {item.altura}</span>
                                              {/*     <span>
                                                Comprimento: {item.comprimento}
                                              </span> */}
                                              <span>
                                                Largura: {item.largura}
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
                                                disabled={order.orderStatus > 1}
                                                onAccept={(value: string) => {
                                                  const precoFloat =
                                                    parseFloat(value);
                                                  handleChangePrice(
                                                    order.orderId,
                                                    item.selectedVariation.id,
                                                    precoFloat
                                                  );
                                                }}
                                                className="border rounded-xs px-2 py-1 w-[8rem] text-right"
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
                                      className="flex flex-col gap-2 items- overflow-x-auto"
                                    >
                                      <span className="text-lg text-gray-700">
                                        {item.nome}
                                      </span>
                                      <div className="flex gap-2 ">
                                        {item.listImages.map((image, index) => {
                                          return (
                                            <img
                                              key={index}
                                              src={image.imagem}
                                              alt="Imagem do produto"
                                              className="size-32 rounded-xs hover:scale-105 transition-all duration-300"
                                            />
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <h1 className="font-semibold text-lg">
                              Imagens de referência
                            </h1>
                            <>
                              {order.clientImages &&
                              order.clientImages.length > 0 ? (
                                <div className="flex gap-2">
                                  {order.clientImages.map((url, index) => (
                                    <img
                                      key={index}
                                      src={url}
                                      alt="Imagem fornecida pela 3 irmãos"
                                      className="size-32 rounded-xs hover:scale-105 transition-all duration-300"
                                    />
                                  ))}
                                </div>
                              ) : (
                                <span>Nenhuma imagem fornecida</span>
                              )}
                            </>
                          </div>
                          <div className="flex flex-col gap-4">
                            {/* Upload de imagens */}
                            <h1 className="font-semibold text-lg">Sketches</h1>
                            {order.orderStatus > 1 ? (
                              <>
                                {order.imagesUrls &&
                                order.imagesUrls.length > 0 ? (
                                  <div className="flex gap-2">
                                    {order.imagesUrls.map((url, index) => (
                                      <img
                                        key={index}
                                        src={url}
                                        alt="Imagem fornecida pela 3 irmãos"
                                        className="size-32 rounded-xs hover:scale-105 transition-all duration-300"
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <span>Nenhuma imagem fornecida</span>
                                )}
                              </>
                            ) : (
                              <div className="flex flex-col space-y-3">
                                <div className="flex gap-2">
                                  {order.imagesUrls &&
                                    order.imagesUrls.map((image, index) => (
                                      <img
                                        key={index}
                                        src={image}
                                        alt="Imagem fornecida pela 3 irmãos"
                                        className="size-32 rounded-xs hover:scale-105 transition-all duration-300"
                                      />
                                    ))}
                                </div>
                                <Dropzone onFileSelect={handleImagesSelected} />
                              </div>
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
                          <Button
                            className={`${order.orderStatus >= 2 && "hidden"} `}
                            disabled={sendPropostal}
                            onClick={() => handlePushProposal(order)}
                          >
                            {sendPropostal ? (
                              <>
                                <LoaderCircle className={`animate-spin`} />
                                Enviando...
                              </>
                            ) : (
                              "Enviar proposta"
                            )}
                          </Button>
                        </DialogContent>
                      </Dialog>
                    ))}
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

export default OrdersTable;
