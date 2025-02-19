interface PedidoProps {
  item: string;
  quantidade: string;
  preco: number;
}

const Pedido = (pedido: PedidoProps) => {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      console.error("Erro ao obter o printWindow");
      return;
    }
    printWindow.document.write(
      "<html><head><title>Pedido</title></head><body>"
    );
    printWindow.document.write(`
      <h1>Seu Pedido</h1>
      <p>Item: ${pedido.item}</p>
      <p>Quantidade: ${pedido.quantidade}</p>
      <p>Preço: ${pedido.preco}</p>
    `);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div>
      <h1>Seu Pedido</h1>
      <p>Item: {pedido.item}</p>
      <p>Quantidade: {pedido.quantidade}</p>
      <p>Preço: {pedido.preco}</p>
      <button onClick={handlePrint}>Imprimir Pedido</button>
    </div>
  );
};

export default Pedido;
