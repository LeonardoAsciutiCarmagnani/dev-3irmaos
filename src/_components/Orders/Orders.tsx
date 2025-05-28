/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
  BellRingIcon,
  CircleCheckBig,
  FileDownIcon,
  InfoIcon,
  LoaderCircle,
  MessageSquareText,
} from "lucide-react";
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
import { ProductDimensionInput } from "./ProductDimensionInput/ProductDimensionInput";
import { useNavigate } from "react-router-dom";

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
  const [popoverHiperController, setPopoverHiperController] = useState<
    number | null
  >(null);
  const navigate = useNavigate();

  /* Detalhes do orçamento */
  const [obs, setObs] = useState("");
  const [payment, setPayment] = useState("");
  const [time, setTime] = useState("");
  const [delivery, setDelivery] = useState(0);
  const [selectedSeller, setSelectedSeller] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [itemsIncluded, setItemsIncluded] = useState("");
  const [itemsNotIncluded, setItemsNotIncluded] = useState("");

  // const [localDiscounts, setLocalDiscounts] = useState<Record<string, number>>(
  //   {}
  // );

  const [generatedPdf, setGeneratedPdf] = useState<number | null>();

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
        header: "ID Hiper",
        accessorKey: "codeHiper",
        cell: ({ row }) => row.getValue("codeHiper"),
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
        header: "Envio Hiper",
        accessorKey: "PDF",
        cell: ({ row }) => row.getValue("PDF"),
      },
      {
        header: "PDF",
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
    delivery: number,
    selectedSeller: { name: string; phone: string; email: string },
    itemsIncluded: string,
    itemsNotIncluded: string
  ) {
    setObs(obs);
    setPayment(payment);
    setTime(time);
    setDelivery(delivery);
    setSelectedSeller(selectedSeller);
    setItemsIncluded(itemsIncluded);
    setItemsNotIncluded(itemsNotIncluded);
    return { obs, payment, time, delivery, selectedSeller };
  }

  async function handleStatusChangeForHiper(
    orderToHiper: Order,
    newStatus: number
  ) {
    setLoadingSendOrderForHiper(orderToHiper.orderId);
    try {
      console.log("The new status received => ", newStatus);
      const collectionRef = collection(db, "budgets");
      const q = query(
        collectionRef,
        where("orderId", "==", orderToHiper.orderId)
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

      const orderDocData = orderData.docs[0].data();

      if (!orderDocData)
        return toast.error("Ocorreu um erro ao enviar o pedido para Hiper !");

      const data = orderDocData as Order;
      await api.post("/post-order", data);

      setData((prevData) =>
        prevData.map((order) =>
          order.orderId === orderToHiper.orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      const cleanedPhone = orderToHiper.client.phone.replace(/\D/g, "");

      const pushObject = {
        orderCode: orderToHiper.orderId,
        clientName: orderToHiper.client.name,
        clientPhone: cleanedPhone,
        createdAt: orderToHiper.createdAt,
        orderStatus: newStatus,
        deliveryDate: orderToHiper.detailsPropostal?.time || "",
      };

      api.post("/send-push-proposalApproved", pushObject);

      toast.info("Notificação de status enviada com sucesso!", {
        id: "push-notification-success",
        icon: <MessageSquareText />,
        duration: 3000,
      });

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

  async function handleStatusChange(
    id: number,
    newStatus: number,
    order?: Order
  ) {
    console.log("Novo status => ", newStatus);
    console.log("Id do orçamento => ", id);
    console.log("handleStatusChange chamada:", { id, newStatus, order });

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

      // ===== CÓDIGO DE PUSH NOTIFICATION MOVIDO PARA FORA =====
      if (order) {
        console.log("Processando push notification...");

        try {
          const {
            orderId: orderCode,
            client: { name: clientName, phone },
            createdAt,
            orderStatus,
          } = order;

          // Remove tudo que não for dígito
          const cleanedPhone = phone.replace(/\D/g, "");

          const pushObject = {
            orderCode,
            clientName,
            clientPhone: cleanedPhone,
            createdAt,
            orderStatus,
            deliveryDate: order.detailsPropostal?.time || "",
          };

          console.log("Push object criado:", pushObject);

          // Mapa de status → rota da API
          const statusEndpoints: Record<number, string> = {
            1: "/send-push-createBudget",
            2: "/send-push-proposalSent",
            3: "/send-push-proposalRejected",
            4: "/send-push-proposalAccepted",
            5: "/send-push-proposalApproved",
            6: "/send-push-proposalInProduction",
            8: "/send-push-proposalDispatched",
            9: "/send-push-proposalCompleted",
          };

          const endpoint = statusEndpoints[newStatus];
          console.log("Endpoint selecionado:", endpoint);

          if (!endpoint) {
            console.warn(`Status ${newStatus} não tem endpoint definido.`);
          } else {
            console.log(`Enviando push para ${endpoint}...`);
            const response = await api.post(endpoint, pushObject);
            console.log(`Push enviado para ${endpoint}:`, response.data);
          }

          toast.info("Notificação de status enviada com sucesso!", {
            id: "push-notification-success",
            icon: <MessageSquareText />,
            duration: 3000,
          });
        } catch (error) {
          console.error(`Erro ao enviar push:`, error);
          toast.error("Não foi possível processar o envio da notificação.", {
            id: "push-notification-error",
            icon: <BellRingIcon />,
            duration: 3000,
          });
        }
      } else {
        console.warn("Order não foi fornecido para push notification");
      }

      // ===== CÓDIGO ESPECÍFICO PARA STATUS 10 (EXCLUSÃO DE IMAGENS) =====
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

      toast.success("Status atualizado com sucesso!", {
        id: "status-update-success",
        icon: <CircleCheckBig />,
        duration: 3000,
      });
    } catch (error) {
      console.log("Ocorreu um erro ao tentar atualizar o pedido", error);
      toast.error("Ocorreu um erro ao tentar atualizar o pedido");
    }
  }

  /*  function handleLocalDiscountChange(
    orderId: number,
    productId: string,
    value: string
  ) {
    console.log(
      "Chamou a função handleLocalDiscountChange passando =>",
      orderId,
      productId,
      value
    );
    const key = `${orderId}-${productId}`;
    const parsed = parseFloat(value || "0");
    setLocalDiscounts((prev) => ({
      ...prev,
      [key]: parsed,
    }));
  }

  function handleDiscountBlur(orderId: number, productId: string) {
    const key = `${orderId}-${productId}`;
    const value = localDiscounts[key];
    console.log("Valor de parsed =>", value);
    handleChangeDiscountProduct(orderId, productId, value);
  } */

  function handleChangeDiscountProduct(
    orderId: number,
    productId: string,
    discount: number
  ) {
    console.log(discount);
    setData((prev) => {
      const updatedData = prev.map((order) => {
        if (order.orderId !== orderId) return order;

        if (order.orderId === orderId) {
          const updatedProducts = order.products.map((product) => {
            if (product.selectedVariation.id === productId) {
              if (discount === undefined) discount = product.desconto;
              return {
                ...product,
                desconto: discount,
                totalValue: discount * product.quantidade,
              };
            }
            return product;
          });

          const orderTotal = updatedProducts.reduce((sum, product) => {
            return sum + (product.preco || 0) * product.quantidade;
          }, 0);

          const totalDiscount = updatedProducts.reduce((sum, product) => {
            return sum + product.desconto * product.quantidade;
          }, 0);

          const discountTotalValue = updatedProducts.reduce((sum, product) => {
            return (
              sum +
              product.preco * product.quantidade -
              product.desconto * product.quantidade
            );
          }, 0);
          // console.log("Calculo do total com desconto => ", discountTotalValue);

          return {
            ...order,
            products: updatedProducts,
            totalValue: orderTotal,
            totalDiscount,
            discountTotalValue,
          };
        }
        return order;
      });
      return updatedData;
    });
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
          if (newPrice === undefined) newPrice = product.preco;

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

        const totalDiscount = updatedProducts.reduce((sum, product) => {
          return sum + product.desconto * product.quantidade;
        }, 0);

        const discountTotalValue = updatedProducts.reduce((sum, product) => {
          return (
            sum +
            product.preco * product.quantidade -
            product.desconto * product.quantidade
          );
        }, 0);

        return {
          ...order,
          products: updatedProducts,
          totalValue: orderTotal,
          totalDiscount,
          discountTotalValue,
        };
      });

      // console.log("updatedData => ", updatedData);

      return updatedData;
    });
  }

  function handleChangeDimesionsProduct(
    orderId: number,
    productId: string,
    altura?: string,
    largura?: string,
    comprimento?: string
  ) {
    setData((prevData) =>
      prevData.map((order) =>
        order.orderId === orderId
          ? {
              ...order,
              products: order.products.map((product) => {
                const formattedAltura = altura?.replace(",", ".");
                const formattedLargura = largura?.replace(",", ".");
                const formattedComprimento = comprimento?.replace(",", ".");

                return product.selectedVariation.id === productId
                  ? {
                      ...product,
                      altura: altura ? Number(formattedAltura) : product.altura,
                      largura: largura
                        ? Number(formattedLargura)
                        : product.largura,
                      comprimento: comprimento
                        ? Number(formattedComprimento)
                        : product.comprimento,
                    }
                  : product;
              }),
            }
          : order
      )
    );
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

      // const allImages = [...uploadedImages, ...(orderToPush.imagesUrls || [])];

      // const updatedPriceInProduct = orderToPush.products.map((product) => ({
      //   ...product,
      //   preco: product.preco,
      // }));

      const cleanedPhone = orderToPush.client.phone.replace(/\D/g, "");

      const pushObject = {
        orderCode: orderToPush.orderId,
        clientName: orderToPush.client.name,
        clientPhone: cleanedPhone,
        createdAt: orderToPush.createdAt,
        orderStatus: orderToPush.orderStatus,
        deliveryDate: orderToPush.detailsPropostal?.time || "",
      };

      function removeUndefined(obj: any): any {
        if (Array.isArray(obj)) {
          return obj.map(removeUndefined);
        } else if (obj !== null && typeof obj === "object") {
          return Object.entries(obj).reduce((acc, [key, value]) => {
            if (value !== undefined) {
              acc[key] = removeUndefined(value);
            }
            return acc;
          }, {} as any);
        }
        return obj;
      }

      await updateDoc(
        orderDocRef,
        removeUndefined({
          orderStatus: 2,
          orderId: orderToPush.orderId,
          totalValue: orderToPush.totalValue ?? 0,
          discountTotalValue: orderToPush.discountTotalValue ?? 0,
          totalDiscount: orderToPush.totalDiscount ?? 0,
          imagesUrls: [
            ...(uploadedImages || []),
            ...(orderToPush.imagesUrls || []),
          ],
          products: orderToPush.products.map((p) => ({
            categoria: p.categoria ?? "",
            desconto: p.desconto ?? 0,
            altura: p.altura ?? 0,
            largura: p.largura ?? 0,
            comprimento: p.comprimento ?? 0,
            unidade: p.unidade ?? "",
            nome: p.nome ?? "",
            preco: p.preco ?? 0,
            quantidade: p.quantidade ?? 0,
            selectedVariation: {
              id: p.selectedVariation?.id ?? "",
              nomeVariacao: p.selectedVariation?.nomeVariacao ?? "",
            },
          })),
          billingAddress: {
            ...orderToPush.deliveryAddress,
          },
          deliveryAddress: {
            ...orderToPush.deliveryAddress,
          },
          client: {
            ...orderToPush.client,
          },
          createdAt: orderToPush.createdAt ?? "",
          detailsPropostal: {
            obs: obs ?? "",
            payment: payment ?? "",
            time: time ?? "",
            delivery: delivery ?? 0,
            selectedSeller: {
              email: selectedSeller?.email ?? "",
              phone: selectedSeller?.phone ?? "",
              name: selectedSeller?.name ?? "",
            },
            itemsIncluded: itemsIncluded ?? "",
            itemsNotIncluded: itemsNotIncluded ?? "",
          },
        })
      );

      await api.post("/send-push-proposalSent", pushObject);

      toast.info("Notificação de status enviada com sucesso!", {
        id: "push-notification-success",
        icon: <MessageSquareText />,
        duration: 3000,
      });

      setData((prevData) =>
        prevData.map((order) =>
          order.orderId === orderToPush.orderId
            ? { ...order, status: 2 }
            : order
        )
      );
      setShowCardOrder(null);

      toast.success("Status atualizado com sucesso!", {
        id: "status-update-success",
        icon: <CircleCheckBig />,
        duration: 3000,
      });
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

  async function handleGeneratedPDF(order: Order) {
    try {
      setGeneratedPdf(order.orderId);

      const response = await api.post(
        "/generate-pdf-test",
        { data: order },
        {
          responseType: "blob",
        }
      );

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
      console.log("Documentos => ", updatedData);
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
              <span className="w-full">Filtrar por periodo</span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-full rounded-xs">
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
        <div>
          <Button
            className="rounded-xs bg-blue-400 hover:bg-blue-500 border-blue-500 border"
            onClick={() => navigate("/adm/criar-orçamento")}
          >
            Novo orçamento
          </Button>
        </div>
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
                            className=" hover:bg-gray-50 cursor-pointer text-sm "
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
                              {order.codeHiper ? order.codeHiper : "-"}
                            </td>
                            <td
                              className={`px-4 py-3 ${
                                order.orderStatus === 10 && "line-through"
                              }`}
                            >
                              {order.createdAt}
                            </td>
                            <td
                              onDoubleClick={() =>
                                handleShowCard(order.orderId)
                              }
                              className={`px-4 py-3 hover:underline ${
                                order.orderStatus === 10 && "line-through"
                              }`}
                            >
                              <span>{order.client.name}</span>
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
                                onChange={(e) => {
                                  handleStatusChange(
                                    order.orderId,
                                    Number(e.target.value),
                                    order
                                  );
                                }}
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
                              className={`flex gap-10 items-center  px-4 py-3 `}
                            >
                              {order.orderStatus !== 1 &&
                                order.orderStatus !== 3 &&
                                order.orderStatus !== 10 && (
                                  <Popover
                                    open={
                                      popoverHiperController === order.orderId
                                    }
                                    onOpenChange={(open) => {
                                      setPopoverHiperController(
                                        open ? order.orderId : null
                                      );
                                    }}
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        onClick={() =>
                                          setPopoverHiperController(
                                            order.orderId
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
                                    </PopoverTrigger>
                                    <PopoverContent className="flex flex-col space-y-2 justify-center rounded-xs">
                                      <span className="text-sm text-center">
                                        Deseja confirmar o envio para a Hiper?
                                      </span>
                                      <div className="flex items-center justify-between">
                                        <Button
                                          onClick={() =>
                                            setPopoverHiperController(null)
                                          }
                                          className=" bg-red-500 hover:bg-red-600 rounded-xs"
                                        >
                                          Cancelar
                                        </Button>
                                        <Button
                                          onClick={() => {
                                            handleStatusChangeForHiper(
                                              order,
                                              5
                                            );
                                            setPopoverHiperController(null);
                                          }}
                                          className="bg-emerald-500 hover:bg-emerald-600 rounded-xs"
                                        >
                                          Confirmar
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                )}
                            </td>
                            <td>
                              {order.orderStatus > 1 && (
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
                              )}
                            </td>
                          </tr>
                        </DialogTrigger>

                        <DialogContent className="flex flex-col border rounded-xs space-y-1 bg-gray-100 md:w-5/6 h-[86vh] overflow-y-scroll">
                          <DialogHeader>
                            <div className="w-[95%] flex items-center justify-end"></div>
                            <div className="flex items-center">
                              <DialogTitle>
                                {" "}
                                <span className="text-md font-bold text-gray-700">
                                  {order.orderStatus === 1
                                    ? "Orçamento"
                                    : order.orderStatus === 2
                                    ? "Proposta"
                                    : order.orderStatus === 3
                                    ? "Proposta"
                                    : order.orderStatus === 4
                                    ? "Proposta"
                                    : order.orderStatus > 4 && "Pedido"}{" "}
                                  #{order.orderId}
                                </span>
                              </DialogTitle>
                            </div>
                            <div className="flex w-full  p-2 rounded-xs items-center">
                              <div className="flex flex-col w-full">
                                <div className="flex space-x-32 items-start">
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
                                          Logradouro:
                                        </span>
                                        <span className="text-lg text-gray-700 ">
                                          {order.deliveryAddress.street},{" "}
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
                                          {order.deliveryAddress.city} -{" "}
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
                            </div>
                          </DialogHeader>
                          <div>
                            <table className="p-2 w-full border border-gray-300 overflow-y-scroll space-y-2">
                              <thead className="w-full border border-gray-500 ">
                                <tr className="grid grid-cols-7 items-center text-center">
                                  <td className="col-span-2 font-bold">
                                    Produto
                                  </td>
                                  <td className="col-span-1 font-bold">Un</td>
                                  <td className="col-span-1 font-bold">Qtd</td>
                                  <td className="col-span-1 font-bold">
                                    Desconto Unitário
                                  </td>
                                  <td className="col-span-1 font-bold">
                                    Valor unitário
                                  </td>
                                  <td className="col-span-1 font-bold">
                                    Valor total
                                  </td>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {order.products &&
                                  order.products.map((item, index) => {
                                    const variation =
                                      item.selectedVariation.nomeVariacao.split(
                                        "-"
                                      );

                                    return (
                                      <tr
                                        key={index}
                                        className="flex flex-col rounded-xs w-full border-b border-gray-300 last:border-b-0"
                                      >
                                        <td className=" grid grid-cols-7 items-center  justify-around  px-2  w-full">
                                          {/* Produto */}
                                          <div className=" flex flex-col col-span-2">
                                            <span className="flex-1 text-lg text-gray-700">
                                              {item.nome}
                                            </span>
                                            <div className="flex-1 text-md text-gray-700">
                                              <span> {variation[1]} - </span>
                                              <span className="text-sm text-red-900">
                                                {variation[0]}
                                              </span>
                                            </div>
                                            {item.categoria !==
                                              "Assoalhos, Escadas, Decks e Forros" &&
                                              item.categoria !==
                                                "Antiguidades" && (
                                                <ProductDimensionInput
                                                  key={
                                                    item.selectedVariation.id
                                                  }
                                                  orderId={order.orderId}
                                                  product={item}
                                                  onChange={
                                                    handleChangeDimesionsProduct
                                                  }
                                                />
                                              )}
                                          </div>
                                          <div className="flex text-lg text-gray-700 items-center justify-center text-center h-full">
                                            <span>{item.unidade}</span>
                                          </div>
                                          <div className="flex text-lg text-gray-700 items-center justify-center text-center h-full">
                                            <span>{item.quantidade}</span>
                                          </div>
                                          {/* Coluna desconto */}
                                          <div className="flex gap-2  items-center justify-center text-center">
                                            <div className="flex  items-center text-center ">
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
                                                value={
                                                  item.desconto
                                                    ? String(item.desconto)
                                                    : "0"
                                                }
                                                unmask={true}
                                                disabled={order.orderStatus > 1}
                                                onAccept={(value) => {
                                                  handleChangeDiscountProduct(
                                                    order.orderId,
                                                    item.selectedVariation.id,
                                                    Number(value)
                                                  );
                                                }}
                                                className="rounded-xs px-2 py-1 w-[8rem] text-center"
                                              />
                                            </div>
                                          </div>
                                          <div className="flex gap-2  items-center justify-center text-center ">
                                            <div className="flex  items-center text-center ">
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
                                                value={String(item.preco) + ""}
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
                                                className="rounded-xs px-2 py-1 w-[8rem] text-right"
                                              />
                                            </div>
                                          </div>
                                          <div className="text-center h-full flex items-center justify-center  ">
                                            {(
                                              item.preco * item.quantidade -
                                              item.desconto * item.quantidade
                                            ).toLocaleString("pt-BR", {
                                              style: "currency",
                                              currency: "BRL",
                                            })}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                              <tfoot>
                                <tr className="border-t text-end">
                                  <td className="flex justify-end gap-10 p-2">
                                    <span className="font-semibold">
                                      Sub total
                                    </span>
                                    <span className="w-[8rem] truncate">
                                      {" "}
                                      {order.totalValue.toLocaleString(
                                        "pt-BR",
                                        {
                                          style: "currency",
                                          currency: "BRL",
                                        }
                                      )}
                                    </span>
                                  </td>
                                </tr>
                                <tr className="border-t text-end">
                                  <td className="flex justify-end gap-10 p-2">
                                    <span className="font-semibold flex-1 ">
                                      Desconto
                                    </span>
                                    <span className="w-[8rem] truncate">
                                      {order.totalDiscount
                                        ? order.totalDiscount?.toLocaleString(
                                            "pt-BR",
                                            {
                                              style: "currency",
                                              currency: "BRL",
                                            }
                                          )
                                        : "R$ 0,00"}
                                    </span>
                                  </td>
                                </tr>

                                <tr className="border-t text-end">
                                  <td className="flex justify-end gap-10 p-2">
                                    <span className="font-semibold">Frete</span>
                                    <span className="w-[8rem] truncate">
                                      {order.detailsPropostal.delivery
                                        ? order.detailsPropostal.delivery.toLocaleString(
                                            "pt-BR",
                                            {
                                              style: "currency",
                                              currency: "BRL",
                                            }
                                          )
                                        : delivery.toLocaleString("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                          })}
                                    </span>
                                  </td>
                                </tr>

                                <tr className="border-t text-end">
                                  <td className="flex justify-end gap-10 p-2">
                                    <span className="font-semibold">Total</span>
                                    <span className="w-[8rem] truncate">
                                      {order.discountTotalValue
                                        ? (
                                            order.discountTotalValue +
                                            (order.detailsPropostal.delivery ??
                                              delivery)
                                          ).toLocaleString("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                          })
                                        : order.discountTotalValue?.toLocaleString(
                                            "pt-BR",
                                            {
                                              style: "currency",
                                              currency: "BRL",
                                            }
                                          )}
                                    </span>
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
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
                            <h1 className="font-semibold text-lg">
                              Imagens ilustrativas
                            </h1>
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
                              propostalValue={order?.discountTotalValue}
                            />
                          </div>
                          <Button
                            className={`rounded-xs w-full ${
                              order.orderStatus >= 2 && "hidden"
                            } `}
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
