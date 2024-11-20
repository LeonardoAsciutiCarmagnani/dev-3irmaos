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
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { firestore } from "@/firebaseConfig";

export type EnderecoDeEntrega = {
  bairro: string;
  cep: string;
  codigoIbge: number;
  complemento: string;
  logradouro: string;
  numero: string;
};

export type ProductInPriceList = {
  id: string;
  name: string;
  value: number;
};

interface ItensProps {
  quantidade: number;
  preco: number;
  precoUnitarioLiquido?: number;
}

const PedidoVendaForm: React.FC = () => {
  const orderCreationDate = format(new Date(), "yyyy/MM/dd HH:mm:ss");

  const [orderSale, setOrderSale] = useState<OrderSaleTypes>({
    order_code: 0,
    status_order: 1,
    created_at: orderCreationDate,
    updated_at: orderCreationDate,
    cliente: {
      documento: "05.709.957/0001-25",
      email: "",
      inscricaoEstadual: "",
      nomeDoCliente: "",
      nomeFantasia: "",
    },
    enderecoDeCobranca: {
      bairro: "",
      cep: "",
      codigoIbge: 1234567,
      complemento: "",
      logradouro: "",
      numero: 0,
    },
    enderecoDeEntrega: {
      bairro: "",
      cep: "",
      codigoIbge: 1234567,
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

  const { totalValue, listProductsInCart } = useZustandContext();
  const { toastSuccess } = ToastNotifications();
  const navigate = useNavigate();

  useEffect(() => {
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

      orderSale.order_code = newOrderNumber;

      const includingIdInProduct: ItensProps[] = listProductsInCart.map(
        (item) => {
          return {
            ...item,
            produtoId: item.id,
          };
        }
      );

      if (orderSale.itens) {
        orderSale.itens = includingIdInProduct;
      }
    };

    fetchLastOrders();
  }, []);

  const handlePaymentMethod = (paymentMethod: string) => {
    let paymentObject: {
      idMeioDePagamento: number;
      parcelas: number;
      valor: number;
    };
    if (paymentMethod === "1") {
      paymentObject = {
        idMeioDePagamento: 1,
        parcelas: 1,
        valor: totalValue,
      };
      console.log(paymentObject);
      orderSale.meiosDePagamento.push({
        idMeioDePagamento: paymentObject.idMeioDePagamento,
        parcelas: paymentObject.parcelas,
        valor: paymentObject.valor,
      });
      console.log(orderSale.meiosDePagamento);
      return paymentObject;
    } else if (paymentMethod === "2") {
      paymentObject = {
        idMeioDePagamento: 2,
        parcelas: 1,
        valor: totalValue,
      };
      orderSale.meiosDePagamento.push({
        idMeioDePagamento: paymentObject.idMeioDePagamento,
        parcelas: paymentObject.parcelas,
        valor: paymentObject.valor,
      });
      return paymentObject;
    } else if (paymentMethod === "3") {
      paymentObject = {
        idMeioDePagamento: 3,
        parcelas: 1,
        valor: totalValue,
      };
      orderSale.meiosDePagamento.push({
        idMeioDePagamento: paymentObject.idMeioDePagamento,
        parcelas: paymentObject.parcelas,
        valor: paymentObject.valor,
      });
      return paymentObject;
    } else {
      paymentObject = {
        idMeioDePagamento: 4,
        parcelas: 1,
        valor: totalValue,
      };
      orderSale.meiosDePagamento.push({
        idMeioDePagamento: paymentObject.idMeioDePagamento,
        parcelas: paymentObject.parcelas,
        valor: paymentObject.valor,
      });
      return paymentObject;
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
          <SelectItem value="2">Cheque</SelectItem>
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
