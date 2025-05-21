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
import { FileDownIcon, InfoIcon, LoaderCircle, SirenIcon } from "lucide-react";
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
import DetailsOrder from "./DetailsOrder/DetailsOrder";
import { IMaskInput } from "react-imask";
import { useAuthStore } from "@/context/authContext";
import Dropzone from "../DropzoneImage/DropzoneImage";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Order } from "@/interfaces/Order";
import { api } from "@/lib/axios";
import { useLocation } from "react-router-dom";

type OrderStatusType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

interface LocationState {
  highlightOrderId?: number;
}

const ClientOrdersTable = () => {
  const { state } = useLocation();
  const { highlightOrderId } = (state as LocationState) || {};
  const { user } = useAuthStore();

  const [date, setDate] = useState<DateRange>();

  const [data, setData] = useState<Order[]>([]);
  const [filteredData, setFilteredData] = useState<Order[]>(data);

  const [statusFilter, setStatusFilter] = useState(0); // zero igual a todos os status
  const [showCardOrder, setShowCardOrder] = useState<number | null>(null);
  const [sendPropostal, setSendPropostal] = useState(false);

  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const [generatedPdf, setGeneratedPdf] = useState<number | null>(null);

  /* Detalhes do orçamento */

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
        header: () => <span className="hidden md:inline">PDF</span>,
        accessorKey: "PDF",
        cell: ({ row }) => (
          <span className="hidden md:flex">{row.getValue("PDF")}</span>
        ),
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
    delivery: number,
    selectedSeller: { name: string; phone: string; email: string }
  ) {
    return { obs, payment, time, delivery, selectedSeller };
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

      await updateDoc(orderDocRef, {
        orderStatus: newOrderStatus,
      });

      setData((prevData) =>
        prevData.map((order) =>
          order.orderId === orderToPush.orderId
            ? { ...order, status: 2 }
            : order
        )
      );
      setSendPropostal(false);
      setShowCardOrder(null);
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

  async function handlePushNewImages(orderToPush: Order) {
    try {
      console.log("Order to include new images =>", orderToPush);
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

      const allImages = [
        ...uploadedImages,
        ...(orderToPush.clientImages || []),
      ];

      await updateDoc(orderDocRef, {
        clientImages: allImages,
      });

      setSelectedImages([]);
      toast.success("Imagens enviadas com sucesso.");
    } catch (error) {
      console.error("Erro ao tentar salvar as imagens:", error);
      toast.error("Ocorreu um erro ao tentar salvar as imagens");
    } finally {
      setSendPropostal(false);
    }
  }

  async function handleGeneratedPDF(order: Order) {
    try {
      setGeneratedPdf(order.orderId);

      const response = await api.post("/generate-pdf", order, {
        responseType: "blob",
      });

      console.log(response);

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Pedido #${order.orderId} - 3 Irmãos.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setGeneratedPdf(null);
    } catch {
      setGeneratedPdf(null);
      toast.error("Ocorreu um erro ao tentar gerar o PDF");
      console.error("Ocorreu um erro ao tentar gerar o PDF");
    }
  }

  const formattedFrom = date?.from
    ? format(date.from, "dd/MM/yyyy")
    : "--/--/----";
  const formattedTo = date?.to ? format(date.to, "dd/MM/yyyy") : "--/--/----";

  const selectedOptions = [
    { id: 1, option: "Orçamento", value: 1 },
    { id: 2, option: "Proposta recebida", value: 2 },
    { id: 3, option: "Proposta recusada", value: 3 },
    { id: 4, option: "Proposta aceita", value: 4 },
    { id: 5, option: "Aprovado", value: 5 },
    { id: 6, option: "Pedido em produção", value: 6 },
    { id: 7, option: "Faturado", value: 7 },
    { id: 8, option: "Despachado", value: 8 },
    { id: 9, option: "Pedido Concluído", value: 9 },
    { id: 10, option: "Cancelado", value: 10 },
  ];

  const statusMap: Record<OrderStatusType, { label: string; color: string }> = {
    1: { label: "Orçamento enviado", color: "bg-orange-300" },
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
    <div className="space-y-2 py-2 md:p-4 bg-white rounded-xs shadow w-full h-full">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-start md:items-center p-2 gap-4">
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
            Para visualizar os detalhes do pedido, clique duas vezes sobre ele.
          </h2>
        </div>
      </div>

      {/* Tabela */}

      <div className="flex w-full border rounded-xs overflow-y-auto max-h-[72vh]">
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
                      const isLast = order.orderId === highlightOrderId;

                      return (
                        <Dialog
                          key={order.orderId}
                          open={showCardOrder === order.orderId}
                          onOpenChange={() => setShowCardOrder(null)}
                        >
                          <DialogTrigger asChild>
                            <tr
                              key={order.orderId}
                              className={`
                                  cursor-pointer text-sm transition-colors duration-300
                                  ${
                                    isLast
                                      ? " bg-green-50 border-green-400"
                                      : "hover:bg-gray-50"
                                  }
                                `}
                              onDoubleClick={() =>
                                handleShowCard(order.orderId)
                              }
                            >
                              <td
                                className={`px-4 py-3 flex items-center ${
                                  order.orderStatus === 10 && "line-through"
                                }`}
                              >
                                {order.orderId}
                                {isLast && (
                                  <div className="flex items-center gap-x-1 ml-2 bg-green-300 text-green-900 border border-green-400 text-xs font-semibold px-2 py-0.5 rounded-xs animate-pulse ">
                                    <span>
                                      <SirenIcon className="w-4 h-4 text-green-700" />
                                    </span>
                                    <span>NOVO</span>
                                  </div>
                                )}
                              </td>
                              <td
                                className={`px-4 py-3 ${
                                  order.orderStatus === 10 && "line-through"
                                }`}
                              >
                                {order.createdAt}
                              </td>
                              <td
                                className={`px-4 py-3 ${
                                  order.orderStatus === 10 && "line-through"
                                }`}
                              >
                                {order.client.name}
                              </td>
                              <td className={`py-3 px-4`}>
                                <div
                                  className={`w-fit md:w-[13rem] 2xl:w-[15rem] rounded-xs px-4 py-1 text-center md:text-sm text-xs hover:cursor-pointer  ${
                                    status?.color || "bg-zinc-300"
                                  }`}
                                >
                                  {status?.label || "Status desconhecido"}
                                </div>
                              </td>
                              <td className="hidden md:flex">
                                <Button
                                  onClick={() => handleGeneratedPDF(order)}
                                  className=" bg-transparent border-red-900 rounded-none hover:shadow-md hover:scale-105  hover:bg-transparent shadow-sm shadow-gray-300"
                                >
                                  {generatedPdf === order.orderId ? (
                                    <LoaderCircle className="animate-spin text-red-900 hover:text-white" />
                                  ) : (
                                    <>
                                      <FileDownIcon className="hover:text-white text-red-900" />
                                      <h2 className="text-red-900">Download</h2>
                                    </>
                                  )}
                                </Button>
                              </td>
                            </tr>
                          </DialogTrigger>

                          <DialogContent className="flex flex-col p-1 md:p-2 rounded-xs w-full bg-gray-100 md:w-2/3 h-[80vh] overflow-y-scroll">
                            <DialogHeader>
                              <div className="flex items-center">
                                <DialogTitle className="flex flex-col">
                                  <span className="text-xl font-bold text-gray-700">
                                    {order.orderStatus === 1
                                      ? "Orçamento"
                                      : order.orderStatus === 2
                                      ? "Proposta"
                                      : order.orderStatus === 3
                                      ? "Proposta"
                                      : order.orderStatus === 4
                                      ? "Proposta"
                                      : order.orderStatus > 4 && "Pedido"}{" "}
                                    {order.orderId}
                                  </span>
                                </DialogTitle>
                              </div>
                              <div className="flex w-full p-2 rounded-xs items-center ">
                                <div className="flex flex-col w-full">
                                  <div className="flex flex-col md:flex-row space-y-2 space-x-32 items-start">
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
                                    <div className="flex flex-col lg:flex-row">
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
                                            {order.deliveryAddress.city} /{" "}
                                            {order.deliveryAddress.state}
                                          </span>
                                        </div>
                                      </div>
                                      <div>
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
                              </div>
                            </DialogHeader>
                            <div className="w-full flex flex-col">
                              <div className="font-semibold text-lg">
                                Produtos
                              </div>
                              <div className="space-y-2 w-full border  border-gray-400 border-t-0">
                                {/* Cabeçalho visível apenas em telas médias para cima */}
                                <div className="hidden md:grid grid-cols-7 font-bold text-center border border-gray-700">
                                  <div className="col-span-2 text-base">
                                    Produto
                                  </div>
                                  <div className="col-span-1 text-base">Un</div>
                                  <div className="col-span-1 text-base">
                                    Qtd
                                  </div>
                                  <div className="col-span-1 text-base">
                                    Desconto
                                  </div>
                                  <div className="col-span-1 text-base">
                                    Valor unitário
                                  </div>
                                  <div className="col-span-1 text-base">
                                    Valor total
                                  </div>
                                </div>

                                {order.products?.map((item, index) => {
                                  const variation =
                                    item.selectedVariation.nomeVariacao.split(
                                      "-"
                                    );

                                  return (
                                    <div
                                      key={index}
                                      className="border-b   px-2 flex flex-col md:grid md:grid-cols-7 md:items-center md:justify-center"
                                    >
                                      {/* Produto */}
                                      <div className="col-span-2 border-gray-400 h-full">
                                        <p className="text-sm md:text-lg font-medium">
                                          {item.nome}
                                        </p>
                                        <p className="text-sm">
                                          {variation[1]}
                                        </p>
                                        {item.categoria !==
                                          "Assoalhos, Escadas, Decks e Forros" && (
                                          <p className="text-sm text-gray-500">
                                            Altura: {item.altura} m | Largura:{" "}
                                            {item.largura} m |{" "}
                                            {item.categoria ===
                                              "Janelas e Esquadrias" ||
                                            item.categoria ===
                                              "Portas Pronta Entrega" ||
                                            item.categoria ===
                                              "Portas Sob Medida"
                                              ? "Batente (Espessura da parede)"
                                              : "Comprimento"}{" "}
                                            {item.comprimento === undefined
                                              ? 0
                                              : item.comprimento}{" "}
                                            m
                                          </p>
                                        )}
                                        <p className="text-sm text-red-900">
                                          {variation[0]}
                                        </p>
                                      </div>
                                      <div className="mt-2 md:mt-0 md:flex justify-center items-center text-sm md:text-base border-gray-400 h-full">
                                        <span className="block md:hidden font-semibold">
                                          Unidade:
                                        </span>{" "}
                                        {item.unidade}
                                      </div>
                                      {/* Qtd */}
                                      <div className="mt-2 md:mt-0 md:flex justify-center items-center text-sm md:text-base">
                                        <span className="block md:hidden font-semibold">
                                          Qtd:
                                        </span>{" "}
                                        {item.quantidade} x
                                      </div>

                                      {/* Desconto */}
                                      {order.orderStatus !== 1 && (
                                        <div className="mt-2 md:mt-0 md:flex justify-center items-center text-sm md:text-base ">
                                          <span className="block md:hidden font-semibold">
                                            Desconto:
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
                                            value={String(item.desconto || 0)}
                                            unmask={true}
                                            disabled
                                            className="rounded-xs p-0 md:px-2  text-center w-full "
                                          />
                                        </div>
                                      )}

                                      {/* Valor Unitário */}
                                      {order.orderStatus !== 1 && (
                                        <div className="mt-2 md:mt-0 md:flex justify-center items-center text-sm md:text-base">
                                          <span className="block md:hidden font-semibold">
                                            Valor unitário:
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
                                            unmask={true}
                                            disabled
                                            className="rounded-xs p-0 md:px-2 py-1 text-center w-full"
                                          />
                                        </div>
                                      )}

                                      {/* Valor Total */}
                                      {order.orderStatus !== 1 && (
                                        <div className="text-center h-full flex flex-col  items-start justify-center gap-2 mt-2 md:mt-0 text-sm md:text-base ">
                                          <span className="block md:hidden font-semibold">
                                            Valor total:
                                          </span>
                                          <span className="w-full truncate">
                                            {(item.desconto
                                              ? item.preco * item.quantidade -
                                                item.desconto
                                              : item.preco * item.quantidade
                                            ).toLocaleString("pt-BR", {
                                              style: "currency",
                                              currency: "BRL",
                                            })}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                {/* Totais */}
                                <div className="flex flex-col items-end gap-2 ">
                                  {order.orderStatus !== 1 && (
                                    <div className="flex justify-between  w-full md:w-auto px-14 ">
                                      <span className="font-semibold">
                                        Total
                                      </span>
                                      <span className="w-[8rem] truncate text-right">
                                        {order.totalValue.toLocaleString(
                                          "pt-BR",
                                          {
                                            style: "currency",
                                            currency: "BRL",
                                          }
                                        )}
                                      </span>
                                    </div>
                                  )}

                                  {order.orderStatus !== 1 && (
                                    <>
                                      <div className="w-full flex justify-end items-end border-t">
                                        <div className="flex justify-between items-center w-full pt-2 md:w-auto px-14 ">
                                          <span className="font-semibold">
                                            Desconto
                                          </span>
                                          <span className="w-[8rem] truncate text-right">
                                            {order.totalDiscount.toLocaleString(
                                              "pt-BR",
                                              {
                                                style: "currency",
                                                currency: "BRL",
                                              }
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="w-full flex justify-end items-end border-t">
                                        <div className="flex justify-between items-center w-full pt-2  md:w-auto px-14 ">
                                          <span className="font-semibold">
                                            Frete
                                          </span>
                                          <span className="w-[8rem] truncate text-right">
                                            {order.detailsPropostal.delivery.toLocaleString(
                                              "pt-BR",
                                              {
                                                style: "currency",
                                                currency: "BRL",
                                              }
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex justify-between w-full  gap-4 md:gap-10 pt-2 pb-2 border-t">
                                        <div className="w-full flex justify-end px-14">
                                          <span className="font-semibold">
                                            Total
                                          </span>
                                          <span className="w-[8rem] truncate text-right">
                                            {order.discountTotalValue
                                              ? (
                                                  order.discountTotalValue +
                                                  order.detailsPropostal
                                                    .delivery
                                                ).toLocaleString("pt-BR", {
                                                  style: "currency",
                                                  currency: "BRL",
                                                })
                                              : "R$ 0,00"}
                                          </span>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-4">
                              {/* Upload de imagens */}
                              <h1 className="font-semibold text-lg">
                                Imagens de referência
                              </h1>
                              {order.orderStatus > 1 ? (
                                /* Caso o status seja maior que orçamento exibe somente as imagens fornecidas */
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
                              ) : (
                                <div className="flex flex-col space-y-3 overflow-x-auto">
                                  <div className="flex gap-2">
                                    {order.clientImages &&
                                      order.clientImages.map((image, index) => (
                                        <img
                                          key={index}
                                          src={image}
                                          alt="Imagem fornecida pela 3 irmãos"
                                          className="size-32 rounded-xs hover:scale-105 transition-all duration-300"
                                        />
                                      ))}
                                  </div>
                                  <Dropzone
                                    onFileSelect={handleImagesSelected}
                                  />
                                  <Button
                                    disabled={
                                      sendPropostal ||
                                      selectedImages.length === 0
                                    }
                                    onClick={() => handlePushNewImages(order)}
                                  >
                                    {sendPropostal ? (
                                      <>
                                        <LoaderCircle className="animate-spin" />
                                        Salvando...
                                      </>
                                    ) : (
                                      "Salvar"
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                            {/* Imagens fornecidas pela 3 irmãos */}
                            {order.orderStatus !== 1 && (
                              <div className="flex flex-col gap-4">
                                <h1 className="font-semibold text-lg">
                                  Imagens ilustrativas
                                </h1>
                                <div className="flex gap-2 overflow-x-auto p-2">
                                  {order.imagesUrls &&
                                  order.imagesUrls.length > 0 ? (
                                    order.imagesUrls
                                      .map((image, index) => ({ image, index }))
                                      .sort((a, b) => b.index - a.index)
                                      .map(({ image, index }) => (
                                        <img
                                          key={index}
                                          src={image}
                                          alt="Imagem fornecida pela 3 irmãos"
                                          className="size-40 rounded-xs hover:scale-105 transition-all duration-300"
                                        />
                                      ))
                                  ) : (
                                    <span>Nenhuma imagem fornecida</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {order.orderStatus !== 1 && (
                              <div>
                                <DetailsOrder
                                  statusOrder={order.orderStatus}
                                  detailsPropostal={order.detailsPropostal}
                                  getAllData={handleAllData}
                                  propostalValue={order?.discountTotalValue}
                                />
                              </div>
                            )}
                            <div className="flex items-center justify-center gap-10">
                              <Button
                                className={`bg-emerald-500 hover:bg-emerald-600 hidden ${
                                  order.orderStatus === 2 && "flex"
                                }  `}
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
                                className={`bg-red-500 hover:bg-red-600 hidden ${
                                  order.orderStatus === 2 && "flex"
                                }  `}
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
