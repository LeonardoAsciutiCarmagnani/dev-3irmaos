import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/context/authContext";
import { useEffect, useState } from "react";

interface DetailsPropostalProps {
  obs: string;
  payment: string;
  time: string;
  delivery: number;
}

interface IDetailsOrder {
  statusOrder: number;
  propostalValue: number;
  detailsPropostal?: DetailsPropostalProps;
  getAllData: (
    obs: string,
    payment: string,
    time: string,
    delivery: number
  ) => void;
}

const DetailsOrder = ({
  statusOrder,
  propostalValue,
  getAllData,
  detailsPropostal,
}: IDetailsOrder) => {
  const { user } = useAuthStore();

  const [description, setDescription] = useState(
    detailsPropostal?.obs ? detailsPropostal.obs : ""
  );
  const [paymentMethod, setPaymentMethod] = useState(
    detailsPropostal?.payment ? detailsPropostal.payment : ""
  );
  const [deliveryTime, setDeliveryTime] = useState(
    detailsPropostal?.time ? detailsPropostal?.time : ""
  );
  const [deliveryValue, setDeliveryValue] = useState(
    detailsPropostal?.delivery ? detailsPropostal?.delivery : 0
  );
  const [total, setTotal] = useState(propostalValue);

  useEffect(() => {
    setTotal(propostalValue + deliveryValue);
    getAllData(description, paymentMethod, deliveryTime, deliveryValue);
  }, [
    propostalValue,
    description,
    paymentMethod,
    deliveryTime,
    deliveryValue,
    getAllData,
  ]);

  return (
    <div>
      {user?.role === "client" && (
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
                  id="observacoes"
                  disabled={statusOrder > 1}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                  className="bg-white"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="pagamento" className="font-semibold">
                  Forma de pagamento:
                </label>
                <Input
                  id="pagamento"
                  disabled={statusOrder > 1}
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                  }}
                  className="bg-white"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="prazo" className="font-semibold">
                  Prazo de entrega:
                </label>
                <Input
                  id="prazo"
                  disabled={statusOrder > 1}
                  value={deliveryTime}
                  onChange={(e) => {
                    setDeliveryTime(e.target.value);
                  }}
                  className="bg-white"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label htmlFor="frete" className="font-semibold">
                  Frete:
                </label>
                <Input
                  placeholder="insira o valor de frete"
                  id="frete"
                  disabled={statusOrder > 1}
                  value={deliveryValue}
                  onChange={(e) => setDeliveryValue(Number(e.target.value))}
                  className="bg-white"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      <div className="flex flex-col w-full h-full bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Detalhes do Pedido</h2>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col items-center justify-between  max-w-full  text-wrap">
            <span className="text-gray-700 font-semibold">Observações:</span>
            <p className="w-2/4 text-gray-700 text-start whitespace-pre-wrap break-words">
              {description === "" ? "Sem observações" : description}
            </p>
          </div>
          <div className="flex flex-col items-center justify-between">
            <div className="flex flex-col">
              <span className="text-gray-700 font-semibold">
                Facilidade no pagamento e agilidade na entrega:
              </span>
              <span className="font-semibold">
                Forma de pagamento: {paymentMethod}
              </span>
              <span className="font-semibold">
                Prazo de entrega: {deliveryTime}
              </span>
              <span className="font-semibold">
                Frete:{" "}
                {deliveryValue.toLocaleString("pt-BR", {
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
