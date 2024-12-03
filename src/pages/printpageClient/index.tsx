import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  // const navigate = useNavigate();
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
        return (acc += item.preco * item.quantidade);
      }
      return acc;
    }, 0);

    setTotalValue(setTotal);
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
  let hasPrinted = false;

  const imprimir = () => {
    if (hasPrinted) return; // Prevenindo loop infinito
    hasPrinted = true;

    const printContentElement = document.getElementById("printableArea");
    if (!printContentElement) {
      console.error("Elemento printableArea não encontrado");
      return;
    }
    const printContent = printContentElement.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
  };

  const formalizedDate = format(user.date, "dd/MM/yyyy 'ás' HH:mm:ss");

  useEffect(() => {
    handleCountCategory();
    handleTotalValue();
    handleGetPhoneUser();
    setTimeout(() => {
      imprimir();
    }, 2000);
  }, []);

  return (
    <>
      <>
        <div
          id="printableArea"
          className="flex flex-col space-y-3 items-start justify-start w-screen "
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
            <span className="font-bold text-lg">PEDIDO Nº {orderNumber}</span>
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
                    className="flex flex-col border-r-2 border-black mb-4 "
                  >
                    <div className="border-b-2 border-black grid grid-cols-4 mb-4">
                      <span className="font-semibold text-lg col-span-2">
                        {categoria}
                      </span>
                      <span className="font-semibold text-center ">Qtd</span>
                      <span className="font-semibold text-center">
                        Valor Un
                      </span>
                    </div>
                    {data.itens.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-4  justify-between"
                      >
                        <span className="text-sm text-start col-span-2">
                          {item.nome}
                        </span>
                        <span className=" text-center col-span-1">
                          {item.quantidade}
                        </span>
                        <span className="text-center col-span-1">
                          {item.preco}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
            <span className="border-t-2 border-black text-end font-semibold">
              Valor total:{" "}
              {totalValue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
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
      <Link to="/get-orders-client" className="border-2 rounded-lg p-2">
        Voltar
      </Link>
    </>
  );
}
