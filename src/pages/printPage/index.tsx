import { useZustandContext } from "@/context/cartContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function PrintPage() {
  const { listProductsInCart } = useZustandContext();
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
    navigate("/"); // Navegue de volta para a página inicial após imprimir
    window.location.reload();
  };

  useEffect(() => {
    setTimeout(() => {
      imprimir();
    }, 2000);
  }, []);

  return (
    <div
      id="printableArea"
      className="flex flex-col space-y-3 items-center justify-center p-8 w-full mr-2"
    >
      {listProductsInCart
        .sort((a, b) => a.id_seq - b.id_seq)
        .map((item) => (
          <div
            key={item.id}
            className="flex flex-col w-60 border-2 border-black rounded-lg p-3"
          >
            <div>
              <span className="font-semibold">{item.nome}</span>
            </div>
            <div>
              <span>quantidade: {item.quantity}</span>
            </div>
          </div>
        ))}
    </div>
  );
}
