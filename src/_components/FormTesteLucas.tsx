import React, { useState } from "react";
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

const PedidoVendaForm: React.FC = () => {
  const [form, setForm] = useState<Form>({
    cliente: {
      documento: "12345678901",
      email: "lasciuti@multipoint.com.br",
      inscricaoEstadual: "",
      nomeDoCliente: "Leonardo",
      nomeFantasia: "",
    },
    enderecoDeCobranca: {
      bairro: "Centro",
      cep: "88351001",
      codigoIbge: 4202909,
      complemento: "",
      logradouro: "Rua Principal",
      numero: "01",
    },
    enderecoDeEntrega: {
      bairro: "Centro",
      cep: "88351001",
      codigoIbge: 4202909,
      complemento: "Sala 2",
      logradouro: "Rua Principal",
      numero: "22",
    },
    itens: [
      {
        produtoId: "c343676f-25b2-4bd7-923b-2c35c6da53c9",
        quantidade: 3,
        precoUnitarioBruto: 15.99,
        precoUnitarioLiquido: 15.99,
      },
    ],
    meiosDePagamento: [
      {
        idMeioDePagamento: 1,
        parcelas: 1,
        valor: 99.99,
      },
    ],
    numeroPedidoDeVenda: "APP01",
    observacaoDoPedidoDeVenda: "",
    valorDoFrete: 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [section, key] = name.split(".");

    setForm((prev) => {
      const sectionValue = prev[section as keyof Form];
      if (
        !(section in prev) ||
        typeof sectionValue !== "object" ||
        sectionValue === null
      ) {
        return prev;
      }

      if (Array.isArray(sectionValue)) {
        const match = key.match(/\[(\d+)\]/);
        const index = match ? parseInt(match[1], 10) : 0;
        const field = key.split("]")[1].slice(1);

        const updatedArray = sectionValue.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        );
        return {
          ...prev,
          [section]: updatedArray,
        };
      }

      // Caso não seja um array, trata como objeto
      return {
        ...prev,
        [section]: {
          ...sectionValue,
          [key]: value,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("JSON a ser enviado:", JSON.stringify(form));
    const userId = "5juuHVSxz2iZ2Mfls9GN";
    try {
      const response = await axios.post(
        `https://us-central1-server-kyoto.cloudfunctions.net/api/v1/pedido-de-venda/${userId}`,
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
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col  w-full">
      <Accordion type="multiple">
        <AccordionItem value="item-1" className="w-full">
          <AccordionTrigger>
            <h2>Cliente</h2>
          </AccordionTrigger>
          <AccordionContent>
            <Input
              type="text"
              name="cliente.documento"
              value={form.cliente.documento}
              onChange={handleChange}
              placeholder="Documento"
            />
            <Input
              type="email"
              name="cliente.email"
              value={form.cliente.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <Input
              type="text"
              name="cliente.inscricaoEstadual"
              value={form.cliente.inscricaoEstadual}
              onChange={handleChange}
              placeholder="Inscrição Estadual"
            />
            <Input
              type="text"
              name="cliente.nomeDoCliente"
              value={form.cliente.nomeDoCliente}
              onChange={handleChange}
              placeholder="Nome do Cliente"
            />
            <Input
              type="text"
              name="cliente.nomeFantasia"
              value={form.cliente.nomeFantasia}
              onChange={handleChange}
              placeholder="Nome Fantasia"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="w-full">
          <AccordionTrigger>
            <h2>Endereço de Cobrança</h2>
          </AccordionTrigger>
          <AccordionContent>
            <Input
              type="text"
              name="enderecoDeCobranca.bairro"
              value={form.enderecoDeCobranca.bairro}
              onChange={handleChange}
              placeholder="Bairro"
            />
            <Input
              type="text"
              name="enderecoDeCobranca.cep"
              value={form.enderecoDeCobranca.cep}
              onChange={handleChange}
              placeholder="CEP"
            />
            <Input
              type="text"
              name="enderecoDeCobranca.codigoIbge"
              value={form.enderecoDeCobranca.codigoIbge.toString()}
              onChange={handleChange}
              placeholder="Código IBGE"
            />
            <Input
              type="text"
              name="enderecoDeCobranca.complemento"
              value={form.enderecoDeCobranca.complemento}
              onChange={handleChange}
              placeholder="Complemento"
            />
            <Input
              type="text"
              name="enderecoDeCobranca.logradouro"
              value={form.enderecoDeCobranca.logradouro}
              onChange={handleChange}
              placeholder="Logradouro"
            />
            <Input
              type="text"
              name="enderecoDeCobranca.numero"
              value={form.enderecoDeCobranca.numero}
              onChange={handleChange}
              placeholder="Número"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="w-full">
          <AccordionTrigger>
            <h2>Endereço de Entrega</h2>
          </AccordionTrigger>
          <AccordionContent>
            <Input
              type="text"
              name="enderecoDeEntrega.bairro"
              value={form.enderecoDeEntrega.bairro}
              onChange={handleChange}
              placeholder="Bairro"
            />
            <Input
              type="text"
              name="enderecoDeEntrega.cep"
              value={form.enderecoDeEntrega.cep}
              onChange={handleChange}
              placeholder="CEP"
            />
            <Input
              type="text"
              name="enderecoDeEntrega.codigoIbge"
              value={form.enderecoDeEntrega.codigoIbge.toString()}
              onChange={handleChange}
              placeholder="Código IBGE"
            />
            <Input
              type="text"
              name="enderecoDeEntrega.complemento"
              value={form.enderecoDeEntrega.complemento}
              onChange={handleChange}
              placeholder="Complemento"
            />
            <Input
              type="text"
              name="enderecoDeEntrega.logradouro"
              value={form.enderecoDeEntrega.logradouro}
              onChange={handleChange}
              placeholder="Logradouro"
            />
            <Input
              type="text"
              name="enderecoDeEntrega.numero"
              value={form.enderecoDeEntrega.numero}
              onChange={handleChange}
              placeholder="Número"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Select required>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Método de pagamento:" />
        </SelectTrigger>
        <SelectContent
          onChange={(e) => {
            const newValue = e;

            /* Set no estado */
            console.log(newValue);
          }}
        >
          <SelectItem value="1">Dinheiro</SelectItem>
          <SelectItem value="2">Cartão de Débito</SelectItem>
          <SelectItem value="3">Cartão de Crédito</SelectItem>
          <SelectItem value="4">PIX</SelectItem>
        </SelectContent>
      </Select>

      <Button type="submit">Finalizar pedido</Button>
    </form>
  );
};

export default PedidoVendaForm;
