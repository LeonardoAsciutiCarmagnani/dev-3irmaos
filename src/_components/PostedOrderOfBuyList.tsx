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
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import { Client } from "./DropdownGetClients";

export type ProductInPriceList = {
  id: string;
  name: string;
  value: number;
};

interface ItensProps {
  quantidade: number;
  categoria?: string;
  preco: number;
  precoUnitarioLiquido?: number;
}

const PedidoVendaForm: React.FC = () => {
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

  const { totalValue, listProductsInCart } = useZustandContext();
  const { toastSuccess } = ToastNotifications();
  const navigate = useNavigate();

  const fetchLastOrders = async () => {
    const collectionRef = collection(firestore, "sales_orders");
    const q = query(collectionRef, orderBy("order_code", "desc"), limit(1));
    const queryDocs = await getDocs(q);

    let lastOrderNumber = 0;

    if (!queryDocs.empty) {
      const lastOrder = queryDocs.docs[0].data();
      lastOrderNumber = lastOrder.order_code || 0;
    }

    const newOrderNumber = lastOrderNumber + 1;

    console.log(newOrderNumber);

    orderSale.order_code = newOrderNumber;

    const includingProductsInItens: ItensProps[] = listProductsInCart.map(
      (item) => {
        return {
          ...item,
          produtoId: item.id,
          categoria: item.categoria,
        };
      }
    );

    if (orderSale.itens) {
      orderSale.itens = includingProductsInItens;
    }
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
    fetchLastOrders();

    console.log("informações: ", orderSale);

    const getUserId = localStorage.getItem("user");

    const userId = getUserId && JSON.parse(getUserId);
    try {
      const response = await axios.post(
        `https://us-central1-server-kyoto.cloudfunctions.net/api/v1/pedido-de-venda/${userId.uid}`,
        orderSale,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Pedido enviado com sucesso:", response.data);
      toastSuccess("Pedido criado com sucesso !");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log("Dados enviados na requisição que deu erro: ", orderSale);
        console.error("Erro ao enviar pedido:", error.message);
      } else {
        console.error("Erro desconhecido:", error);
      }
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
      documento: data.user_CPF || "",
      email: data.user_email || "",
      inscricaoEstadual: data.user_IE || "",
      nomeDoCliente: data.user_name || "",
      nomeFantasia: data.user_fantasyName || "",
    };

    const createAddress = (clientData: Client) => ({
      bairro: clientData.user_neighborhood || "",
      cep: String(clientData.user_cep || ""),
      codigoIbge: clientData.user_ibgeCode || 0,
      complemento: clientData.user_complement || "",
      logradouro: clientData.user_logradouro || "",
      numero: clientData.user_houseNumber || 0,
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
  }, []);

  return (
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
            />
            <Input
              type="email"
              name="cliente.email"
              value={orderSale.cliente?.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <Input
              type="text"
              name="cliente.inscricaoEstadual"
              value={orderSale.cliente?.inscricaoEstadual}
              onChange={handleChange}
              placeholder="Inscrição Estadual"
            />
            <Input
              type="text"
              name="cliente.nomeDoCliente"
              value={orderSale.cliente?.nomeDoCliente}
              onChange={handleChange}
              placeholder="Nome do Cliente"
            />
            <Input
              type="text"
              name="cliente.nomeFantasia"
              value={orderSale.cliente?.nomeFantasia}
              onChange={handleChange}
              placeholder="Nome Fantasia"
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
          <SelectItem value="2">Boleto</SelectItem>
          <SelectItem value="3">Devolução</SelectItem>
          <SelectItem value="4">Cartão de crédito</SelectItem>
          <SelectItem value="5">Cartão de débito</SelectItem>
          <SelectItem value="6">Crediário</SelectItem>
          <SelectItem value="7">Cartão Voucher</SelectItem>
          <SelectItem value="8">PIX</SelectItem>
        </SelectContent>
      </Select>

      <Button type="submit">Finalizar pedido</Button>
    </form>
  );
};

export default PedidoVendaForm;
