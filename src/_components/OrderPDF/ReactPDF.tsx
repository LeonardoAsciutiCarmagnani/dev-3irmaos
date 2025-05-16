import { Order } from "@/interfaces/Order";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Registra as fontes
pdfMake.vfs = pdfFonts.vfs;

export async function generatePDF({
  id,
  createdAt,
  client,
  deliveryAddress,
  products,
  totalValue,
  totalDiscount,
  discountTotalValue,
  clientImages,
  logoBase64,
}: Order) {
  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const productRows = products.map((item) => {
    const variation = item.selectedVariation?.nomeVariacao || "";
    const total = item.desconto
      ? item.preco * item.quantidade - item.desconto
      : item.preco * item.quantidade;

    return [
      {
        text: `${item.nome}\n${variation} | Altura: ${item.altura}m | Largura: ${item.largura}m`,
        fontSize: 10,
      },
      { text: item.unidade, alignment: "center" },
      { text: `${item.quantidade}x`, alignment: "center" },
      { text: formatCurrency(item.desconto || 0), alignment: "center" },
      { text: formatCurrency(item.preco), alignment: "center" },
      { text: formatCurrency(total), alignment: "center" },
    ];
  });

  const imageBase64List = clientImages.map((img) => ({
    image: img,
    width: 250,
    margin: [0, 10, 0, 10],
  }));

  const docDefinition = {
    content: [
      {
        columns: [
          {
            image: logoBase64,
            width: 150,
          },
          {
            text: [
              { text: "3 IRMÃOS ARTE EM MADEIRA DE DEMOLIÇÃO\n", bold: true },
              "C.N.P.J: 60.272.960/0001-32\n",
              "Rua Madagascar, 330 Jardim Margarida\n",
              "Vargem Grande Paulista / SP - 06739-016\n",
              "Telefone: (11) 94592-6335 / (11) 4159-6680",
            ],
            fontSize: 10,
            alignment: "right",
          },
        ],
      },
      { text: `\nProposta Comercial ${id}`, style: "header" },
      { text: `Data: ${createdAt}`, alignment: "right", margin: [0, 0, 0, 10] },
      {
        text: `Prezada(o), ${client.name}.\nObrigado pelo interesse na 3 Irmãos. Trabalhamos com madeira de demolição nobre, com peças feitas sob medida e acabamento artesanal. Abaixo seguem os detalhes do orçamento solicitado. Qualquer ajuste, é só me chamar.`,
        margin: [0, 0, 0, 10],
        fontSize: 10,
      },
      {
        columns: [
          [
            { text: `Cliente: ${client.name}`, fontSize: 10 },
            { text: `Email: ${client.email}`, fontSize: 10 },
            { text: `Telefone: ${client.phone}`, fontSize: 10 },
          ],
          [
            { text: `Rua: ${deliveryAddress.street}`, fontSize: 10 },
            { text: `Bairro: ${deliveryAddress.neighborhood}`, fontSize: 10 },
            {
              text: `Cidade: ${deliveryAddress.city} / ${deliveryAddress.state}`,
              fontSize: 10,
            },
            { text: `CEP: ${deliveryAddress.cep}`, fontSize: 10 },
          ],
        ],
        columnGap: 30,
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: "Produto", bold: true },
              { text: "Un", bold: true },
              { text: "Qtd", bold: true },
              { text: "Desconto", bold: true },
              { text: "Valor unitário", bold: true },
              { text: "Valor total", bold: true },
            ],
            ...productRows,
            [
              { text: "Total:", colSpan: 5, alignment: "right", bold: true },
              {},
              {},
              {},
              {},
              { text: formatCurrency(totalValue), bold: true },
            ],
            [
              {
                text: "Desconto total:",
                colSpan: 5,
                alignment: "right",
                bold: true,
              },
              {},
              {},
              {},
              {},
              { text: formatCurrency(totalDiscount), bold: true },
            ],
            [
              {
                text: "Total com desconto:",
                colSpan: 5,
                alignment: "right",
                bold: true,
              },
              {},
              {},
              {},
              {},
              { text: formatCurrency(discountTotalValue), bold: true },
            ],
          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 10, 0, 20],
      },
      { text: "Imagens de Referência", style: "subheader" },
      {
        columns:
          imageBase64List.length > 1 ? imageBase64List : [imageBase64List[0]],
      },
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 10],
      },
      subheader: {
        fontSize: 13,
        bold: true,
        margin: [0, 10, 0, 5],
      },
    },
    defaultStyle: {
      font: "Helvetica",
    },
  };

  pdfMake.createPdf(docDefinition).open(); // ou .download('proposta.pdf')
}
