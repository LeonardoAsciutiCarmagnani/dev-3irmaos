/* eslint-disable react-hooks/exhaustive-deps */
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import logo from "../../assets/logo.png";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebaseConfig";

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

export default function PrintPage() {
  const location = useLocation();
  const { arrayForPrint }: { arrayForPrint: PrintItem[] } = location.state;
  const { user, type, orderNumber } = location.state;
  const [userPhone, setUserPhone] = useState("");

  const [countCategory, setCountCategory] = useState<{
    categoryData: Record<
      string,
      { itens: { nome: string; quantidade: number }[]; total: number }
    >;
    totais: Record<string, number>;
  }>({
    categoryData: {}, // Objeto vazio para categorias
    totais: { "TOTAL GERAL": 0 }, // Inicializado com total geral 0
  });

  const navigate = useNavigate();
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
    navigate("/get-orders"); // Navegue de volta para a página inicial após imprimir
    window.location.reload();
  };

  const handleCountCategory = () => {
    const categoryData = arrayForPrint.reduce<{
      [key: string]: {
        itens: { nome: string; quantidade: number }[];
        total: number;
      };
    }>((acc, item) => {
      const {
        categoria = "Sem Categoria",
        nome = "Item Desconhecido",
        quantidade,
      } = item;

      if (!acc[categoria]) {
        acc[categoria] = { itens: [], total: 0 };
      }

      acc[categoria].itens.push({ nome, quantidade });
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
    handleGetPhoneUser();
    console.log(countCategory);
    setTimeout(() => {
      imprimir();
    }, 2000);
  }, []);

  const formalizedDate = format(user.date, "dd/MM/yyyy 'ás' HH:mm:ss");

  return (
    <>
      {type === "A4" ? (
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
                <span className="text-sm">
                  RUA FREI MONT'ALVERNE Nº216 - SP
                </span>
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
              <span className="font-bold text-lg">
                PEDIDO Nº: {orderNumber}
              </span>
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
                      <div className="border-b-2 border-black flex justify-between w-full mb-4">
                        <span className="font-semibold text-lg">
                          {categoria}
                        </span>
                        <span className="font-semibold mr-1">Quantidade</span>
                      </div>
                      {data.itens.map((item, index) => (
                        <div key={index} className="flex  justify-between">
                          <span>{item.nome}</span>
                          <span className="w-20 text-center ">
                            {item.quantidade}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                )}
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
      ) : (
        <div id="printableArea">
          <div className="flex flex-col space-y-1 items-center justify-center p-8 ">
            <img src={logo} alt="Logo Kyoto" className="rounded-full size-28" />
            <div className="flex flex-col text-sm rounded-lg p-3 items-center flex-1 text-center justify-center">
              <span className="font-bold text-base">C. M. L. MATIAS</span>
              <span className="font-bold text-base">
                CNPJ: 28.068.016/0001-55
              </span>
              <span className="font-bold text-sm">
                RUA FREI MONT'ALVERNE Nº216 - SP CEP: 03.505-030
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-bold text-lg">
                PEDIDO Nº: {orderNumber}
              </span>
              <div className="gap-2">
                <span className="font-bold text-lg">Data do pedido:</span>{" "}
                <span>{formalizedDate}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 w-96  p-3 text-start justify-start border-t-2 border-b-2 border-black">
              <div className="text-sm">
                <div className="flex flex-col">
                  <span className="font-bold">Nome / Razão Social:</span>
                  <span>{user.userName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">CNPJ / CPF:</span>
                  <span>
                    {user.document ? (
                      <>{user.document}</>
                    ) : (
                      <> não informado !</>
                    )}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Responsável:</span>
                  <span>{user.userName}</span>
                </div>
              </div>
              <div className="flex flex-col text-sm">
                <div className="gap-2 ">
                  <span className="font-bold">Telefone:</span>{" "}
                  <span>{userPhone}</span>
                </div>
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

            <div className="flex flex-col">
              <span className="text-lg font-bold">ITENS DO PEDIDO</span>
            </div>

            <div className="flex flex-col w-96 border-t-2 border-b-2 border-black  p-3">
              {Object.entries(countCategory.categoryData || {}).map(
                ([categoria, data]) => (
                  <div key={categoria} className="flex flex-col mb-4">
                    <div className="border-b-2 border-black flex justify-between w-full mb-4">
                      <span className="font-semibold text-lg">{categoria}</span>
                      <span className="font-semibold ">Quantidade</span>
                    </div>
                    {data.itens.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.nome}</span>
                        <span>{item.quantidade}</span>
                      </div>
                    ))}
                  </div>
                )
              )}
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
        </div>
      )}
    </>
  );
}
