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

export type OrderSaleTypes = {
  cliente: {
    documento: string;
    email: string;
    inscricaoEstadual: string;
    nomeDoCliente: string;
    nomeFantasia: string;
  };
  enderecoDeCobranca: {
    bairro: string;
    cep: string;
    codigoIbge: number;
    complemento: string;
    logradouro: string;
    numero: string;
  };
  enderecoDeEntrega: {
    bairro: string;
    cep: string;
    codigoIbge: number;
    complemento: string;
    logradouro: string;
    numero: string;
  };
  itens: {
    produtoId: string;
    quantidade: number;
    precoUnitarioBruto: number;
    precoUnitarioLiquido: number;
  }[];
  meiosDePagamento: {
    idMeioDePagamento: number;
    parcelas: number;
    valor: number;
  }[];
  numeroPedidoDeVenda: string;
  observacaoDoPedidoDeVenda: string;
  valorDoFrete: number;
};

export type EnderecoDeEntrega = {
  bairro: string;
  cep: string;
  codigoIbge: number;
  complemento: string;
  logradouro: string;
  numero: string;
};

interface ProductWithQuantity {
  product: ProductInPriceList;
  quantity: number;
}

export type ProductInPriceList = {
  id: string;
  name: string;
  value: number;
};

const OrderSaleProps: React.FC = () => {
  const [orderSale, setOrderSale] = useState<OrderSaleTypes>({
    cliente: {
      documento: "",
      email: "",
      inscricaoEstadual: "",
      nomeDoCliente: "",
      nomeFantasia: "",
    },
    enderecoDeCobranca: {
      bairro: "",
      cep: "",
      codigoIbge: 0,
      complemento: "",
      logradouro: "",
      numero: "",
    },
    enderecoDeEntrega: {
      bairro: "",
      cep: "",
      codigoIbge: 0,
      complemento: "",
      logradouro: "",
      numero: "",
    },
    itens: [],
    meiosDePagamento: [],
    numeroPedidoDeVenda: "",
    observacaoDoPedidoDeVenda: "",
    valorDoFrete: 0,
  });

  const [useRegisteredAddressForDelivery, setUseRegisteredAddressForDelivery] =
    useState(true);
  const [clienteSelecionado, setClienteSelecionado] = useState<boolean>(false);
  const [priceListId, setPriceListId] = useState<string>("");

  const [selectedProducts, setSelectedProducts] = useState<
    ProductWithQuantity[]
  >([]);

  const handleSelectClient = (data: {
    enderecoDeEntrega: EnderecoDeEntrega | null;
    priceListId: string | null;
  }) => {
    const { enderecoDeEntrega, priceListId } = data;

    setPriceListId(priceListId || "");

    if (enderecoDeEntrega) {
      setOrderSale((prevOrderSaleTypes) => ({
        ...prevOrderSaleTypes,
        cliente: {
          ...prevOrderSaleTypes.cliente,
          nomeDoCliente: "Cliente Selecionado",
        },
        enderecoDeEntrega: useRegisteredAddressForDelivery
          ? enderecoDeEntrega
          : prevOrderSaleTypes.enderecoDeEntrega,
      }));
      setClienteSelecionado(true);
    }
  };

  useEffect(() => {
    if (useRegisteredAddressForDelivery && clienteSelecionado) {
      setOrderSale((prevOrderSaleTypes) => ({
        ...prevOrderSaleTypes,
        enderecoDeEntrega: { ...prevOrderSaleTypes.enderecoDeEntrega },
      }));
    }
  }, [useRegisteredAddressForDelivery, clienteSelecionado]);

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
        quantidade: quantity,
        precoUnitarioBruto: product.value,
        precoUnitarioLiquido: product.value,
      }));

      return {
        ...prevOrderSaleTypes,
        itens: updatedItems,
      };
    });
  };

  const handleRemoveProduct = (productId: string) => {
    // Remove o produto da lista de produtos selecionados
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("JSON a ser enviado:", JSON.stringify(orderSale));
    console.log("Price List ID:", priceListId);

    const user = localStorage.getItem("user");
    const clientId = user ? JSON.parse(user).uid : null;
    console.log("Id do usuário:", clientId);

    if (clientId) {
      try {
        const response = await axios.post(
          `https://us-central1-server-kyoto.cloudfunctions.net/api/v1/pedido-de-venda/${clientId}`,
          orderSale,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Pedido enviado com sucesso:", response.data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(
            "Erro ao enviar pedido:",
            error.response?.data || error.message
          );
        } else {
          console.error("Erro desconhecido:", error);
        }
      }
    } else {
      console.error("Usuário não encontrado no localStorage.");
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
                  value={orderSale.enderecoDeEntrega.bairro}
                  onChange={handleChange}
                  placeholder="Bairro"
                  className="w-full"
                />

                <Input
                  type="text"
                  name="enderecoDeEntrega.cep"
                  value={orderSale.enderecoDeEntrega.cep}
                  onChange={handleChange}
                  placeholder="CEP"
                  className="w-full"
                />

                <Input
                  type="text"
                  name="enderecoDeEntrega.complemento"
                  value={orderSale.enderecoDeEntrega.complemento}
                  onChange={handleChange}
                  placeholder="Complemento"
                  className="w-full"
                />

                <Input
                  type="text"
                  name="enderecoDeEntrega.logradouro"
                  value={orderSale.enderecoDeEntrega.logradouro}
                  onChange={handleChange}
                  placeholder="Logradouro"
                  className="w-full"
                />

                <Input
                  type="text"
                  name="enderecoDeEntrega.numero"
                  value={orderSale.enderecoDeEntrega.numero}
                  onChange={handleChange}
                  placeholder="Número"
                  className="w-full"
                />
              </div>

              <div className="mt-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    disabled={!clienteSelecionado}
                    checked={useRegisteredAddressForDelivery}
                    onChange={() =>
                      setUseRegisteredAddressForDelivery(
                        !useRegisteredAddressForDelivery
                      )
                    }
                    className="OrderSaleTypes-checkbox"
                  />
                  <span className="ml-2">Usar endereço cadastrado ?</span>
                </label>
              </div>
            </fieldset>

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
              />
            </fieldset>
          </form>
        </CardContent>

        <CardFooter>
          <Button onClick={handleSubmit} disabled={!clienteSelecionado}>
            Enviar Pedido
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderSaleProps;
