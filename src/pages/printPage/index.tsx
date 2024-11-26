import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import logo from "../../assets/logo.png";

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

interface CategoryProps {
  Tradicionais: number;
  Especiais: number;
}

export default function PrintPage() {
  const location = useLocation();
  const { arrayForPrint }: { arrayForPrint: PrintItem[] } = location.state;
  const { user, type } = location.state;
  const [countCategory, setCountCategory] = useState<CategoryProps>();

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
    const categoryCounts = arrayForPrint.reduce((acc, item) => {
      const categoria = item.categoria;
      if (item.categoria) {
        acc[categoria] = (acc[categoria] || 0) + 1;
      }
      console.log(acc);
      return acc;
    }, {});
    console.log(categoryCounts);
    console.log(arrayForPrint);

    setCountCategory({
      Tradicionais: categoryCounts.TRADICIONAIS,
      Especiais: categoryCounts.ESPECIAIS,
    });
  };

  useEffect(() => {
    handleCountCategory();

    setTimeout(() => {
      imprimir();
    }, 2000);
  }, []);

  const formalizedDate = format(user.date, "dd/MM/yyyy 'ás' HH:mm:ss");

  return (
    <div
      id="printableArea"
      className="flex flex-col space-y-3 items-center justify-center p-8 w-full "
    >
      {type === "A4" ? (
        <>
          <div className="flex flex-col space-y-3 items-center justify-center  w-screen">
            <div className="flex w-full   justify-center">
              <div>
                {" "}
                <img
                  src={logo}
                  alt="Logo Kyoto"
                  className="rounded-full size-36"
                />
              </div>
              <div className="flex flex-col  rounded-lg p-3 items-end flex-1 text-center justify-center">
                <span className="font-bold text-lg">C. M. L. MATIAS</span>
                <span className="font-bold text-lg">
                  CNPJ: 28.068.016/0001-55
                </span>
                <span className="font-bold text-lg">
                  RUA FREI MONT'ALVERNE Nº216 - SP CEP: 03.505-030
                </span>
              </div>
            </div>
            <div className="flex flex-col w-96 rounded-lg p-3  flex-1 text-center justify-center">
              <div className="gap-2">
                <span className="font-bold">Cliente:</span>
                <span>{user.userName}</span>
              </div>
              <div className="gap-2">
                <span className="font-bold">email:</span>{" "}
                <span>{user.userEmail}</span>
              </div>
              <div className="gap-2">
                <span className="font-bold">Data do pedido:</span>{" "}
                <span>{formalizedDate}</span>
              </div>
            </div>

            <div className="border-2 w-[700px] border-black rounded-lg p-3">
              {arrayForPrint
                .sort((a, b) => (a.id_seq ?? 0) - (b.id_seq ?? 0))
                .map((item) => (
                  <div
                    key={item.id_seq}
                    className="grid grid-cols-3  gap-2 w-full justify-around text-center  "
                  >
                    <div>
                      <span className="font-semibold">{item.nome}</span>
                    </div>
                    <div>
                      <span>quantidade: {item.quantidade}</span>
                    </div>
                    <div>
                      <span>Categoria: {item.categoria}</span>
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex flex-col">
              <span className="font-bold">
                Total Tradicionais: {countCategory?.Tradicionais}
              </span>
              <span className="font-bold">
                Total Especiais: {countCategory?.Especiais}
              </span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col space-y-3 items-center justify-center p-8 ">
            <img src={logo} alt="Logo Kyoto" className="rounded-full size-36" />
            {/*  <div className="flex flex-col w-96 border-2 border-black rounded-lg p-3 ">
              <span>Cliente: {user.userName}</span>
              <span>email: {user.userEmail}</span>
              <span>Data do pedido: {formalizedDate}</span>
            </div> */}

            {/*  {arrayForPrint
              .sort((a, b) => (a.id_seq ?? 0) - (b.id_seq ?? 0))
              .map((item) => (
                <div
                  key={item.id_seq}
                  className="flex flex-col w-96 border-2 border-black rounded-lg p-3"
                >
                  <div>
                    <span className="font-semibold">{item.nome}</span>
                  </div>
                  <div>
                    <span>quantidade: {item.quantidade}</span>
                  </div>
                </div>
              ))} */}
          </div>
        </>
      )}
    </div>
  );
}
