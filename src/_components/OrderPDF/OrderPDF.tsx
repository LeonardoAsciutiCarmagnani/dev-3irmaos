import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Download } from "lucide-react";
import { Order } from "@/interfaces/Order";
import logo from "@/assets/logo_3irmaos.png";
import { IMaskInput } from "react-imask";

export const PDFPedido = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const {
    id,
    client,
    deliveryAddress,
    createdAt,
    detailsPropostal,
    clientImages,
    imagesUrls,
    products,
    totalValue,
    totalDiscount,
    discountTotalValue,
  } = state as Order;

  const contentRef = useRef<HTMLDivElement>(null);
  const contentToPrint = useReactToPrint({
    contentRef,
    documentTitle: `Pedido ${id} - 3 Irmãos`,
    onBeforePrint: async () => {
      setLoading(true);
    },
    pageStyle: `
    @page {
      size: A4;
      margin: 0;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
      }

      * {
        box-sizing: border-box;
      }

      html, body, #root {
        height: 100%;
        width: 100%;
      }
    }
  `,
  });

  function handlingPrintPage() {
    contentToPrint();
    setLoading(false);
  }

  // Função para gerar PDF e fazer upload para o Firebase Storage
  const generatePDFAndUpload = async () => {
    try {
      setIsGeneratingPDF(true);

      if (!contentRef.current) {
        console.error("Content ref is null");
        setIsGeneratingPDF(false);
        return;
      }

      // Capturar o conteúdo como imagem usando html2canvas
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // Melhor qualidade
        useCORS: true, // Para permitir imagens de outras origens
        logging: false,
        windowWidth: contentRef.current.scrollWidth,
        windowHeight: contentRef.current.scrollHeight,
      });

      // Criar um PDF no formato A4
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Dimensões da página A4 em mm (210 x 297)
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Adicionar a imagem ao PDF
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

      // Se o conteúdo for maior que uma página, adicionar mais páginas
      let heightLeft = imgHeight;
      let position = 0;

      // Necessário apenas se o conteúdo for maior que uma página A4
      while (heightLeft > 297) {
        position = heightLeft - 297;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, -position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Converter o PDF para Base64
      const pdfBase64 = pdf.output("datauristring");

      // Fazer upload para o Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `pedidos/pedido_${id}_${Date.now()}.pdf`);

      // Upload do PDF como string Base64
      await uploadString(storageRef, pdfBase64, "data_url");

      // Obter a URL de download
      const downloadUrl = await getDownloadURL(storageRef);

      // Salvar a URL no estado
      setPdfUrl(downloadUrl);
      setIsGeneratingPDF(false);

      console.log("PDF gerado e enviado com sucesso");
    } catch (error) {
      console.error("Erro ao gerar ou fazer upload do PDF:", error);
      setIsGeneratingPDF(false);
    }
  };

  // Função para download do PDF
  const handlePdfDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    }
  };

  return (
    <div className="flex text-start w-full items-center justify-center p-4 ">
      <div className="flex flex-col  w-full items-center justify-center ">
        <div className="flex gap-2">
          <Button className="mb-10" onClick={() => handlingPrintPage()}>
            {loading ? (
              <>
                <LoaderCircle className="mr-2 animate-spin" /> Imprimindo...
              </>
            ) : (
              "Imprimir"
            )}
          </Button>

          {!pdfUrl ? (
            <Button
              className="mb-10"
              onClick={generatePDFAndUpload}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <>
                  <LoaderCircle className="mr-2 animate-spin" /> Gerando PDF...
                </>
              ) : (
                "Gerar PDF"
              )}
            </Button>
          ) : (
            <Button className="mb-10" onClick={handlePdfDownload}>
              <Download className="mr-2" /> Baixar PDF
            </Button>
          )}

          <Button className="mb-10" onClick={() => navigate(-1)}>
            {loading ? (
              <>
                <LoaderCircle className="mr-2 animate-spin" /> Voltando...
              </>
            ) : (
              "Voltar"
            )}
          </Button>
        </div>
        {/* Dados da proposta */}
        <div
          ref={contentRef}
          className="flex flex-col w-2/3 space-y-6 p-4  rounded-lg print:w-full print:items-start print:justify-start"
        >
          {/* Dados do cliente */}
          <div className="flex flex-col text-start space-y-1 rounded-lg print:w-full">
            <div className="flex justify-center items-center mb-3 p-2 border-b border-black ">
              <img src={logo} alt="Logo 3 irmãos" className="w-1/3" />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg  mb-3">
                Proposta Comercial {id} - Sofisticação e Qualidade para o Seu
                Projeto
              </span>
              <span className="text-sm">{createdAt}</span>
            </div>

            <div className=" flex flex-col  ">
              <div className="flex flex-col justify-between">
                <div className="flex gap-2 items-center ">
                  <span className="font-semibold">Cliente:</span>
                  <span className="text-lg">{client.name}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold  ">Email:</span>
                  <span className="text-lg  truncate">{client.email}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold  ">Telefone:</span>
                  <span className="text-lg   ">{client.phone}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold  ">
                    {deliveryAddress.city}
                  </span>
                  <span className="font-semibold ">
                    {" "}
                    {deliveryAddress.state}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-sm">
              Prezada (o), {client.name} Obrigado pelo interesse na 3 Irmãos.
              Trabalhamos com madeira de demolição nobre, com peças feitas sob
              medida e acabamento artesanal. Abaixo seguem os detalhes do
              orçamento solicitado. Qualquer ajuste, é só me chamar.
            </span>
          </div>
          {/* Produtos */}
          <div className="flex flex-col ">
            <table className="p-2 w-full border border-gray-300 overflow-y-scroll space-y-2">
              <tr className="w-full border border-gray-500">
                <thead className="grid grid-cols-6 items-center text-center">
                  <td className="col-span-2 font-bold">Produto</td>
                  <td className="col-span-1 font-bold">Qtd</td>
                  <td className="col-span-1 font-bold">Desconto</td>
                  <td className="col-span-1 font-bold">Valor unitário</td>
                  <td className="col-span-1 font-bold">Valor total</td>
                </thead>
              </tr>
              <tbody className="divide-y divide-gray-200">
                {products &&
                  products.map((item) => {
                    return (
                      <tr
                        key={item.id}
                        className="flex flex-col rounded-xs w-full border-b border-gray-300 last:border-b-0"
                      >
                        <td className=" grid grid-cols-6 items-center  justify-around  px-2  w-full">
                          {/* Produto */}
                          <div className=" flex flex-col col-span-2">
                            <span className="flex-1 text-lg text-gray-700">
                              {item.nome}
                            </span>
                            <span className="flex-1 text-md text-gray-700">
                              {item.selectedVariation.nomeVariacao}
                            </span>
                            <div className="text-sm text-gray-500 flex gap-2">
                              <span>Altura: {item.altura} m</span>
                              {/*   <span>
                                                  Comprimento:{" "}
                                                  {item.comprimento}
                                                </span> */}
                              <span>Largura: {item.largura} m</span>
                            </div>
                            <div className="flex-1 text-lg ">
                              {item.selectedVariation.nomeVariacao ===
                              "Medida Padrao" ? (
                                <span className="text-sm text-red-900">
                                  Pronta Entrega
                                </span>
                              ) : (
                                <span className="text-sm text-red-900">
                                  Sob Medida
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex text-lg text-gray-700 items-center justify-center text-center h-full">
                            <span>{item.quantidade} x </span>
                          </div>
                          {/* Coluna desconto */}
                          <div className="flex gap-2  items-center justify-center text-center">
                            <div className="flex  items-center text-center ">
                              <IMaskInput
                                mask="R$ num"
                                blocks={{
                                  num: {
                                    mask: Number,
                                    scale: 2,
                                    thousandsSeparator: ".",
                                    padFractionalZeros: true,
                                    normalizeZeros: true,
                                    radix: ",",
                                    mapToRadix: ["."],
                                  },
                                }}
                                value={String(item.desconto || 0)}
                                unmask={true} // isso faz com que o valor passado seja numérico
                                disabled
                                className="rounded-xs px-2 py-1 w-[8rem] text-right"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2  items-center justify-center text-center ">
                            <div className="flex  items-center text-center ">
                              <IMaskInput
                                mask="R$ num"
                                blocks={{
                                  num: {
                                    mask: Number,
                                    scale: 2,
                                    thousandsSeparator: ".",
                                    padFractionalZeros: true,
                                    normalizeZeros: true,
                                    radix: ",",
                                    mapToRadix: ["."],
                                  },
                                }}
                                value={String(item.preco) + ""}
                                unmask={true} // isso faz com que o valor passado seja numérico
                                disabled
                                className="rounded-xs px-2 py-1 w-[8rem] text-right"
                              />
                            </div>
                          </div>
                          <div className="text-center h-full flex items-center justify-center  ">
                            {(item.desconto
                              ? item.preco * item.quantidade - item.desconto
                              : item.preco * item.quantidade
                            ).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
              <tfoot>
                <tr className="border-t text-end">
                  <td className="flex justify-end gap-10 p-2">
                    <span className="font-semibold">Total de</span>
                    <span className="w-[8rem] truncate">
                      {" "}
                      {totalValue.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </td>
                </tr>
                <tr className="border-t text-end">
                  <td className="flex justify-end gap-10 p-2">
                    <span className="font-semibold flex-1 ">Desconto de</span>
                    <span className="w-[8rem] truncate">
                      {totalDiscount?.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </td>
                </tr>
                <tr className="border-t text-end">
                  <td className="flex justify-end gap-10 p-2">
                    <span className="font-semibold">Total com desconto</span>
                    <span className="w-[8rem] truncate">
                      {discountTotalValue
                        ? discountTotalValue.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : 0.0}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Imagens de referência */}
          <div className="flex gap-2 items-center">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-2 items-start ">
                <h1 className="font-semibold text-lg">Imagens de referência</h1>
                <div className="flex gap-2 py-2  flex-wrap">
                  {clientImages && clientImages.length > 0 ? (
                    clientImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt="Imagem fornecida pela 3 irmãos"
                        className="size-40 rounded-lg hover:scale-105 transition-all duration-300"
                      />
                    ))
                  ) : (
                    <span>Nenhuma imagem fornecida</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Sketches informados pela 3 irmãos */}
          <div className="flex flex-col gap-4 ">
            {/* Upload de imagens */}
            <h1 className="font-semibold text-lg">
              Projeto (imagens ilustrativas)
            </h1>
            <div className="flex gap-2 py-2  flex-wrap">
              {imagesUrls && imagesUrls.length > 0 ? (
                imagesUrls
                  .map((image, index) => ({ image, index }))
                  .sort((a, b) => b.index - a.index)
                  .map(({ image, index }) => (
                    <img
                      key={index}
                      src={image}
                      alt="Imagem fornecida pela 3 irmãos"
                      className="size-40 rounded-lg hover:scale-105 transition-all duration-300"
                    />
                  ))
              ) : (
                <span>Nenhuma imagem fornecida</span>
              )}
            </div>
          </div>
          {/* Detalhes do Pedido */}
          <div className="flex flex-col w-full h-full">
            <div className="flex flex-col space-y-2">
              <div className="flex flex-col items-start justify-between  max-w-full  text-wrap">
                <span className="font-semibold text-lg">Observações:</span>
                <div className="flex w-full  items-start text-start px-5">
                  {detailsPropostal.obs === "" ||
                  detailsPropostal.obs === undefined ? (
                    <span className=" w-full  flex text-center items-center">
                      Sem observações
                    </span>
                  ) : (
                    <p className="text-gray-700  whitespace-pre-wrap break-words">
                      {detailsPropostal.obs}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start justify-between">
                <span className="font-semibold text-lg">
                  Facilidade no pagamento e agilidade na entrega:
                </span>
                <div className="flex flex-col px-5">
                  <li className="">
                    Forma de pagamento: {detailsPropostal.payment}
                  </li>
                  <li className="">
                    Prazo de entrega: {detailsPropostal.time}
                  </li>
                  <li className="">
                    Frete:{" "}
                    {detailsPropostal.delivery.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </li>
                  <li className="">
                    Valor final:{" "}
                    {totalValue.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}{" "}
                  </li>
                </div>
              </div>
              <div className="flex flex-col items-start justify-between ">
                <span className="text-gray-700 font-bold text-lg">
                  Por que escolher a 3 Irmãos Arte em Madeira de Demolição ?
                </span>
                <div className="px-5">
                  <li>
                    Mais de 40 anos de experiência, garantindo qualidade e
                    compromisso.
                  </li>
                  <li>
                    Madeira nobre e sustentável, com excelente durabilidade.
                  </li>
                  <li>Acabamento exclusivo, agregando valor ao seu imóvel.</li>
                  <li>
                    {" "}
                    Atendimento especializado, acompanhando cada etapa do seu
                    projeto.
                  </li>
                </div>
              </div>
              <div className="flex flex-col items-start justify-between">
                <span className=" font-semibold">
                  {" "}
                  Vamos conversar e alinhar os próximos passos?
                </span>
                <span className="font-semibold">Atenciosamente,</span>
                <div className="flex gap-2 font-semibold">
                  <span>{detailsPropostal.selectedSeller.name}</span>-
                  <span>{detailsPropostal.selectedSeller.email}</span>
                </div>
                <span className="font-semibold">
                  {detailsPropostal.selectedSeller.phone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
