import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { CreateBudgetService } from "../../services/Order/createBudget";
import { PostOrderService } from "../../services/hiper/postOrder";

import { readFileSync } from "fs";
import { parse, resolve } from "path";

import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

// Caminho absoluto a partir do arquivo compilado em dist/
const logoPath = resolve(__dirname, "../../assets/logo_3irmaos.png");

const logoBuffer = readFileSync(logoPath);
const logoBase64 = logoBuffer.toString("base64");
const logoDataUri = `data:image/png;base64,${logoBase64}`;

const createBudgetSchema = z.object({
  client: z.object({
    id: z.string().uuid("ID do cliente inválido."),
    name: z
      .string()
      .min(3, "Nome do cliente deve ter pelo menos 3 caracteres."),
    email: z.string().email("E-mail inválido").trim().toLowerCase(),
    phone: z.string({ message: "Telefone obrigatório." }),
    document: z.string({ message: "Documento obrigatório." }),
    ie: z.string().optional(),
  }),
  deliveryAddress: z.object({
    cep: z.string().min(8, "CEP deve ter 8 dígitos."),
    neighborhood: z.string({ message: "Bairro obrigatório." }),
    street: z.string({ message: "Logradouro obrigatório." }),
    number: z.number().min(1, "Número obrigatório."),
    city: z.string({ message: "Cidade obrigatória." }),
    state: z.string({ message: "Estado obrigatório." }),
    ibge: z.string().optional(),
  }),
  billingAddress: z.object({
    cep: z.string().min(8, "CEP deve ter 8 dígitos."),
    neighborhood: z.string({ message: "Bairro obrigatório." }),
    street: z.string({ message: "Logradouro obrigatório." }),
    number: z.number().min(1, "Número obrigatório."),
    city: z.string({ message: "Cidade obrigatória." }),
    state: z.string({ message: "Estado obrigatório." }),
    ibge: z.string().optional(),
  }),
  products: z.array(
    z.object({
      nome: z.string({ message: "Nome do produto obrigatório." }),
      quantidade: z.number().min(1, "Quantidade deve ser maior que 0."),
      altura: z.number().optional().nullable(),
      largura: z.number().optional().nullable(),
      comprimento: z.number().optional().nullable(),
      categoria: z.string({ message: "Categoria obrigatória." }).nullable(),
      unidade: z.string({ message: "Unidade obrigatória." }),
      preco: z.number({ message: "Preço obrigatório." }),
      desconto: z.number().optional().nullable(),
      selectedVariation: z.object({
        id: z.string({ message: "ID da variação obrigatória." }),
        nomeVariacao: z.string({ message: "Nome da variação obrigatória." }),
      }),
    })
  ),
  imagesUrls: z.array(z.string()).optional().nullable(),
  detailsPropostal: z
    .object({
      obs: z.string().optional(),
      payment: z.string().optional(),
      delivery: z.number().optional(),
      time: z.string().optional(),
      seller: z.string().optional(),
      sellerPhone: z.string().optional(),
      selectedSeller: z
        .object({
          email: z.string(),
          name: z.string(),
          phone: z.string(),
        })
        .nullable()
        .optional(),
      itemsIncluded: z.string().optional(),
      itemsNotIncluded: z.string().optional(),
    })
    .nullable()
    .optional(),
  createdAt: z.string().optional(),
  orderStatus: z.number(),
  discountTotalValue: z.number().optional(),
  totalDiscount: z.number().min(0, "Desconto inválido.").optional(),
  totalValue: z.number().min(0, "Valor total inválido.").optional(),
});

const createOrderSchema = z.object({
  orderId: z.number(),
  client: z.object({
    id: z.string().uuid("ID do cliente inválido."),
    name: z
      .string()
      .min(3, "Nome do cliente deve ter pelo menos 3 caracteres."),
    email: z.string().email("E-mail inválido").trim().toLowerCase(),
    phone: z.string({ message: "Telefone obrigatório." }),
    document: z.string({ message: "Documento obrigatório." }),
    ie: z.string().optional(),
  }),
  deliveryAddress: z.object({
    cep: z.string().min(8, "CEP deve ter 8 dígitos."),
    neighborhood: z.string({ message: "Bairro obrigatório." }),
    street: z.string({ message: "Logradouro obrigatório." }),
    number: z.number().min(1, "Número obrigatório."),
    city: z.string({ message: "Cidade obrigatória." }),
    state: z.string({ message: "Estado obrigatório." }),
    ibge: z.string().optional(),
  }),
  billingAddress: z.object({
    cep: z.string().min(8, "CEP deve ter 8 dígitos."),
    neighborhood: z.string({ message: "Bairro obrigatório." }),
    street: z.string({ message: "Logradouro obrigatório." }),
    number: z.number().min(1, "Número obrigatório."),
    city: z.string({ message: "Cidade obrigatória." }),
    state: z.string({ message: "Estado obrigatório." }),
    ibge: z.string().optional(),
  }),
  products: z.array(
    z.object({
      nome: z.string({ message: "Nome do produto obrigatório." }),
      quantidade: z.number().min(1, "Quantidade deve ser maior que 0."),
      altura: z.number().optional().nullable(),
      largura: z.number().optional().nullable(),
      comprimento: z.number().optional().nullable(),
      categoria: z.string({ message: "Categoria obrigatória." }).nullable(),
      preco: z.number({ message: "Preço obrigatório." }),
      selectedVariation: z.object({
        id: z.string({ message: "ID da variação obrigatória." }),
        nomeVariacao: z.string({ message: "Nome da variação obrigatória." }),
      }),
    })
  ),
  detailsPropostal: z
    .object({
      obs: z.string().optional(),
      payment: z.string().optional(),
      delivery: z.number().optional(),
      time: z.string().optional(),
      selectedSeller: z
        .object({
          email: z.string(),
          name: z.string(),
          phone: z.string(),
        })
        .optional()
        .nullable(),
    })
    .nullable()
    .optional(),
  createdAt: z.string().optional(),
  orderStatus: z.number(),
  totalValue: z.number().min(0, "Valor total inválido."),
  imagesUrls: z.array(z.string()).optional(),
});

export type BudgetType = z.infer<typeof createBudgetSchema>;
export type OrderType = z.infer<typeof createOrderSchema>;

export class OrderController {
  public static async createBudget(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsedBody = createBudgetSchema.parse(req.body);

      console.log("Order Controller (CREATE) - Body received:", req.body);

      const createdOrder: FirebaseFirestore.DocumentReference<
        FirebaseFirestore.DocumentData,
        FirebaseFirestore.DocumentData
      > = await CreateBudgetService.execute(parsedBody);

      if (createdOrder.success === false) {
        res.status(409).json({
          success: false,
          message: "Erro ao criar orçamento",
        });
      }

      res.status(201).json({
        success: true,
        message: "Orçamento criado com sucesso",
        orderId: createdOrder.orderId,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async postOrderInHiper(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      console.log("Dados Recebidos:", req.body);

      const parsedBody = createOrderSchema.parse(req.body);

      const userId = parsedBody.client.id;

      console.log("Order Controller (CREATE) - Body received:", req.body);

      console.log("Order Controller (CREATE) - Creating Order:", parsedBody);
      const createdOrder = await PostOrderService.postOrder(parsedBody, userId);

      if (createdOrder.success === false) {
        res.status(409).json(createdOrder);
      }

      res.status(201).json(createdOrder);
    } catch (error: ZodError | any) {
      if (error instanceof ZodError) {
        console.error("ZodError:", error.errors);
        res.status(400).json({
          success: false,
          message: "Erro de validação",
          errors: error.errors,
        });
      }
      next(error);
    }
  }

  /*
        const browser = await (isLocal
        ? (await import("puppeteer")).default.launch({ headless: true }) // puppeteer completo localmente
        : puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
          })); 


 

       */

  public static async generatePDF(req: Request, res: Response) {
    const data = req.body;
    console.log("Body received => ", data);

    const orderId = data.orderId;
    const clientImages: string[] = data.clientImages;

    const {
      client,
      deliveryAddress,
      billingAddress,
      detailsPropostal,
      createdAt,
      products,
      totalValue,
      totalDiscount,
      discountTotalValue,
      imagesUrls,
    } = data as BudgetType;

    const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
          }
          .header {
            display: flex;
            align-items: center;
            border-bottom: 1px solid #000;
            padding-bottom: 10px;
            gap: 20px;
          }
          .logo {
            width: 300px;
          }
          .company-info {
            display: flex;
            flex-direction: column;
            text-align: center;
          }
            .company-addres{
            font-size: 12px;
            }
            .company-phone{
            font-size: 14px;
            }
          .proposal-title {
            font-size: 18px;
            font-weight: bold;
          }
          .section {
            margin-top: 10px;
          }
          .section h2 {
            page-break-after: avoid;      
            break-after: avoid-page;      
            margin-top: 0;
            margin-bottom: 12px;
          }
          .flex {
            display: flex;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #999;
            padding: 8px;
            font-size: 14px;
          }
          th {
            background-color: #f2f2f2;
            text-align: left;
          }
          .text-right {
            text-align: right;
          }
          .images-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            width: 100%;
            break-inside: avoid-column;
            break-inside: avoid-page;
          }

          .image-container {
            width: 100%;
            height: 250px; 
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border: 1px solid #ddd;
          }

          .image-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            page-break-inside: avoid;
            break-inside: avoid-column;
            break-inside: avoid-page;
          }
          .client-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .flex-client-info{
            display: flex;
            justify-content: space-between;
            gap: 40px;
            }
          @page {
            margin: 20mm 10mm 10mm 10mm;  
          }

          @page :first {
            margin-top: 10mm;           
          }
        </style>
      </head>
      <body>
          <div class="header">
          <img class="logo" src="${logoDataUri}" alt="Logo" />
          <div class="company-info">
            <span><strong>3 IRMÃOS ARTE EM MADEIRA DE DEMOLIÇÃO</strong></span>
            <span><strong>CNPJ: 60.272.960/0001-32</strong></span>
            <span class="company-addres">Rua Madagascar, 330 Jardim Margarida - Vargem Grande Paulista / SP - 06739-016</span>
            <span class="company-phone">Telefone: (11) 94592-6335 / (11) 4159-6680</span>
          </div>
        </div>

        <div class="section ">
          <div class="proposal-title">Proposta Comercial #${orderId} - Sofisticação e Qualidade para o Seu Projeto</div>
          <div>${createdAt}</div>
        </div>

        <div class="section flex-client-info">
          <div class="client-info">
            <span><strong>Cliente:</strong> ${client.name}</span>
            <span><strong>Email:</strong> ${client.email}</span>
            <span><strong>Telefone:</strong> ${client.phone}</span>
          </div>
          <div class="client-info">
            <span><strong>Rua:</strong> ${billingAddress.street}</span>
            <span><strong>Bairro:</strong> ${billingAddress.neighborhood}</span>
            <span><strong>Cidade:</strong> ${billingAddress.city} / ${
      billingAddress.state
    }</span>
      </div>
      <p><strong>CEP:</strong> ${billingAddress.cep}</p>
        </div>

        <div class="section">
          <p>
            Prezada(o) ${client.name},<br />
            Obrigado pelo interesse na 3 Irmãos. Trabalhamos com madeira de demolição nobre, com peças feitas sob medida e acabamento artesanal.
             Abaixo seguem os detalhes do orçamento solicitado. Qualquer ajuste, é só me chamar.
          </p>
        </div>

        <div class="section">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th style="text-align:center">Un</th>
                <th>Qtd</th>
                <th>Desconto</th>
                <th>Valor Unitário</th>
                <th>Valor Total</th>
              </tr>
            </thead>
            <tbody>
              ${products
                .map((item) => {
                  const total =
                    item.preco * item.quantidade - (item.desconto || 0) || 0;
                  const variation =
                    item.selectedVariation.nomeVariacao.split("-");

                  return `
                    <tr>
                      <td>
                        ${item.nome}<br/>
                         <span style="color: #7f1d1d">
                          ${variation[0]}
                        </span> 
                         ${
                           variation[1]
                             ? `
                          <span> - </span>
                          <span>
                            ${variation[1]}
                          </span>`
                             : ""
                         }
                       <br/>
                        <small style="color:#000">
                       Altura: ${item.altura ? item.altura : "0"}m | Largura: ${
                    item.largura ? item.largura : "0"
                  }m | Comprimento: ${
                    item.comprimento ? item.comprimento : "0"
                  }m</small>
                      </td>
                      <td>${item.unidade ? item.unidade : "UN"}</td>
                      <td style="text-align:center">${item.quantidade}</td>
                      <td>${
                        item.desconto?.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }) || "0,00"
                      }</td>
                      <td>${item.preco.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}</td>
                      <td>${total.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="text-right"><strong style="padding: 0px 4px">Sub Total:</strong>${totalValue?.toLocaleString(
                  "pt-BR",
                  { style: "currency", currency: "BRL" }
                )}</td>
              </tr>
              <tr>
                <td colspan="6" class="text-right"><strong style="padding: 0px 4px">Desconto:</strong>${
                  totalDiscount
                    ? totalDiscount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : "R$ 0,00"
                }</td>
              </tr>

              <tr>
               <td colspan="6" class="text-right">
                  <strong style="padding: 0px 4px">
                    Frete:
                  </strong>
                  ${
                    detailsPropostal?.delivery
                      ? detailsPropostal?.delivery.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "R$ 0,00"
                  }
                </td>
              </tr>
              
              <tr>
               <td colspan="6" class="text-right">
                  <strong style="padding: 0px 4px">
                    Total:
                  </strong>
                  ${(discountTotalValue
                    ? discountTotalValue + (detailsPropostal?.delivery || 0)
                    : 0
                  ).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
              </tr>
               
            </tfoot>
          </table>
        </div>

          ${
            clientImages?.length > 0
              ? `
          <div class="section">
            <span style="font-weight: bold; font-size: 18px;">Imagens de referência</span>
            <div class="images-grid">
                  ${clientImages
                    .map(
                      (src) =>
                        `<div class="image-container">
                          <img src="${src}" alt="Imagem fornecida pelo cliente" />
                        </div>`
                    )
                    .join("")}
                </div>
          </div>`
              : ""
          }

          ${
            (imagesUrls?.length ?? 0) > 0
              ? `
              <div class="section">
                <span style="font-weight: bold; font-size: 18px;">Imagens ilustrativas</span>
                <div class="images-grid">
                  ${(imagesUrls ?? [])
                    .map(
                      (src) =>
                        `<div class="image-container">
                          <img src="${src}" alt="Imagem fornecida pela 3 Irmãos" />
                        </div>`
                    )
                    .join("")}
                </div>
              </div>`
              : ""
          }

      
      <div class="section">
        <span style="font-weight: bold; font-size: 18px;">Observações</span>
        <p style="white-space: pre-wrap; color: #000;">
          ${detailsPropostal?.obs || "Sem observações"}
        </p>
      </div>

      ${
        detailsPropostal?.itemsIncluded
          ? `<div class="section">
            <span style="font-weight: bold; font-size: 18px;">Itens incluídos</span>
            <p style="white-space: pre-wrap;">${detailsPropostal.itemsIncluded}</p>
          </div>`
          : ""
      }

      ${
        detailsPropostal?.itemsNotIncluded
          ? `<div class="section">
            <span style="font-weight: bold; font-size: 18px; color: red;">Itens não incluídos</span>
            <p style="white-space: pre-wrap; color: red;">${detailsPropostal.itemsNotIncluded}</p>
          </div>`
          : ""
      }

  <div class="section">
    <span style="font-weight: bold; font-size: 18px;">Facilidade no pagamento e agilidade na entrega</span>
    <ul style="padding-left: 20px;">
      <li><strong>Forma de pagamento:</strong> ${
        detailsPropostal?.payment || "Não informado"
      }</li>
      <li><strong>Prazo de entrega:</strong> ${
        detailsPropostal?.time || "Não informado"
      }</li>
      <li><strong>Frete:</strong> ${
        detailsPropostal?.delivery
          ? `R$ ${detailsPropostal.delivery.toFixed(2).replace(".", ",")}`
          : "R$ 0,00"
      }</li>
      <li><strong>Valor final:</strong>${(discountTotalValue
        ? discountTotalValue + (detailsPropostal?.delivery || 0)
        : 0
      ).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}</li>
    </ul>
  </div>
  <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <span style="font-weight: bold; font-size: 18px;">
          Por que escolher a 3 Irmãos Arte em Madeira de Demolição?
        </span>
      <ul style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px; list-style: none; padding: 0;">
        <li style="margin-bottom: 6px;">✅ Mais de 40 anos de experiência, garantindo qualidade e compromisso.</li>
        <li style="margin-bottom: 6px;">✅ Madeira nobre e sustentável, com excelente durabilidade.</li>
        <li style="margin-bottom: 6px;">✅ Acabamento exclusivo, agregando valor ao seu imóvel.</li>
        <li style="margin-bottom: 6px;">✅ Atendimento especializado, acompanhando cada etapa do seu projeto.</li>
       </ul>
      </div>

      <div>
        <p style="font-weight: 600;">📞 Vamos conversar e alinhar os próximos passos?</p>
        <p style="font-weight: 600; margin-top: 15px">Atenciosamente,</p>

      <ul style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px; font-weight: 600; list-style: none; padding: 0;">
        <li>👤 ${detailsPropostal?.selectedSeller?.name || "Não informado"}</li>
        <li>📧 ${
          detailsPropostal?.selectedSeller?.email || "Não informado"
        }</li>
        <li>📞 ${
          detailsPropostal?.selectedSeller?.phone || "Não informado"
        }</li>
        <li>📸 @3irmaosmadeirademolicao</li>
        <li>🌐 3irmaosmadeirademolicao.com.br</li>
      </ul>
      </div>
    </div>
  </body>
</html>
  `;
    try {
      console.log("Valor de htmlContent:", htmlContent);

      console.log("Iniciando o Puppeteer...");

      const path = await chromium.executablePath;
      console.log("Caminho do executável do Chromium:", path);
      const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
      });

      console.log("Criando nova página...");
      const page = await browser.newPage();
      console.log("Nova página criada.");

      console.log("Setando conteúdo da página...");
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });
      console.log("Conteúdo da página setado.");

      console.log("Gerando PDF...");
      const pdfBuffer = await page.pdf({ format: "A4" });
      console.log("PDF gerado.");

      console.log("Fechando navegador...");
      await browser.close();

      res
        .status(200)
        .header("Content-Type", "application/pdf")
        .header(
          "Content-Disposition",
          `attachment; filename=Pedido ${orderId} - 3 Irmãos.pdf`
        )
        .send(pdfBuffer);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      res.status(500).json({ message: `Erro ao gerar PDF. ${error}` });
    }
  }
}
