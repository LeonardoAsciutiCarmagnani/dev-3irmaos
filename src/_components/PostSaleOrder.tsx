import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ToastNotifications from "./Toasts";
import { Product } from "@/context/cartContext";
import { format } from "date-fns";

export type OrderSaleTypes = {
  order_code?: number;
  status_order?: number;
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
  const orderCreationDate = format(new Date(), "yyyy/MM/dd  HH:mm:ss");
  const [orderSale, setOrderSale] = useState<OrderSaleTypes>({
    status_order: 1,
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
    meiosDePagamento: [],
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
  const [total, setTotal] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");

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
      setOrderSale((prevState) => {
        const updatedMeiosDePagamento = [...prevState.meiosDePagamento];
        updatedMeiosDePagamento.push({
          idMeioDePagamento: selectedId,
          parcelas: 1,
          valor: Number(total.toFixed(2)),
        });

        return {
          ...prevState,
          meiosDePagamento: updatedMeiosDePagamento,
        };
      });
    } else {
      console.error("ID do meio de pagamento inválido");
    }
  };

  const handleTotalChange = (newTotal: number) => {
    console.log("Setando total...", newTotal);
    setTotal(newTotal);
  };

  const handlePostSaleOrder = async (e: React.FormEvent) => {
    e.preventDefault();

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

    const user = localStorage.getItem("user");
    const clientId = user ? JSON.parse(user).uid : null;
    if (!clientId) {
      toastError("Usuário não encontrado.");
      return;
    }

    try {
      await axios.post(
        `https://us-central1-server-kyoto.cloudfunctions.net/api/v1/pedido-de-venda/${clientId}`,
        orderSale,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toastSuccess("Pedido de venda criado com sucesso.");
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      toastError("Erro ao criar o pedido.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Novo pedido</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-6">
            <fieldset className="border border-gray-200 rounded-lg p-4">
              <legend className="text-lg font-semibold text-gray-700">
                Cliente
              </legend>
              <Clients onSelectClient={handleSelectClient} />
            </fieldset>

            {/* Seção Endereço de Entrega */}
            <fieldset className="border border-gray-200 rounded-lg p-4">
              <legend className="text-lg font-semibold text-gray-700">
                Endereço de Entrega
              </legend>

              <div className="grid grid-cols-1 gap-4 mt-4">
                <Input
                  type="text"
                  name="enderecoDeEntrega.bairro"
                  readOnly={isUseRegisteredAddressForDelivery}
                  value={orderSale.enderecoDeEntrega?.bairro}
                  onChange={handleChange}
                  placeholder="Bairro"
                  className="w-full"
                />

                <Input
                  type="text"
                  name="enderecoDeEntrega.cep"
                  readOnly={isUseRegisteredAddressForDelivery}
                  value={orderSale.enderecoDeEntrega?.cep}
                  onChange={handleChange}
                  placeholder="CEP"
                  className="w-full"
                />

                <Input
                  type="text"
                  name="enderecoDeEntrega.complemento"
                  readOnly={isUseRegisteredAddressForDelivery}
                  value={orderSale.enderecoDeEntrega?.complemento}
                  onChange={handleChange}
                  placeholder="Complemento"
                  className="w-full"
                />

                <Input
                  type="text"
                  name="enderecoDeEntrega.logradouro"
                  readOnly={isUseRegisteredAddressForDelivery}
                  value={orderSale.enderecoDeEntrega?.logradouro}
                  onChange={handleChange}
                  placeholder="Logradouro"
                  className="w-full"
                />

                <Input
                  type="text"
                  name="enderecoDeEntrega.numero"
                  readOnly={isUseRegisteredAddressForDelivery}
                  value={orderSale.enderecoDeEntrega?.numero}
                  onChange={handleChange}
                  placeholder="Número"
                  className="w-full"
                />
              </div>

              <div className="mt-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={isUseRegisteredAddressForDelivery}
                    onChange={() =>
                      setisUseRegisteredAddressForDelivery(
                        !isUseRegisteredAddressForDelivery
                      )
                    }
                    className="OrderSaleTypes-checkbox"
                  />
                  <span className="ml-2">Usar endereço cadastrado ?</span>
                </label>
              </div>
            </fieldset>

            {clienteSelecionado && (
              <>
                {/* Produtos */}
                <fieldset className="border border-gray-200 rounded-lg p-4">
                  <legend className="text-lg font-semibold text-gray-700">
                    Produtos
                  </legend>
                  <ProductSelector
                    priceListId={priceListId}
                    selectedProducts={selectedProducts}
                    onProductSelect={handleProductSelect}
                    onRemoveProduct={handleRemoveProduct}
                    onTotalChange={handleTotalChange}
                  />
                </fieldset>

                {/* Métodos de pagamento */}
                <fieldset className="border border-gray-200 rounded-lg p-4 mt-4">
                  <legend className="text-lg font-semibold text-gray-700">
                    Métodos de pagamento
                  </legend>
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
                            : "Método de pagamento:"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Dinheiro</SelectItem>
                      <SelectItem value="2">Cheque</SelectItem>
                      <SelectItem value="3">Devolução</SelectItem>
                      <SelectItem value="4">Cartão de crédito</SelectItem>
                      <SelectItem value="5">Cartão de débito</SelectItem>
                      <SelectItem value="6">Crediário</SelectItem>
                      <SelectItem value="7">Cartão Voucher</SelectItem>
                      <SelectItem value="8">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </fieldset>
              </>
            )}
          </form>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            onClick={handlePostSaleOrder}
            disabled={selectedProducts.length === 0}
          >
            Enviar Pedido
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderSaleProps;
