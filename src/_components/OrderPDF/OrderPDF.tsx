import { useLocation } from "react-router-dom";

export const PDFPedido = () => {
  const { state } = useLocation();

  console.log(state);

  return (
    <div>
      <div>Impressão dos detalhes do seu pedido</div>
    </div>
  );
};
