/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useZustandContext } from "@/context/cartContext";
import { useNavigate } from "react-router-dom";
import ToastNotifications from "@/_components/Toasts";
import { OrderSaleTypes } from "./PostSaleOrder";
import { format } from "date-fns";
import {
  // collection,
  doc,
  getDoc,
  /*   getDocs,
  limit,
  orderBy,
  query, */
} from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import { Client } from "./DropdownGetClients";
import DialogSubmit from "./DialogSubmitOrder";
import apiBaseUrl from "@/lib/apiConfig";

export type ProductInPriceList = {
  id: string;
  name: string;
  value: number;
};

interface ItensProps {
  produtoId: string;
  quantidade: number;
  categoria?: string;
  preco: number;
  precoUnitarioLiquido?: number;
}

const PedidoVendaForm: React.FC = () => {
  const orderCreationDate = format(new Date(), "yyyy/MM/dd HH:mm:ss");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [orderSale, setOrderSale] = useState<OrderSaleTypes>({
    status_order: 1,
    order_code: 0,
    created_at: orderCreationDate,
    updated_at: orderCreationDate,
    cliente: null,
    IdClient: "",
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

  const { totalValue, listProductsInCart, clearListProductsInCart } =
    useZustandContext();
  const { toastSuccess, toastError } = ToastNotifications();
  const navigate = useNavigate();

  const fetchLastOrders = async () => {
    const includingProductsInItens: ItensProps[] = listProductsInCart.map(
      (item) => {
        return {
          ...item,
          produtoId: item.id,
          categoria: item.categoria,
          preco: item.preco,
          precoUnitarioBruto: item.preco,
          precoUnitarioLiquido: item.preco,
        };
      }
    );

    setOrderSale((prev) => ({
      ...prev,
      itens: includingProductsInItens,
    }));
  };

  const handlePaymentMethod = (paymentMethod: string) => {
    const selectedId = parseInt(paymentMethod, 10);

    if (!isNaN(selectedId)) {
      setOrderSale((prevList) => ({
        ...prevList,
        meiosDePagamento: [
          { idMeioDePagamento: selectedId, parcelas: 1, valor: totalValue },
        ],
      }));
    } else {
      console.error("ID do meio de pagamento inválido !");
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    console.log("informações: ", orderSale);

    const getUserId = localStorage.getItem("loggedUser");

    const user = getUserId && JSON.parse(getUserId);
    if (!user) {
      toastError("Usuário não encontrado.");
      return;
    }

    console.log(user.uid);

    setOrderSale((prev) => ({
      ...prev,
      IdClient: user.uid,
    }));

    try {
      const response = await axios.post(`${apiBaseUrl}/post-order`, orderSale, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Pedido enviado com sucesso:", response.data);
      toastSuccess("Pedido criado com sucesso !");
      setTimeout(() => {
        clearListProductsInCart(listProductsInCart);
        navigate("/");
      }, 500);
      setIsSubmitting(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log("Dados enviados na requisição que deu erro: ", orderSale);
        console.error("Erro ao enviar pedido:", error.message);
      } else {
        console.error("Erro desconhecido:", error);
      }
      toastError("Ocorreu um erro ao enviar seu pedido !");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  };

  const fetchClientes = async () => {
    try {
      const JSONuserCredentials = localStorage.getItem("loggedUser");

      const userCredentials =
        JSONuserCredentials && JSON.parse(JSONuserCredentials);

      const clientesCollection = doc(firestore, "clients", userCredentials.uid);
      const clientesSnapshot = await getDoc(clientesCollection);

      const data = clientesSnapshot.data() as Client;

      if (data) {
        handlePushForm(data);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const handlePushForm = (data: Client) => {
    if (!data) {
      console.error("Dados inválidos fornecidos ao handlePushForm.");
      return;
    }

    const updatedClientData = {
      documento: data.cpf || "",
      email: data.email || "",
      inscricaoEstadual: data.user_IE || "",
      nomeDoCliente: data.name || "",
      nomeFantasia: data.user_fantasyName || "",
    };

    const createAddress = (clientData: Client) => ({
      bairro: clientData.bairro || "",
      cep: String(clientData.CEP || ""),
      codigoIbge: clientData.IBGE || 0,
      complemento: clientData.user_complement || "",
      logradouro: clientData.logradouro || "",
      numero: clientData.numberHouse || 0,
    });

    const updatedAddress = createAddress(data);

    setOrderSale((prevOrderSaleTypes) => ({
      ...prevOrderSaleTypes,
      cliente: updatedClientData,
      enderecoDeCobranca: updatedAddress,
      enderecoDeEntrega: updatedAddress,
    }));
  };

  useEffect(() => {
    fetchClientes();
    fetchLastOrders();

    console.log("Lista de produtos: ", listProductsInCart);
    console.log("OrderSale: ", orderSale);
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2  w-full">
        <Accordion type="multiple">
          <AccordionItem value="item-1" className="w-full">
            <AccordionTrigger>
              <h2>Cliente</h2>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <Input
                type="text"
                name="cliente.documento"
                value={orderSale.cliente?.documento}
                onChange={handleChange}
                placeholder="Documento"
                disabled
              />
              <Input
                type="email"
                name="cliente.email"
                value={orderSale.cliente?.email}
                onChange={handleChange}
                placeholder="Email"
                disabled
              />
              <Input
                type="text"
                name="cliente.inscricaoEstadual"
                value={orderSale.cliente?.inscricaoEstadual}
                onChange={handleChange}
                placeholder="Inscrição Estadual"
                disabled
              />
              <Input
                type="text"
                name="cliente.nomeDoCliente"
                value={orderSale.cliente?.nomeDoCliente}
                onChange={handleChange}
                placeholder="Nome do Cliente"
                disabled
              />
              <Input
                type="text"
                name="cliente.nomeFantasia"
                value={orderSale.cliente?.nomeFantasia}
                onChange={handleChange}
                placeholder="Nome Fantasia"
                disabled
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="w-full">
            <AccordionTrigger>
              <h2>Endereço de Cobrança</h2>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <Input
                type="text"
                name="enderecoDeCobranca.bairro"
                value={orderSale.enderecoDeCobranca?.bairro}
                onChange={handleChange}
                placeholder="Bairro"
              />
              <Input
                type="text"
                name="enderecoDeCobranca.cep"
                value={orderSale.enderecoDeCobranca?.cep}
                onChange={handleChange}
                placeholder="CEP"
              />
              <Input
                type="text"
                name="enderecoDeCobranca.codigoIbge"
                value={orderSale.enderecoDeCobranca?.codigoIbge}
                onChange={handleChange}
                max={7}
                placeholder="Código IBGE"
              />
              <Input
                type="text"
                name="enderecoDeCobranca.complemento"
                value={orderSale.enderecoDeCobranca?.complemento}
                onChange={handleChange}
                placeholder="Complemento"
              />
              <Input
                type="text"
                name="enderecoDeCobranca.logradouro"
                value={orderSale.enderecoDeCobranca?.logradouro}
                onChange={handleChange}
                placeholder="Logradouro"
              />
              <Input
                type="text"
                name="enderecoDeCobranca.numero"
                value={orderSale.enderecoDeCobranca?.numero}
                onChange={handleChange}
                placeholder="Número"
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="w-full">
            <AccordionTrigger>
              <h2>Endereço de Entrega</h2>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <Input
                type="text"
                name="enderecoDeEntrega.bairro"
                value={orderSale.enderecoDeEntrega.bairro}
                onChange={handleChange}
                placeholder="Bairro"
              />
              <Input
                type="text"
                name="enderecoDeEntrega.cep"
                value={orderSale.enderecoDeEntrega.cep}
                onChange={handleChange}
                placeholder="CEP"
              />
              <Input
                type="text"
                name="enderecoDeEntrega.codigoIbge"
                value={orderSale.enderecoDeEntrega.codigoIbge}
                onChange={handleChange}
                placeholder="Código IBGE"
              />
              <Input
                type="text"
                name="enderecoDeEntrega.complemento"
                value={orderSale.enderecoDeEntrega.complemento}
                onChange={handleChange}
                placeholder="Complemento"
              />
              <Input
                type="text"
                name="enderecoDeEntrega.logradouro"
                value={orderSale.enderecoDeEntrega.logradouro}
                onChange={handleChange}
                placeholder="Logradouro"
              />
              <Input
                type="text"
                name="enderecoDeEntrega.numero"
                value={orderSale.enderecoDeEntrega.numero}
                onChange={handleChange}
                placeholder="Número"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Select required onValueChange={(value) => handlePaymentMethod(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Método de pagamento:" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Dinheiro</SelectItem>
            <SelectItem value="2">Cheque</SelectItem>
            <SelectItem value="3">Devolução</SelectItem>
            <SelectItem value="4">Cartão de crédito</SelectItem>
            <SelectItem value="5">Cartão de débito</SelectItem>
            <SelectItem value="6">Boleto</SelectItem>
            <SelectItem value="7">Crédito do cliente</SelectItem>
            <SelectItem value="8">PIX</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="submit"
          disabled={isSubmitting === true}
          className={`${isSubmitting === true ? "opacity-60" : ""}`}
        >
          {isSubmitting === true ? "Enviando pedido" : "Finalizar pedido"}
        </Button>
      </form>
      <DialogSubmit isSubmitting={isSubmitting} />
    </div>
  );
};

export default PedidoVendaForm;
