/* eslint-disable react-hooks/exhaustive-deps */
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { firestore } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

import logo from "../../assets/logo.png";
import { format } from "date-fns";

interface PrintItem {
  produtoId: string;
  nome?: string;
  preco?: number;
  categoria?: string;
  quantidade: number;
  precoUnitarioBruto: number;
  precoUnitarioLiquido: number;
  id_seq: number;
}

export default function PrintPageClient() {
  const location = useLocation();
  const navigate = useNavigate();
  // const { setIsMobile, isMobile } = useZustandContext();
  const { arrayForPrint }: { arrayForPrint: PrintItem[] } = location.state;
  const { user, orderNumber } = location.state;
  const [userPhone, setUserPhone] = useState("");
  const [totalValue, setTotalValue] = useState(0);

  const [countCategory, setCountCategory] = useState<{
    categoryData: Record<
      string,
      {
        itens: { nome: string; quantidade: number; preco: number }[];
        total: number;
      }
    >;
    totais: Record<string, number>;
  }>({
    categoryData: {}, // Objeto vazio para categorias
    totais: { "TOTAL GERAL": 0 }, // Inicializado com total geral 0
  });

  const imprimir = () => {
    setTimeout(() => {}, 2000);
    const printContentElement = document.getElementById("printableArea");
    if (!printContentElement) {
      console.error("Elemento printableArea não encontrado");
      return;
    }

    html2canvas(printContentElement, { scale: 2, x: -50 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const zoomFactor = 2.4; // Fator de zoom (150% do tamanho original)

      const newWidth = pdfWidth * zoomFactor;
      const newHeight = (canvas.height * newWidth) / canvas.width;

      let yOffset = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      while (yOffset < newHeight) {
        pdf.addImage(imgData, "PNG", 0, -yOffset, newWidth, newHeight);
        yOffset += pageHeight;
        if (yOffset < newHeight) pdf.addPage();
      }

      pdf.save(`Pedido-${orderNumber}.pdf`);
      navigate("/get-orders-client");
    });
  };

  const handleCountCategory = () => {
    const categoryData = arrayForPrint.reduce<{
      [key: string]: {
        itens: { nome: string; quantidade: number; preco: number }[];
        total: number;
      };
    }>((acc, item) => {
      const {
        categoria = "Sem Categoria",
        nome = "Item Desconhecido",
        quantidade,
        preco = 0,
      } = item;

      if (!acc[categoria]) {
        acc[categoria] = { itens: [], total: 0 };
      }

      acc[categoria].itens.push({ nome, quantidade, preco });
      acc[categoria].total += quantidade;

      return acc;
    }, {});

    // Ajusta a tipagem para incluir chaves dinâmicas
    const totais = Object.keys(categoryData).reduce<Record<string, number>>(
      (acc, categoria) => {
        acc[categoria] = categoryData[categoria].total;

        // Inicializa ou soma o total geral
        acc["TOTAL GERAL"] =
          (acc["TOTAL GERAL"] || 0) + categoryData[categoria].total;

        return acc;
      },
      {} // Inicializa o objeto vazio
    );

    setCountCategory({ categoryData, totais });
  };

  const handleTotalValue = () => {
    // Inicialize o reduce corretamente
    const setTotal = arrayForPrint.reduce((acc, item) => {
      if (item.preco && item.quantidade) {
        console.log((acc += item.preco * item.quantidade));
        return acc;
      }
      return acc; // Retorna o acumulador mesmo se a condição não for atendida
    }, 0); // Valor inicial do acumulador

    setTotalValue(setTotal); // Atribua o valor total
    console.log("valor total: ", totalValue);
  };

  const handleGetPhoneUser = async () => {
    const docRef = doc(firestore, "clients", user.IdClient);
    const phone = await getDoc(docRef);
    const data = phone.data();

    if (data) {
      setUserPhone(data.user_phone);
    }
    console.log(userPhone);
  };

  useEffect(() => {
    handleCountCategory();
    handleTotalValue();
    handleGetPhoneUser();
    setTimeout(() => {
      imprimir();
    }, 2000);
  }, []);

  const formalizedDate = format(user.date, "dd/MM/yyyy 'ás' HH:mm:ss");

  return (
    <>
      <>
        <div
          id="printableArea"
          className="flex flex-col space-y-3 items-start justify-start w-screen h-screen"
        >
          <div className="flex w-full  items-center justify-start">
            <div>
              {" "}
              <img
                src={logo}
                alt="Logo Kyoto"
                className="rounded-full size-28"
              />
            </div>
            <div className="flex flex-col  rounded-lg p-3 items-start justify-start">
              <span className="font-bold ">PASTEIS KYOTO</span>
              <span className="text-sm">C. M. L. MATIAS</span>
              <span className="text-sm">CNPJ: 28.068.016/0001-55</span>
              <span className="text-sm">RUA FREI MONT'ALVERNE Nº216 - SP</span>
              <span>CEP: 03.505-030</span>
            </div>
            <div className="flex flex-col p-3 text-start justify-start text-sm ">
              <div>
                <div className="gap-2">
                  <span className="font-bold">Nome / Razão Social:</span>{" "}
                  <span>{user.userName}</span>
                </div>
                <div className="gap-2">
                  <span className="font-bold">CNPJ / CPF:</span>{" "}
                  <span>
                    {user.document ? (
                      <>{user.document}</>
                    ) : (
                      <> não informado !</>
                    )}
                  </span>
                </div>
                <div className="gap-2">
                  <span className="font-bold">Responsável:</span>{" "}
                  <span>{user.userName}</span>
                </div>
                <div className="gap-2">
                  <span className="font-bold">Telefone:</span>{" "}
                  <span>{userPhone}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="gap-2">
                  <span className="font-bold">IE:</span>{" "}
                  <span>
                    {user.userIE ? <>{user.userIE}</> : <> não informado</>}
                  </span>
                </div>
                <div className="gap-2">
                  <span className="font-bold">Email:</span>{" "}
                  <span>{user.userEmail}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-lg">PEDIDO Nº: {orderNumber}</span>
            <div className="gap-2">
              <span className="font-bold text-lg">Data do pedido:</span>{" "}
              <span>{formalizedDate}</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-bold">ITENS DO PEDIDO</span>
          </div>

          <div className="flex flex-col border-t-2 w-[700px] border-black  py-3">
            <div className="items-start w-full  mb-1 grid grid-cols-2 gap-2">
              {Object.entries(countCategory.categoryData || {}).map(
                ([categoria, data]) => (
                  /* flex flex-col */
                  <div
                    key={categoria}
                    className="flex flex-col border-l-2 border-r-2 border-black mb-4 "
                  >
                    <div className="border-b-2 border-black grid grid-cols-4 p-2 gap-2 items-center text-center w-full mb-4">
                      <span className="font-semibold text-lg col-span-2">
                        {categoria}
                      </span>
                      <span className="font-semibold mr-1">Qtd</span>
                      <span className="font-semibold mr-1">Valor Un</span>
                    </div>
                    {data.itens.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-4 justify-between p-1"
                      >
                        <span className="col-span-2  text-sm">{item.nome}</span>
                        <span className="w-20 text-center text-sm">
                          {item.quantidade}
                        </span>
                        <span className="text-center">
                          R$ {item.preco.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
            <div className="border-t-2 border-black">
              <span className="font-semibold">Valor total do pedido: </span>
              <span>
                {totalValue.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          </div>
          {/*  {countCategory?.totais && (
              <div className="border-2 w-80 border-black">
                {Object.keys(countCategory.totais).map((categoria) =>
                  categoria !== "TOTAL GERAL" ? (
                    <div key={categoria} className="w-80 p-2">
                      <span className="font-semibold">TOTAL {categoria}</span>:{" "}
                      {countCategory.totais[categoria]}
                    </div>
                  ) : null
                )}
                <div className="w-80 p-2">
                  <span className="font-semibold">TOTAL GERAL:</span>{" "}
                  {countCategory.totais["TOTAL GERAL"]}
                </div>
              </div>
            )} */}
        </div>
      </>
    </>
  );
}
