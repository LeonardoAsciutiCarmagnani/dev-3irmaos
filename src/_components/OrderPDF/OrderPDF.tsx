import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Download } from "lucide-react";
import { Order } from "@/interfaces/Order";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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
          <div className="flex flex-col text-start bg-gray-200 p-2 rounded-lg print:w-full">
            <div className="flex justify-around">
              <div className=" flex flex-col  ">
                <span className="font-semibold text-xl text-gray-700">
                  Pedido {id}
                </span>
                <div className="flex gap-2 items-center ">
                  <span className="font-semibold  text-gray-700">Cliente:</span>
                  <span className="text-lg text-gray-700 ">{client.name}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold  text-gray-700">Email:</span>
                  <span className="text-lg text-gray-700 truncate">
                    {client.email}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold  text-gray-700">
                    Telefone:
                  </span>
                  <span className="text-lg  text-gray-700 ">
                    {client.phone}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold  text-gray-700">Data: </span>
                  <span className="  text-gray-700">{createdAt}</span>
                </div>
              </div>
              {/* Endereço */}
              <div className="flex gap-10 justify-between break-before-all">
                <div>
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold  text-gray-700">Rua:</span>
                    <span className="text-lg text-gray-700 ">
                      {deliveryAddress.street}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold  text-gray-700">
                      Numero:
                    </span>
                    <span className="text-lg text-gray-700 ">
                      {deliveryAddress.number}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold  text-gray-700">
                      Bairro:
                    </span>
                    <span className="text-lg text-gray-700 truncate">
                      {deliveryAddress.neighborhood}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold  text-gray-700">
                      Cidade:
                    </span>
                    <span className="text-lg  text-gray-700 ">
                      {deliveryAddress.city}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold  text-gray-700">
                      Estado:{" "}
                    </span>
                    <span className="  text-gray-700">
                      {" "}
                      {deliveryAddress.state}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold  text-gray-700">CEP:</span>
                    <span className="text-gray-700 text-lg">
                      {deliveryAddress.cep}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Produtos */}
          <div className="flex flex-col mb-6">
            <div className="font-semibold text-lg mb-2">Produtos</div>
            <div className="p-2 w-full space-y-2">
              {products &&
                products.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col text-start  rounded-lg bg-gray-200 w-full justify-around"
                    >
                      <div className="flex flex-col md:flex-row p-2 gap-2 w-full">
                        <div className="flex-1">
                          <span className="flex-1 text-lg text-start text-gray-700">
                            {item.nome}
                          </span>
                          <div className="text-sm text-gray-700 flex gap-2">
                            <span>Altura: {item.altura}</span>
                            <span>Largura: {item.largura}</span>
                            <span>Comprimento: {item.comprimento}</span>
                          </div>
                        </div>
                        <div className="flex gap-2  items-center">
                          <div className="border-r border-gray-700 h-4" />
                          <div className="flex  items-center">
                            <span className="text-lg text-gray-700">
                              {item.quantidade} x{" "}
                            </span>
                            <span className="rounded px-2 py-1  text-right text-lg font-semibold text-gray-700">
                              {item.preco.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          {/* Imagens do produto */}
          <div className="flex gap-2 items-center">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-2 items-start ">
                <h1 className="font-semibold text-lg">Imagens</h1>
                {products.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 items-start"
                    >
                      <span className="text-lg text-gray-700">{item.nome}</span>
                      <div className="flex gap-2 flex-wrap">
                        {item.listImages.map((image, index) => {
                          return (
                            <img
                              key={index}
                              src={image.imagem}
                              alt="Imagem do produto"
                              className="size-40 rounded-lg hover:scale-105 transition-all duration-300"
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
          <div className="flex flex-col gap-4 mb-6">
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
          <div className="flex flex-col w-full h-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Detalhes</h2>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col items-center justify-between  max-w-full  text-wrap">
                <span className="text-gray-700 font-semibold">
                  Observações:
                </span>
                <p className="flex w-2/4  items-center text-center ">
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
                </p>
              </div>
              <div className="flex flex-col items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-gray-700 font-semibold">
                    Facilidade no pagamento e agilidade na entrega:
                  </span>
                  <span className="font-semibold">
                    Forma de pagamento: {detailsPropostal.payment}
                  </span>
                  <span className="font-semibold">
                    Prazo de entrega: {detailsPropostal.time}
                  </span>
                  <span className="font-semibold">
                    Frete:{" "}
                    {detailsPropostal.delivery.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  <span className="font-semibold">
                    Valor final:{" "}
                    {totalValue.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}{" "}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-between ">
                <span className="text-gray-700 font-bold text-lg">
                  Por que escolher a 3 Irmãos Arte em Madeira de Demolição ?
                </span>
                <div className="">
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
              <div className="flex flex-col items-center justify-between">
                <span className="text-gray-700">
                  {" "}
                  Vamos conversar e alinhar os próximos passos?
                </span>
                <span className="font-semibold">(11) 94592-6335</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
