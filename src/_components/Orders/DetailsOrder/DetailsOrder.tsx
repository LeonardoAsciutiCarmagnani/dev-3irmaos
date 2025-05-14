import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/context/authContext";
import { DetailsPropostalProps } from "@/interfaces/Order";
import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask";

interface IDetailsOrder {
  statusOrder: number;
  propostalValue: number;
  detailsPropostal?: DetailsPropostalProps;
  getAllData: (
    obs: string,
    payment: string,
    time: string,
    delivery: number,
    sellectedSeller: { name: string; phone: string; email: string }
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

  const [selectedSeller, setSelectedSeller] = useState({
    name: detailsPropostal?.selectedSeller?.name
      ? detailsPropostal?.selectedSeller?.name
      : "",
    phone: detailsPropostal?.selectedSeller?.phone
      ? detailsPropostal?.selectedSeller?.phone
      : "",
    email: detailsPropostal?.selectedSeller?.email
      ? detailsPropostal?.selectedSeller?.email
      : "",
  });

  const sellersList = [
    {
      name: "Regiane Oliveira",
      phone: "(11) 99592-6335",
      email: "regiane@3irmaosmadeirademolicao.com.br",
    },
    {
      name: "Anderson Santos",
      phone: "(11) 97134-8966",
      email: "anderson@3irmaosmadeirademolicao.com.br",
    },
  ];

  useEffect(() => {
    setTotal(propostalValue + deliveryValue);
    getAllData(
      description,
      paymentMethod,
      deliveryTime,
      deliveryValue,
      selectedSeller
    );
  }, [
    propostalValue,
    description,
    paymentMethod,
    deliveryTime,
    deliveryValue,
    selectedSeller,
    getAllData,
  ]);

  return (
    <div>
      {user?.role !== "admin" && (
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg">
              Informar detalhes da proposta
            </AccordionTrigger>
            <AccordionContent className="flex flex-col space-y-2 ml-2">
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
                <IMaskInput
                  mask="R$ num"
                  blocks={{
                    num: {
                      mask: Number,
                      scale: 2,
                      thousandsSeparator: ".",
                      padFractionalZeros: true,
                      normalizeZeros: true,
                      radix: ",",
                      mapToRadix: ["."],
                    },
                  }}
                  value={String(deliveryValue)}
                  unmask={true} // isso faz com que o valor passado seja numérico
                  disabled={statusOrder > 1}
                  onAccept={(value) => setDeliveryValue(Number(value))}
                  className="border rounded px-2 py-1 w-[8rem] text-right"
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <div
                    className={`${
                      statusOrder > 1 && "pointer-events-none"
                    } border rounded-xs p-2 w-fit font-semibold hover:border-black hover:ring-1 hover:cursor-pointer`}
                  >
                    {selectedSeller.name !== ""
                      ? selectedSeller.name
                      : "Selecione um vendedor"}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="space-y-2">
                  {sellersList.map((seller) => (
                    <div
                      onClick={() => setSelectedSeller(seller)}
                      className="border rounded-xs p-2 w-fit font-semibold hover:border-black hover:ring-1 hover:cursor-pointer"
                    >
                      {seller.name}
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      <div className="flex flex-col w-full h-full  p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col items-start   max-w-full  text-wrap">
            <span className=" font-semibold text-lg">Observações:</span>
            <div className="w-full px-5">
              {description === "" ? (
                <span className="flex w-full justify-start">
                  Sem observações
                </span>
              ) : (
                <p className="flex    text-start whitespace-pre-wrap break-words">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-start justify-between ">
            <span className=" font-semibold text-lg">
              Facilidade no pagamento e agilidade na entrega:
            </span>
            <div className="flex flex-col px-5">
              <li className="">Forma de pagamento: {paymentMethod}</li>
              <li className="">Prazo de entrega: {deliveryTime}</li>
              <li className="">
                Frete:{" "}
                {deliveryValue.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </li>
              <li className="">
                Valor final:{" "}
                {total.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}{" "}
              </li>
            </div>
          </div>
          <div className="flex flex-col items-start justify-between">
            <span className=" font-bold text-lg">
              Por que escolher a 3 Irmãos Arte em Madeira de Demolição ?
            </span>
            <div className="px-5">
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
          <div className="flex flex-col items-start justify-between">
            <span className=" font-semibold">
              {" "}
              Vamos conversar e alinhar os próximos passos?
            </span>
            <span className="font-semibold">Atenciosamente,</span>
            <div className="flex gap-2">
              <span>{selectedSeller?.name}</span>-
              <span>{selectedSeller?.email}</span>
            </div>
            <span className="font-semibold">{selectedSeller?.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsOrder;
