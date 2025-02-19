import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Clients from "./DropdownGetClients";
import ProductSelector from "../_components/GetProductList";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ToastNotifications from "./Toasts";
import { Product } from "@/context/cartContext";
import { format } from "date-fns";
import Sidebar from "./Sidebar";
import { usePostOrderStore } from "@/context/postOrder";
import { useNavigate } from "react-router-dom";
import DialogSubmit from "./DialogSubmitOrder";
import apiBaseUrl from "@/lib/apiConfig";
import { DatePicker } from "./DatePicker";
import { CheckIcon, ChevronsRightIcon, CircleIcon } from "lucide-react";
import InstallmentsTable from "./InstallmentsTable";
import logo from "../assets/logo_sem_fundo.png";

export type OrderSaleTypes = {
  IdClient?: string;
  order_code: number;
  status_order: number;
  created_at?: string;
  updated_at?: string;
  id?: string;
  total?: number;
  cliente: ClientData | null;
  enderecoDeCobranca: EnderecoDeEntrega | null;
  enderecoDeEntrega: EnderecoDeEntrega;
  itens: {
    produtoId?: string;
    nome?: string;
    preco?: number;
    categoria?: string;
    quantidade: number;
    precoUnitarioBruto?: number;
    precoUnitarioLiquido?: number;
  }[];
  meiosDePagamento: MeioDePagamento[];
  numeroPedidoDeVenda: string;
  observacaoDoPedidoDeVenda: string;
  valorDoFrete: number;
};

export type ClientData = {
  documento: string;
  email: string;
  inscricaoEstadual?: string;
  nomeDoCliente: string;
  nomeFantasia?: string;
};

export type EnderecoDeEntrega = {
  bairro: string;
  cep: string;
  codigoIbge: number;
  complemento: string;
  logradouro: string;
  numero: number;
};

export type MeioDePagamento = {
  idMeioDePagamento: number;
  parcelas: number;
  valor: number;
};

interface ProductWithQuantity {
  product: Product;
  quantity: number;
}

const OrderSaleProps: React.FC = () => {
  const orderCreationDate = format(new Date(), "yyyy/MM/dd HH:mm:ss");
  const [orderSale, setOrderSale] = useState<OrderSaleTypes>({
    status_order: 1,
    order_code: 0,
    created_at: orderCreationDate,
    updated_at: orderCreationDate,
    cliente: null,
    enderecoDeCobranca: {
      bairro: "",
      cep: "",
      codigoIbge: 0,
      complemento: "",
      logradouro: "",
      numero: 0,
    },
    enderecoDeEntrega: {
      bairro: "",
      cep: "",
      codigoIbge: 0,
      complemento: "",
      logradouro: "",
      numero: 0,
    },
    itens: [],
    meiosDePagamento: [
      {
        idMeioDePagamento: 0,
        parcelas: 0,
        valor: 0,
      },
    ],
    numeroPedidoDeVenda: "",
    observacaoDoPedidoDeVenda: "",
    valorDoFrete: 0,
  });

  const [
    isUseRegisteredAddressForDelivery,
    setisUseRegisteredAddressForDelivery,
  ] = useState(true);
  const { toastSuccess, toastError } = ToastNotifications();
  const [clienteSelecionado, setClienteSelecionado] = useState<boolean>(false);
  const [priceListId, setPriceListId] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<
    ProductWithQuantity[]
  >([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { total } = usePostOrderStore();
  const [vendedorName, setVendedorName] = useState<string>("");
  const [firstDueDate, setFirstDueDate] = useState<Date | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [selectedPaymentOption, setSelectedPaymentOption] =
    useState<string>("");

  const [valorFrete, setValorFrete] = useState<number>(0);

  const [period, setPeriod] = useState<string>("semanal");
  const [installments, setInstallments] = useState<string>("1");
  const [createInstallmentsList, setCreateInstallmentsList] =
    useState<boolean>(false);

  const navigate = useNavigate();

  const handleSelectClient = (data: {
    clientData: ClientData | null;
    enderecoDeEntrega: EnderecoDeEntrega | null;
    priceListId: string | null;
  }) => {
    const { clientData, enderecoDeEntrega, priceListId } = data;

    const updatedClientData = clientData
      ? {
          ...clientData,
          documento: clientData.documento || "",
          email: clientData.email || "",
          inscricaoEstadual: clientData.inscricaoEstadual || "",
          nomeDoCliente: clientData.nomeDoCliente || "",
          nomeFantasia: clientData.nomeFantasia || "",
        }
      : null;

    const updatedAddressDelivery = enderecoDeEntrega
      ? {
          ...enderecoDeEntrega,
          bairro: enderecoDeEntrega.bairro || "",
          cep: enderecoDeEntrega.cep || "",
          codigoIbge: enderecoDeEntrega.codigoIbge || 0,
          complemento: enderecoDeEntrega.complemento || "",
          logradouro: enderecoDeEntrega.logradouro || "",
          numero: enderecoDeEntrega.numero || 0,
        }
      : null;

    const updateClientAddress = enderecoDeEntrega
      ? {
          ...enderecoDeEntrega,
          bairro: enderecoDeEntrega.bairro || "",
          cep: enderecoDeEntrega.cep || "",
          codigoIbge: enderecoDeEntrega.codigoIbge || 0,
          complemento: enderecoDeEntrega.complemento || "",
          logradouro: enderecoDeEntrega.logradouro || "",
          numero: enderecoDeEntrega.numero || 0,
        }
      : null;

    setPriceListId(priceListId || "");

    if (updatedAddressDelivery) {
      setOrderSale((prevOrderSaleTypes) => ({
        ...prevOrderSaleTypes,
        cliente: updatedClientData,
        enderecoDeCobranca: updateClientAddress,
        enderecoDeEntrega: isUseRegisteredAddressForDelivery
          ? updatedAddressDelivery
          : prevOrderSaleTypes.enderecoDeEntrega,
      }));
      setClienteSelecionado(true);
    }
  };

  useEffect(() => {
    const vendedor = localStorage.getItem("userName");

    if (vendedor) {
      setVendedorName(vendedor);
    }

    if (isUseRegisteredAddressForDelivery && clienteSelecionado) {
      setOrderSale((prevOrderSaleTypes) => ({
        ...prevOrderSaleTypes,
        enderecoDeEntrega: { ...prevOrderSaleTypes.enderecoDeEntrega },
      }));
    }
  }, [isUseRegisteredAddressForDelivery, clienteSelecionado]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [section, key] = name.split(".");

    setOrderSale((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof OrderSaleTypes] as object),
        [key]: value,
      },
    }));
  };

  const handleProductSelect = (products: ProductWithQuantity[]) => {
    // Atualiza o estado com os produtos e suas quantidades
    setSelectedProducts(products);

    // Atualiza os itens no pedido
    setOrderSale((prevOrderSaleTypes) => {
      const updatedItems = products.map(({ product, quantity }) => ({
        produtoId: product.id,
        nome: product.nome,
        quantidade: quantity,
        preco: product.preco,
        precoUnitarioBruto: product.preco,
        precoUnitarioLiquido: product.preco,
        categoria: product.categoria,
      }));

      return {
        ...prevOrderSaleTypes,
        itens: updatedItems,
      };
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((product) => product.product.id !== productId)
    );

    setOrderSale((prevOrderSaleTypes) => ({
      ...prevOrderSaleTypes,
      itens: prevOrderSaleTypes.itens.filter(
        (item) => item.produtoId !== productId
      ),
    }));
  };

  const handleSelectPaymentMethod = (value: string) => {
    setSelectedPaymentMethod(value);
    const selectedId = parseInt(value, 10);
    console.log("total no pai: ", total);

    if (!isNaN(selectedId)) {
      // Atualiza o estado de meiosDePagamento
      setOrderSale((prevOrderSaleTypes) => ({
        ...prevOrderSaleTypes,
        meiosDePagamento: [
          {
            idMeioDePagamento: selectedId,
            parcelas: parseInt(installments, 10),
            valor: total,
          },
        ],
      }));
    } else {
      console.error("ID do meio de pagamento inválido");
    }
  };

  const handleCreateInstallmentsList = () => {
    if (installments && firstDueDate && selectedPaymentMethod) {
      setCreateInstallmentsList(true);
    } else {
      toastError("Por favor, preencha todos os campos.");
    }
  };

  const handlePostSaleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Produtos sendo enviados: ", orderSale);

    // Validação de campos obrigatórios
    if (
      !orderSale.cliente ||
      !orderSale.enderecoDeEntrega ||
      orderSale.itens.length === 0
    ) {
      toastError("Por favor, preencha todos os campos.");
      return;
    }

    const user = localStorage.getItem("loggedUser");
    const clientId = user ? JSON.parse(user).uid : null;
    if (!clientId) {
      toastError("Usuário não encontrado.");
      return;
    }

    setOrderSale((prevOrderSaleTypes) => ({
      ...prevOrderSaleTypes,
      valorDoFrete: valorFrete,
    }));

    try {
      await axios.post(`${apiBaseUrl}/pedido-de-venda/${clientId}`, orderSale, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setIsSubmitting(false);
      toastSuccess("Pedido de venda criado com sucesso.");

      navigate("/get-orders");
    } catch (error) {
      setIsSubmitting(false);
      console.error("Erro ao enviar pedido:", error);
      toastError("Erro ao criar o pedido.");
    }
  };

  type AddressKey = keyof EnderecoDeEntrega;

  const addressFields: AddressKey[] = [
    "logradouro",
    "numero",
    "bairro",
    "cep",
    "complemento",
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 pb-[1rem]">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar />
      </div>

      {/* Container central */}
      <div className="flex-1 p-4 flex flex-col pt-[3rem]">
        <div className="flex-1 bg-white p-4 rounded shadow-xl overflow-auto">
          {/* Cabeçalho */}
          <CardHeader className="mb-2 flex flex-row gap-x-4 justify-between">
            <CardTitle className="text-xl font-bold">
              <div className="flex items-center justify-start gap-x-12">
                <img src={logo} className="size-[8rem] rounded-full " />
                <h1 className="antialised text-[1.7rem]  flex items-center gap-x-1 text-gray-600">
                  <span>
                    <ChevronsRightIcon
                      size={26}
                      className="text-store-primary"
                    />
                  </span>
                  Nova cotação
                </h1>
              </div>
            </CardTitle>
            <CardDescription>
              <div>
                <span className="text-store-primary">
                  Nº {orderSale.order_code} - {orderCreationDate}
                </span>
              </div>
            </CardDescription>
          </CardHeader>

          <form onSubmit={handlePostSaleOrder} className="space-y-2">
            {/* Informações do pedido */}

            <div className="border border-gray-300 rounded-lg p-4 grid lg:grid-cols-2 gap-6">
              {/* Seção Cliente/Vendedor */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cliente
                    </label>
                    <div className="w-full">
                      <Clients onSelectClient={handleSelectClient} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendedor
                    </label>
                    <Input
                      value={vendedorName}
                      readOnly
                      className="w-full bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Seção Endereço de Entrega */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço de Entrega
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {addressFields.map((field) => (
                      <div key={field} className="space-y-1">
                        <Input
                          type="text"
                          name={`enderecoDeEntrega.${field}`}
                          readOnly={isUseRegisteredAddressForDelivery}
                          value={orderSale.enderecoDeEntrega?.[field]}
                          onChange={handleChange}
                          placeholder={
                            field === "logradouro"
                              ? "Logradouro"
                              : field === "complemento"
                              ? "Complemento"
                              : field === "bairro"
                              ? "Bairro"
                              : field === "cep"
                              ? "CEP"
                              : "Número"
                          }
                          className={`w-full transition-colors ${
                            isUseRegisteredAddressForDelivery
                              ? "bg-gray-100 cursor-not-allowed"
                              : "hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    checked={isUseRegisteredAddressForDelivery}
                    onChange={() =>
                      setisUseRegisteredAddressForDelivery(
                        !isUseRegisteredAddressForDelivery
                      )
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Usar endereço cadastrado?
                  </label>
                </div>
              </div>
            </div>

            {/* Produtos */}
            <div className="border border-gray-300 rounded-lg p-2">
              <ProductSelector
                priceListId={priceListId}
                selectedProducts={selectedProducts}
                onProductSelect={handleProductSelect}
                onRemoveProduct={handleRemoveProduct}
                clientSelected={clienteSelecionado}
              />
            </div>

            {/* Métodos de pagamento */}
            <div className="flex flex-wrap items-end gap-4">
              {/* 1) Tipo de Pagamento (À vista ou Parcelado) */}
              <div className="flex flex-col">
                <label className="text-xs font-medium leading-none mb-1">
                  Tipo de Pagamento
                </label>
                <Select
                  value={selectedPaymentOption}
                  onValueChange={setSelectedPaymentOption}
                >
                  <SelectTrigger className="w-[120px] h-9">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="cash">À Vista</SelectItem>
                      <SelectItem value="installment">Parcelado</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* 2) Condição (número de parcelas) - só exibe se for “Parcelado” */}
              {selectedPaymentOption === "installment" && (
                <div className="flex flex-col">
                  <label className="text-xs font-medium leading-none mb-1">
                    Condição
                  </label>
                  <Select value={installments} onValueChange={setInstallments}>
                    <SelectTrigger className="w-[80px] h-9">
                      <SelectValue placeholder="..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num}x
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 3) Período (Semanal, Quinzenal, Mensal...) - exemplo opcional, 
    pois na imagem há “Semanal” */}
              {selectedPaymentOption === "installment" && (
                <div className="flex flex-col">
                  <label className="text-xs font-medium leading-none mb-1">
                    Período
                  </label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[120px] h-9">
                      <SelectValue placeholder={period} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="quinzenal">Quinzenal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 4) Forma de Pagamento (ex.: Débito Bancário) */}
              <div className="flex flex-col">
                <label className="text-xs font-medium leading-none mb-1">
                  Forma de Pagamento
                </label>
                <Select
                  value={selectedPaymentMethod}
                  onValueChange={handleSelectPaymentMethod}
                >
                  <SelectTrigger className="w-[20rem] h-9">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {/* Você pode remover o <Selectlabel> ou usá-lo como “categoria” */}
                      <SelectLabel>Escolha</SelectLabel>
                      <SelectItem value="10">
                        <span className="flex items-center gap-x-2">
                          Crédito em loja{" "}
                          <span>
                            <CircleIcon
                              color="green"
                              size={15}
                              className="fill-green-300"
                            />
                          </span>
                        </span>
                      </SelectItem>
                      <SelectItem value="1">Dinheiro</SelectItem>
                      <SelectItem value="2">Cheque</SelectItem>
                      <SelectItem value="3">Devolução</SelectItem>
                      <SelectItem value="4">Cartão de crédito</SelectItem>
                      <SelectItem value="5">Cartão de débito</SelectItem>
                      <SelectItem value="6">Boleto</SelectItem>
                      <SelectItem value="7">Cartão Voucher</SelectItem>
                      <SelectItem value="8">PIX</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* 5) Primeiro Vencimento */}
              <div className="flex flex-col">
                <label className="text-xs font-medium leading-none mb-1">
                  Primeiro Vencimento
                </label>
                <DatePicker
                  date={firstDueDate}
                  setDate={setFirstDueDate}
                  minDate={new Date()}
                  placeholderText="Selecione uma data"
                  className="w-[16rem] h-9"
                />
              </div>

              {/* Exemplo opcional: Valor do Pagamento (caso queira) */}
              <div className="flex flex-col">
                <label className="text-xs font-medium leading-none mb-1">
                  Valor final
                </label>
                <Input
                  type="number"
                  value={total.toFixed(2)}
                  className="w-[100px] h-9"
                  readOnly
                />
              </div>
              <div>
                <CheckIcon
                  size={30}
                  aria-disabled={createInstallmentsList}
                  onClick={handleCreateInstallmentsList}
                  color="green"
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Observações
                </label>
                <Input
                  type="text"
                  value={orderSale.observacaoDoPedidoDeVenda}
                  onChange={(e) =>
                    setOrderSale((prev) => ({
                      ...prev,
                      observacaoDoPedidoDeVenda: e.target.value,
                    }))
                  }
                  placeholder="Observação do Pedido"
                  className="mt-1 min-w-[70rem]"
                />
              </div>
            </div>

            {createInstallmentsList && (
              <div className="border rounded-lg overflow-hidden flex flex-col max-h-[12rem] max-w-[70rem]">
                <InstallmentsTable
                  formaPagamento={selectedPaymentMethod}
                  periodo={period}
                  parcelamento={parseInt(installments, 10)}
                  valorTotal={total}
                />
              </div>
            )}
            <div className="flex gap-x-4 justify-start items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Valor do Frete
                </label>
                <Input
                  type="number"
                  value={valorFrete}
                  onChange={(e) => setValorFrete(Number(e.target.value))}
                  className="mt-1 w-[5rem] text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Previsão de entrega
                </label>
                <DatePicker
                  date={deliveryDate}
                  setDate={setDeliveryDate}
                  minDate={new Date()}
                  placeholderText="Selecione uma data"
                  className="w-[16rem] h-9"
                />
              </div>
            </div>

            <CardFooter className="flex justify-end mt-2 gap-x-4">
              <Button
                onClick={handlePostSaleOrder}
                className="bg-green-500 hover:bg-green-400"
                disabled={
                  selectedProducts.length === 0 &&
                  selectedPaymentMethod === "" &&
                  !clienteSelecionado &&
                  !firstDueDate &&
                  selectedPaymentOption === ""
                }
              >
                Salvar orçamento
              </Button>
              <Button
                onClick={handlePostSaleOrder}
                disabled={
                  selectedProducts.length === 0 &&
                  selectedPaymentMethod === "" &&
                  !clienteSelecionado &&
                  !firstDueDate &&
                  selectedPaymentOption === ""
                }
              >
                Criar Pedido
              </Button>
            </CardFooter>
          </form>

          <DialogSubmit isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
};

export default OrderSaleProps;
