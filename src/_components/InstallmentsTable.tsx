import { useMemo } from "react";

interface PaymentEntry {
  tipo: "cash" | "installment";
  formaPagamento: string;
  valor: number;
  firstDueDate: Date;
  parcelamento?: number;
  periodo?: string;
}

type ParcelasTableProps = {
  entries: PaymentEntry[];
};

const paymentMethods: Record<string, string> = {
  "1": "Dinheiro",
  "2": "Cheque",
  "3": "Devolução",
  "4": "Cartão de crédito",
  "5": "Cartão de débito",
  "6": "Boleto",
  "7": "Cartão Voucher",
  "8": "PIX",
  "10": "Crédito em loja",
};

const InstallmentsTable = ({ entries }: ParcelasTableProps) => {
  // Função para calcular as datas de vencimento
  const calcularDatas = (
    quantidadeParcelas: number,
    periodo: string,
    firstDueDate: Date
  ) => {
    const datas = [];
    const dataBase = new Date(firstDueDate);
    for (let i = 0; i < quantidadeParcelas; i++) {
      const novaData = new Date(dataBase);
      if (periodo === "mensal") novaData.setMonth(dataBase.getMonth() + i);
      if (periodo === "semanal") novaData.setDate(dataBase.getDate() + i * 7);
      if (periodo === "quinzenal")
        novaData.setDate(dataBase.getDate() + i * 15);
      datas.push(novaData.toLocaleDateString());
    }
    return datas;
  };

  const parcelas = useMemo(() => {
    return entries.flatMap((entry) => {
      if (entry.tipo === "cash") {
        return [
          {
            parcela: 1,
            dataVencimento: new Date(entry.firstDueDate).toLocaleDateString(),
            valor: entry.valor.toFixed(2),
            formaPagamento:
              paymentMethods[entry.formaPagamento] || "Desconhecido",
          },
        ];
      } else {
        const valorParcela = entry.valor / (entry.parcelamento || 1);
        const datas = calcularDatas(
          entry.parcelamento || 1,
          entry.periodo || "mensal",
          entry.firstDueDate
        );
        return datas.map((data, index) => ({
          parcela: index + 1,
          dataVencimento: data,
          valor: valorParcela.toFixed(2),
          formaPagamento:
            paymentMethods[entry.formaPagamento] || "Desconhecido",
        }));
      }
    });
  }, [entries]);

  return (
    <div className="border rounded-lg overflow-hidden flex flex-col max-h-[10.8rem]">
      {/* Header Fixo */}
      <div className="grid grid-cols-7 bg-gray-50 sticky top-0 p-2 border-b">
        <div className="col-span-1 text-xs font-semibold text-gray-600">
          Parcela
        </div>
        <div className="col-span-2 text-center text-xs font-semibold text-gray-600">
          Data de Vencimento
        </div>
        <div className="col-span-2 text-center text-xs font-semibold text-gray-600">
          Valor
        </div>
        <div className="col-span-2 text-center text-xs font-semibold text-gray-600">
          Forma de Pagamento
        </div>
      </div>

      {/* Body com Scroll */}
      <div className="flex-1 overflow-y-auto">
        {parcelas.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-7 items-center hover:bg-gray-50/50 p-2 border-b"
          >
            <div className="col-span-1 text-sm font-medium text-gray-900">
              {item.parcela}
            </div>
            <div className="col-span-2 text-center text-sm text-gray-600">
              {item.dataVencimento}
            </div>
            <div className="col-span-2 text-center text-sm text-gray-600">
              R$ {item.valor}
            </div>
            <div className="col-span-2 text-center text-sm text-gray-600">
              {item.formaPagamento}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstallmentsTable;
