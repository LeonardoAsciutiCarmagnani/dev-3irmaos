import React, { useState, useEffect } from "react";
import axios from "axios";
import { CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Clients from "./DropdownGetClients";
import ProductSelector from "../_components/GetProductList";
import {
  Select,
  SelectContent,
  SelectItem,
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
    IdClient: "",
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

  console.log(orderSale);

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

  const navigate = useNavigate();

  const handleSelectClient = (data: {
    clientData: ClientData | null;
    enderecoDeEntrega: EnderecoDeEntrega | null;
    priceListId: string | null;
    user_id: string;
  }) => {
    const { clientData, enderecoDeEntrega, priceListId, user_id } = data;

    setOrderSale({ ...orderSale, IdClient: user_id });

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
            parcelas: 1,
            valor: total,
          },
        ],
      }));
    } else {
      console.error("ID do meio de pagamento inválido");
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

    try {
      await axios.post(`${apiBaseUrl}/post-order`, orderSale, {
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
          <CardHeader className="mb-2">
            <CardTitle className="text-xl font-bold">Nova cotação</CardTitle>
          </CardHeader>

          <form onSubmit={handlePostSaleOrder} className="space-y-2">
            {/* Informações do pedido */}

            <div className="border border-gray-300 rounded-lg p-2 flex justify-evenly gap-x-4">
              <div className="grid grid-cols-2 gap-1 w-fit">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nº Pedido
                  </label>
                  <Input
                    value={orderSale.order_code}
                    readOnly
                    className="mt-1 w-[4rem]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Data
                  </label>
                  <Input value={orderCreationDate} readOnly className="mt-1" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Vendedor
                  </label>
                  <Input value={vendedorName} readOnly className="mt-1" />
                </div>

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
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Valor do Frete
                  </label>
                  <Input
                    type="number"
                    value={orderSale.valorDoFrete}
                    onChange={(e) =>
                      setOrderSale((prev) => ({
                        ...prev,
                        valorDoFrete: Number(e.target.value),
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="rounded-lg p-2 w-fit h-fit">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <Clients onSelectClient={handleSelectClient} />
              </div>
              <div className=" rounded-lg p-2 h-fit">
                <label className="block text-sm font-medium text-gray-700">
                  Endereço de Entrega
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-1">
                  <div>
                    <Input
                      type="text"
                      name="enderecoDeEntrega.bairro"
                      readOnly={isUseRegisteredAddressForDelivery}
                      value={orderSale.enderecoDeEntrega?.bairro}
                      onChange={handleChange}
                      placeholder="Bairro"
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      name="enderecoDeEntrega.cep"
                      readOnly={isUseRegisteredAddressForDelivery}
                      value={orderSale.enderecoDeEntrega?.cep}
                      onChange={handleChange}
                      placeholder="CEP"
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      name="enderecoDeEntrega.complemento"
                      readOnly={isUseRegisteredAddressForDelivery}
                      value={orderSale.enderecoDeEntrega?.complemento}
                      onChange={handleChange}
                      placeholder="Complemento"
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      name="enderecoDeEntrega.logradouro"
                      readOnly={isUseRegisteredAddressForDelivery}
                      value={orderSale.enderecoDeEntrega?.logradouro}
                      onChange={handleChange}
                      placeholder="Logradouro"
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      name="enderecoDeEntrega.numero"
                      readOnly={isUseRegisteredAddressForDelivery}
                      value={orderSale.enderecoDeEntrega?.numero}
                      onChange={handleChange}
                      placeholder="Número"
                    />
                  </div>
                </div>

                <div className="mt-1">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={isUseRegisteredAddressForDelivery}
                      onChange={() =>
                        setisUseRegisteredAddressForDelivery(
                          !isUseRegisteredAddressForDelivery
                        )
                      }
                    />
                    <span className="ml-1 text-sm">
                      Usar endereço cadastrado?
                    </span>
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
              />
            </div>

            {/* Métodos de pagamento */}
            <div className="border border-gray-300 rounded-lg p-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pagamento
              </label>
              <Select
                required
                onValueChange={handleSelectPaymentMethod}
                value={selectedPaymentMethod}
                disabled={selectedProducts.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      selectedPaymentMethod
                        ? selectedPaymentMethod
                        : "Selecione o método de pagamento"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Dinheiro</SelectItem>
                  <SelectItem value="2">Cheque</SelectItem>
                  <SelectItem value="3">Devolução</SelectItem>
                  <SelectItem value="4">Cartão de crédito</SelectItem>
                  <SelectItem value="5">Cartão de débito</SelectItem>
                  <SelectItem value="6">Boleto</SelectItem>
                  <SelectItem value="7">Cartão Voucher</SelectItem>
                  <SelectItem value="8">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <CardFooter className="flex justify-end mt-2">
              <Button
                onClick={handlePostSaleOrder}
                disabled={selectedProducts.length === 0}
              >
                Enviar Pedido
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
