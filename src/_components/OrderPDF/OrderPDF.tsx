import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import {
  Check,
  CircleUser,
  Globe,
  Instagram,
  LoaderCircle,
  Mail,
  Phone,
} from "lucide-react";
import { Order } from "@/interfaces/Order";
import logo from "@/assets/logo_3irmaos.png";
import { IMaskInput } from "react-imask";

export const PDFPedido = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  console.log("Valores recebidos no state => ", state);

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

  return (
    <div className="flex text-start w-full items-center justify-center p-4 ">
      <div className="flex flex-col  w-full items-center justify-center ">
        <div className="flex gap-2">
          <Button className="mb-10" onClick={() => handlingPrintPage()}>
            {loading ? (
              <>
                <LoaderCircle /> Imprimindo...
              </>
            ) : (
              "Imprimir"
            )}
          </Button>
          <Button className="mb-10" onClick={() => navigate(-1)}>
            {loading ? (
              <>
                <LoaderCircle /> Voltando...
              </>
            ) : (
              "Voltar"
            )}
          </Button>
        </div>
        {/* Dados da proposta */}
        <div
          ref={contentRef}
          className="flex flex-col w-2/3 space-y-6 p-4  rounded-lg print:w-full  print:justify-start"
        >
          {/* Dados do cliente */}
          <div className="flex flex-col text-start space-y-2 rounded-lg print:w-full">
            <div className="flex justify-between  items-center mb-3 p-2 border-b border-black ">
              <img src={logo} alt="Logo 3 irmãos" className="w-1/3" />

              <div>
                <p className="font-semibold text-center">
                  {" "}
                  3 IRMAOS ARTE EM MADEIRA DE DEMOLICAO C.N.P.J:
                </p>
                <p className="text-sm text-center font-semibold">
                  60.272.960/0001-32
                </p>
                <p className="text-xs text-center">
                  Rua Madagascar, 330 Jardim Margarida - Vargem Grande Paulista
                  / SP - 06739-016
                </p>
                <p className="text-xs text-center">
                  Telefone: (11) 94592-6335 / (11) 4159-6680
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg  mb-3">
                Proposta Comercial {id} - Sofisticação e Qualidade para o Seu
                Projeto
              </span>
              <span className="text-sm">{createdAt}</span>
            </div>

            <div className=" flex gap-10 ">
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
              </div>
              <div className="flex flex-col items-start justify-center ">
                <div className="flex gap-2 items-center">
                  <span className="font-semibold  ">Rua:</span>
                  <span className=""> {deliveryAddress.city}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold  ">Bairro:</span>
                  <span className=""> {deliveryAddress.neighborhood}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold  ">Cidade:</span>
                  <span className=""> {deliveryAddress.city}</span>
                  <span className=""> /</span>
                  <span className=""> {deliveryAddress.state}</span>
                </div>
              </div>
              <div className="flex gap-2 items-start ">
                <span className="font-semibold  ">Cep:</span>
                <span className=""> {deliveryAddress.cep}</span>
              </div>
            </div>
            <span className="text-md">
              Prezada (o), {client.name} Obrigado pelo interesse na 3 Irmãos.
              Trabalhamos com madeira de demolição nobre, com peças feitas sob
              medida e acabamento artesanal. Abaixo seguem os detalhes do
              orçamento solicitado. Qualquer ajuste, é só me chamar.
            </span>
          </div>
          {/* Produtos */}
          <div className="flex flex-col ">
            <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
              <thead className="w-full border border-gray-500">
                <tr>
                  <th className="px-2 py-2 border border-gray-500 font-bold text-left w-[300px]">
                    Produto
                  </th>
                  <th className="px-2 py-2 border border-gray-500 font-bold text-center w-[40px]">
                    Un
                  </th>
                  <th className="px-2 py-2 border border-gray-500 font-bold text-center w-[40px]">
                    Qtd
                  </th>
                  <th className="px-2 py-2 border border-gray-500 font-bold text-center w-[150px]">
                    Desconto
                  </th>
                  <th className="px-2 py-2 border border-gray-500 font-bold text-center w-[150px]">
                    Valor unitário
                  </th>
                  <th className="px-2 py-2 border border-gray-500 font-bold text-center w-[150px]">
                    Valor total
                  </th>
                </tr>
              </thead>
              <tbody>
                {products &&
                  products.map((item) => {
                    return (
                      <tr key={item.id}>
                        <td className="px-2 py-2 border  align-top">
                          <div className="text-gray-800">{item.nome}</div>
                          {/*   <div className="text-gray-600">
                            {item.selectedVariation.nomeVariacao}
                          </div> */}
                          <div className="text-xs text-gray-500 flex gap-2">
                            <span>Altura: {item.altura}m</span>
                            <span>Largura: {item.largura}m</span>
                          </div>
                          {/*  <div className="text-xs mt-1 text-red-700">
                            {item.selectedVariation.nomeVariacao ===
                            "Medida Padrao"
                              ? "Pronta Entrega"
                              : "Sob Medida"}
                          </div> */}
                        </td>
                        <td className="px-2 py-2 border text-center">
                          {item.unidade}
                        </td>
                        <td className="px-2 py-2 border text-center">
                          {item.quantidade}x
                        </td>
                        <td className="px-2 py-2 border text-center">
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
                            className="text-center w-full"
                          />
                        </td>
                        <td className="px-2 py-2 border text-center">
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
                            value={String(item.preco)}
                            unmask={true}
                            disabled
                            className="text-center w-full"
                          />
                        </td>
                        <td className="px-2 py-2 border text-center">
                          {(item.desconto
                            ? item.preco * item.quantidade - item.desconto
                            : item.preco * item.quantidade
                          ).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
              <tfoot>
                <tr className="border">
                  <td
                    colSpan={6}
                    className="text-right px-4 py-2 border-t font-medium"
                  >
                    Total:{" "}
                    <span className="font-bold text-gray-800">
                      {totalValue.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </td>
                </tr>
                <tr className="border">
                  <td colSpan={6} className="text-right px-4 py-2 font-medium">
                    Desconto total:{" "}
                    <span className="font-bold ">
                      {totalDiscount?.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="text-right px-4 py-2 font-medium">
                    Total com desconto:{" "}
                    <span className="font-bold ">
                      {discountTotalValue?.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Imagens de referência */}
          <div className="flex gap-2  ">
            <div className="flex flex-col gap-2  w-full">
              <h1 className="font-semibold text-lg">Imagens de referência</h1>
              {clientImages.length > 1 ? (
                <div className="grid grid-cols-2 justify-center items-center print:items-center print:w-full w-full  gap-2 py-2">
                  {clientImages && clientImages.length > 0 ? (
                    clientImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt="Imagem fornecida pela 3 irmãos"
                        className="size-[40rem] border rounded-lg hover:scale-105 transition-all duration-300"
                      />
                    ))
                  ) : (
                    <span>Nenhuma imagem fornecida</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center print:items-center print:w-full w-full border gap-2 py-2">
                  {clientImages && clientImages.length > 0 ? (
                    clientImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt="Imagem fornecida pela 3 irmãos"
                        className="size-96 border rounded-lg hover:scale-105 transition-all duration-300"
                      />
                    ))
                  ) : (
                    <span>Nenhuma imagem fornecida</span>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Sketches informados pela 3 irmãos */}
          <div className="flex flex-col gap-4 ">
            {/* Upload de imagens */}
            <h1 className="font-semibold text-lg">
              Projeto (imagens ilustrativas)
            </h1>
            {imagesUrls.length > 1 ? (
              <div className="grid grid-cols-2  justify-center items-center gap-2 py-2  flex-wrap">
                {imagesUrls && imagesUrls.length > 0 ? (
                  imagesUrls
                    .map((image, index) => ({ image, index }))
                    .sort((a, b) => b.index - a.index)
                    .map(({ image, index }) => (
                      <img
                        key={index}
                        src={image}
                        alt="Imagem fornecida pela 3 irmãos"
                        className="size-[40rem] border rounded-lg hover:scale-105 transition-all duration-300"
                      />
                    ))
                ) : (
                  <span>Nenhuma imagem fornecida</span>
                )}
              </div>
            ) : (
              <div className="flex flex-col  justify-center items-center gap-2 py-2  flex-wrap">
                {imagesUrls && imagesUrls.length > 0 ? (
                  imagesUrls
                    .map((image, index) => ({ image, index }))
                    .sort((a, b) => b.index - a.index)
                    .map(({ image, index }) => (
                      <img
                        key={index}
                        src={image}
                        alt="Imagem fornecida pela 3 irmãos"
                        className="size-[40rem] border rounded-lg hover:scale-105 transition-all duration-300"
                      />
                    ))
                ) : (
                  <span>Nenhuma imagem fornecida</span>
                )}
              </div>
            )}
          </div>
          {/* Detalhes do Pedido */}
          <div className="flex flex-col w-full h-full">
            <div className="flex flex-col space-y-2">
              <div className="flex flex-col items-start justify-between  max-w-full  text-wrap">
                <span className="font-semibold text-lg">Observações:</span>
                <div className="flex w-full  items-start text-start px-5">
                  {detailsPropostal === undefined ||
                  detailsPropostal.obs === "" ? (
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
                    Forma de pagamento:{" "}
                    {detailsPropostal === undefined ||
                    detailsPropostal.payment === "" ? (
                      "Não informado"
                    ) : (
                      <>{detailsPropostal.payment}</>
                    )}
                  </li>
                  <li className="">
                    Prazo de entrega:{" "}
                    {detailsPropostal === undefined
                      ? "Não informado"
                      : detailsPropostal.time}
                  </li>
                  <li className="">
                    Frete:{" "}
                    {detailsPropostal === undefined ||
                    detailsPropostal.delivery === 0 ? (
                      0
                    ) : (
                      <>
                        {" "}
                        {detailsPropostal.delivery.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </>
                    )}
                  </li>
                  <li className="">
                    Valor final:{" "}
                    {detailsPropostal === undefined ? (
                      ""
                    ) : (
                      <>
                        {(
                          discountTotalValue + detailsPropostal.delivery
                        ).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </>
                    )}
                  </li>
                </div>
              </div>
              <div className="flex flex-col items-start justify-between ">
                <span className="font-bold text-lg">
                  Por que escolher a 3 Irmãos Arte em Madeira de Demolição ?
                </span>
                <div className="px-3">
                  <ul className="flex gap-2">
                    <Check color="green" />
                    Mais de 40 anos de experiência, garantindo qualidade e
                    compromisso.
                  </ul>
                  <ul className="flex gap-2">
                    <Check color="green" />
                    Madeira nobre e sustentável, com excelente durabilidade.
                  </ul>
                  <ul className="flex gap-2">
                    {" "}
                    <Check color="green" /> Acabamento exclusivo, agregando
                    valor ao seu imóvel.
                  </ul>
                  <ul className="flex gap-2">
                    <Check color="green" />
                    Atendimento especializado, acompanhando cada etapa do seu
                    projeto.
                  </ul>
                </div>
              </div>
              <div className="flex flex-col items-start justify-between">
                <span className=" font-semibold">
                  {" "}
                  📞 Vamos conversar e alinhar os próximos passos?
                </span>
                <span className="font-semibold">Atenciosamente,</span>
                <div className="flex flex-col gap-2 font-semibold">
                  <span className="flex gap-2">
                    <CircleUser />
                    {detailsPropostal === undefined
                      ? ""
                      : detailsPropostal.selectedSeller.name}
                  </span>
                  <span className="flex gap-2">
                    <Mail />
                    {detailsPropostal === undefined
                      ? ""
                      : detailsPropostal.selectedSeller.email}
                  </span>
                  <span className="flex gap-2 font-semibold">
                    <Phone />
                    {detailsPropostal === undefined
                      ? ""
                      : detailsPropostal.selectedSeller.phone}
                  </span>
                  <span className="flex gap-2 font-semibold">
                    <Instagram />
                    3irmaosmadeirademolicao
                  </span>
                  <span className="flex gap-2 font-semibold">
                    <Globe />
                    3irmaosmadeirademolicao.com.br
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
