import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Download } from "lucide-react";
import { Order } from "@/interfaces/Order";
import logo from "@/assets/logo_3irmaos.png";
import { IMaskInput } from "react-imask";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const PDFPedido = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
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

  // Função para gerar o PDF e fazer upload para o Firebase Storage
  const generatePDF = async () => {
    if (!contentRef.current) return;

    setLoading(true);

    try {
      // Capturar o conteúdo como imagem
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // Melhora a qualidade
        useCORS: true, // Permite carregar imagens de outros domínios
        logging: false,
      });

      // Criar um novo documento PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Adicionar a imagem ao PDF
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Se o conteúdo for maior que uma página A4, adicionar mais páginas
      let heightLeft = imgHeight;
      let position = 0;

      while (heightLeft > 297) {
        // 297mm é o comprimento de uma página A4
        position = heightLeft - 297;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Criar Blob do PDF
      const pdfBlob = pdf.output("blob");

      // Fazer upload para o Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `pedidos/pedido-${id}-${Date.now()}.pdf`);
      await uploadBytes(storageRef, pdfBlob);

      // Obter URL de download
      const downloadURL = await getDownloadURL(storageRef);
      setPdfUrl(downloadURL);

      setLoading(false);

      return downloadURL;
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      setLoading(false);
      return null;
    }
  };

  // Função para download direto do PDF
  const downloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `Pedido-${id}-3Irmaos.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex text-start w-full items-center justify-center p-4 ">
      <div className="flex flex-col  w-full items-center justify-center ">
        <div className="flex gap-2">
          {!pdfUrl ? (
            <Button className="mb-10" onClick={generatePDF} disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Gerando
                  PDF...
                </>
              ) : (
                "Gerar PDF"
              )}
            </Button>
          ) : (
            <Button className="mb-10" onClick={downloadPDF}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          )}
          <Button className="mb-10" onClick={() => navigate(-1)}>
            {loading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />{" "}
                Voltando...
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
                                unmask={true}
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
                                unmask={true}
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
                  {!detailsPropostal.obs ? (
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
