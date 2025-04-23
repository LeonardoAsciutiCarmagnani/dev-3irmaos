import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

interface IDetailsOrder {
  propostalValue: number;
  getTotalValue: (total: number) => void;
}

const DetailsOrder = ({ propostalValue, getTotalValue }: IDetailsOrder) => {
  const [observacoes, setObservacoes] = useState("");
  const [formaDePagamento, setformaDePagamento] = useState("");
  const [entrega, setEntrega] = useState("");
  const [frete, setFrete] = useState(0);
  const [total, setTotal] = useState(propostalValue);

  useEffect(() => {
    setTotal(propostalValue + frete);
    getTotalValue(total);
  }, [propostalValue, frete, total, getTotalValue]);

  return (
    <div>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg">
            Informar detalhes da proposta
          </AccordionTrigger>
          <AccordionContent className="flex flex-col space-y-2">
            <div className="flex flex-col gap-2 w-1/2">
              <label htmlFor="observacoes" className="font-semibold">
                Observações:
              </label>
              <Textarea
                placeholder="Observações da proposta"
                id="observacoes"
                onChange={(e) => {
                  setObservacoes(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label htmlFor="pagamento" className="font-semibold">
                Forma de pagamento:
              </label>
              <Input
                placeholder="Forma de pagamento"
                id="pagamento"
                onChange={(e) => {
                  setformaDePagamento(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label htmlFor="prazo" className="font-semibold">
                Prazo de entrega:
              </label>
              <Input
                placeholder="Prazo de entrega"
                id="prazo"
                onChange={(e) => {
                  setEntrega(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label htmlFor="frete" className="font-semibold">
                Frete:
              </label>
              <Input
                placeholder="insira o valor de frete"
                id="frete"
                onChange={(e) => setFrete(Number(e.target.value))}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex flex-col w-full h-full bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Detalhes do Pedido</h2>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col items-center justify-between  max-w-full text-wrap">
            <span className="text-gray-700 font-semibold">Observações:</span>
            <span className="w-full text-gray-700 text-wrap break-words text-center">
              {" "}
              {observacoes === "" ? "Sem observações" : observacoes}
            </span>
          </div>
          <div className="flex flex-col items-center justify-between">
            <div className="flex flex-col">
              <span className="text-gray-700 font-semibold">
                Facilidade no pagamento e agilidade na entrega:
              </span>
              <span className="font-semibold">
                Forma de pagamento: {formaDePagamento}
              </span>
              <span className="font-semibold">Prazo de entrega: {entrega}</span>
              <span className="font-semibold">
                Frete:{" "}
                {frete.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
              <span className="font-semibold">
                Valor final:{" "}
                {total.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}{" "}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between">
            <span className="text-gray-700 font-bold text-lg">
              Por que escolher a 3 Irmãos Arte em Madeira de Demolição ?
            </span>
            <div className="">
              <li>
                Mais de 40 anos de experiência, garantindo qualidade e
                compromisso.
              </li>
              <li>Madeira nobre e sustentável, com excelente durabilidade.</li>
              <li>Acabamento exclusivo, agregando valor ao seu imóvel.</li>
              <li>
                {" "}
                Atendimento especializado, acompanhando cada etapa do seu
                projeto.
              </li>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between">
            <span className="text-gray-700">
              {" "}
              Vamos conversar e alinhar os próximos passos?
            </span>
            <span className="font-semibold">(11) 94592-6335</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsOrder;
