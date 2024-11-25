import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { format } from "date-fns";
import logo from "../../assets/logo.png";

interface PrintItem {
  produtoId: string;
  nome?: string;
  preco?: number;
  quantidade: number;
  precoUnitarioBruto: number;
  precoUnitarioLiquido: number;
  id_seq: number;
}

export default function PrintPage() {
  const location = useLocation();
  const { arrayForPrint }: { arrayForPrint: PrintItem[] } = location.state;
  const { user } = location.state;

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

  useEffect(() => {
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
      <div className="flex flex-col space-y-3 items-center justify-center p-8 ">
        <img src={logo} alt="Logo Kyoto" className="rounded-full size-36" />
        <div className="flex flex-col w-96 border-2 border-black rounded-lg p-3 ">
          <span>Cliente: {user.userName}</span>
          <span>email: {user.userEmail}</span>
          <span>Data do pedido: {formalizedDate}</span>
        </div>

        {arrayForPrint
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
          ))}
      </div>
    </div>
  );
}
