interface IDetailsOrder {
  observacoes: string;
  formaDePagamento: string;
  prazoEntrega: string;
  frete: number;
  total: number;
}

const DetaisOrder = ({
  observacoes,
  formaDePagamento,
  prazoEntrega,
  frete,
  total,
}: IDetailsOrder) => {
  return (
    <div>
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
                Forma de pagamento: {formaDePagamento} , ou, 50% na entrada +
                50% na entrega
              </span>
              <span className="font-semibold">
                Prazo de entrega: {prazoEntrega} dias corridos
              </span>
              <span className="font-semibold">
                Frete:{" "}
                {frete.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}{" "}
                pago ao portador
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

export default DetaisOrder;
