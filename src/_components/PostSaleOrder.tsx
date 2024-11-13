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
import Clients from "./GetClients";
import ProductSelector from "../_components/GetProductList";

export type Product = {
  id: string;
  name: string;
  value: number;
};

export type Form = {
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

const PedidoVendaForm: React.FC = () => {
  const [form, setForm] = useState<Form>({
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
    useState(false);

  const [clienteSelecionado, setClienteSelecionado] = useState<boolean>(false);

  const handleSelectClient = (enderecoDeEntrega: EnderecoDeEntrega | null) => {
    if (enderecoDeEntrega) {
      setForm((prevForm) => ({
        ...prevForm,
        cliente: {
          ...prevForm.cliente,
          nomeDoCliente: "Cliente Selecionado",
        },
        enderecoDeEntrega: useRegisteredAddressForDelivery
          ? enderecoDeEntrega
          : prevForm.enderecoDeEntrega,
      }));

      setClienteSelecionado(true); // Marca o cliente como selecionado
    }
  };

  useEffect(() => {
    if (useRegisteredAddressForDelivery && clienteSelecionado) {
      // Preenche os campos de entrega se o checkbox estiver marcado e o cliente selecionado
      setForm((prevForm) => ({
        ...prevForm,
        enderecoDeEntrega: {
          ...prevForm.enderecoDeEntrega,
        },
      }));
    }
  }, [useRegisteredAddressForDelivery, clienteSelecionado]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [section, key] = name.split(".");

    setForm((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof Form] as object),
        [key]: value,
      },
    }));
  };

  const handleProductSelect = (product: Product) => {
    setForm((prevForm) => ({
      ...prevForm,
      itens: [
        ...prevForm.itens,
        {
          produtoId: product.id,
          quantidade: 1,
          precoUnitarioBruto: product.value,
          precoUnitarioLiquido: product.value,
        },
      ],
    }));
  };

  const handleRemoveProduct = (productId: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      itens: prevForm.itens.filter((item) => item.produtoId !== productId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("JSON a ser enviado:", JSON.stringify(form));

    const user = localStorage.getItem("user");
    const clientId = user ? JSON.parse(user).uid : null;
    console.log("Id do usuário:", clientId);

    if (clientId) {
      try {
        const response = await axios.post(
          `https://us-central1-server-kyoto.cloudfunctions.net/api/v1/pedido-de-venda/${clientId}`,
          form,
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
            {/* Seção Cliente */}
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
                  value={form.enderecoDeEntrega.bairro}
                  onChange={handleChange}
                  placeholder="Bairro"
                  className="w-full"
                />
                <Input
                  type="text"
                  name="enderecoDeEntrega.cep"
                  value={form.enderecoDeEntrega.cep}
                  onChange={handleChange}
                  placeholder="CEP"
                  className="w-full"
                />
                <Input
                  type="text"
                  name="enderecoDeEntrega.codigoIbge"
                  value={form.enderecoDeEntrega.codigoIbge.toString()}
                  onChange={handleChange}
                  placeholder="Código IBGE"
                  className="w-full"
                />
                <Input
                  type="text"
                  name="enderecoDeEntrega.complemento"
                  value={form.enderecoDeEntrega.complemento}
                  onChange={handleChange}
                  placeholder="Complemento"
                  className="w-full"
                />
                <Input
                  type="text"
                  name="enderecoDeEntrega.logradouro"
                  value={form.enderecoDeEntrega.logradouro}
                  onChange={handleChange}
                  placeholder="Logradouro"
                  className="w-full"
                />
                <Input
                  type="text"
                  name="enderecoDeEntrega.numero"
                  value={form.enderecoDeEntrega.numero}
                  onChange={handleChange}
                  placeholder="Número"
                  className="w-full"
                />
              </div>

              {/* Checkbox para usar o endereço registrado */}
              <div className="mt-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    disabled={!clienteSelecionado} // Desabilita o checkbox se o cliente não foi selecionado
                    checked={useRegisteredAddressForDelivery}
                    onChange={() =>
                      setUseRegisteredAddressForDelivery(
                        !useRegisteredAddressForDelivery
                      )
                    }
                    className="form-checkbox"
                  />
                  <span className="ml-2">
                    Usar endereço registrado para entrega
                  </span>
                </label>
              </div>
            </fieldset>

            {/* Seção Produtos */}
            <fieldset className="border border-gray-200 rounded-lg p-4">
              <legend className="text-lg font-semibold text-gray-700">
                Produtos
              </legend>
              <ProductSelector
                onProductSelect={handleProductSelect}
                selectedProducts={form.itens.map((item) => ({
                  id: item.produtoId,
                  name: item.produtoId, // Ajuste conforme necessário para obter o nome do produto
                  value: item.precoUnitarioBruto,
                }))}
                onRemoveProduct={handleRemoveProduct}
              />
            </fieldset>
          </form>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            className="px-6 py-2 bg-green-500 text-white"
            onClick={handleSubmit}
          >
            Finalizar pedido
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PedidoVendaForm;
