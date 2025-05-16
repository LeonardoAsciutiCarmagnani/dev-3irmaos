import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { CreateBudgetService } from "../../services/Order/createBudget";
import { PostOrderService } from "../../services/hiper/postOrder";
import puppeteer from "puppeteer";

import { readFileSync } from "fs";
import { resolve } from "path";

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
      altura: z.number().min(1, "Altura deve ser maior que 0."),
      largura: z.number().min(1, "Largura deve ser maior que 0."),
      // comprimento: z.number().min(1, "Comprimento deve ser maior que 0."),
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
  imagesUrls: z.array(z.string()).optional(),
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
      altura: z.number().min(1, "Altura deve ser maior que 0."),
      largura: z.number().min(1, "Largura deve ser maior que 0."),
      // comprimento: z.number().min(1, "Comprimento deve ser maior que 0."),
      categoria: z.string({ message: "Categoria obrigatória." }).nullable(),
      preco: z.number({ message: "Preço obrigatório." }),
      selectedVariation: z.object({
        id: z.string({ message: "ID da variação obrigatória." }),
        nomeVariacao: z.string({ message: "Nome da variação obrigatória." }),
      }),
      listImages: z.array(
        z.object({
          imagem: z.string().nullable(),
        })
      ),
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

      console.log("Order Controller (CREATE) - Creating Order:", parsedBody);
      const createdOrder = await CreateBudgetService.execute(parsedBody);

      if (createdOrder.success === false) {
        res.status(409).json(createdOrder);
      }

      res.status(201).json(createdOrder);
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

  public static async generatePDF(req: Request, res: Response) {
    try {
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
            padding: 20px;
            color: #333;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #000;
            padding-bottom: 10px;
          }
          .logo {
            width: 300px;
          }
          .company-info {
            text-align: center;
          }
            .company-addres{
            font-size: 14px;
            }
            .company-phone{
            font-size: 14px;
            }
          .proposal-title {
            font-size: 18px;
            font-weight: bold;
          }
          .section {
            margin-top: 20px;
          }
          .flex {
            display: flex;
            gap: 40px;
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
          .images {
            display: grid;
            grid-template-columns: 40% 40%;
            gap: 6rem;
            margin-top: 20px;
          }
          .images img {
            width: 100%;
            height: 600px;
            object-fit: contain;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img class="logo" src="${logoDataUri}" alt="Logo" />
          <div class="company-info">
            <p><strong>3 IRMÃOS ARTE EM MADEIRA DE DEMOLIÇÃO</strong></p>
            <p><strong>CNPJ: 60.272.960/0001-32</strong></p>
            <p class="company-addres">Rua Madagascar, 330 Jardim Margarida - Vargem Grande Paulista / SP - 06739-016</p>
            <p class="company-phone">Telefone: (11) 94592-6335 / (11) 4159-6680</p>
          </div>
        </div>

        <div class="section ">
          <div class="proposal-title">Proposta Comercial #${orderId} - Sofisticação e Qualidade para o Seu Projeto</div>
          <div>${createdAt}</div>
        </div>

        <div class="section flex">
          <div>
            <p><strong>Cliente:</strong> ${client.name}</p>
            <p><strong>Email:</strong> ${client.email}</p>
            <p><strong>Telefone:</strong> ${client.phone}</p>
          </div>
          <div>
            <p><strong>Rua:</strong> ${billingAddress.street}</p>
            <p><strong>Bairro:</strong> ${billingAddress.neighborhood}</p>
            <p><strong>Cidade:</strong> ${billingAddress.city} / ${
        billingAddress.state
      }</p>
      </div>
      <p><strong>CEP:</strong> ${billingAddress.cep}</p>
        </div>

        <div class="section">
          <p>
            Prezada(o) ${client.name},<br />
            Obrigado pelo interesse na 3 Irmãos. Trabalhamos com madeira de demolição nobre, com peças feitas sob medida e acabamento artesanal. Abaixo seguem os detalhes do orçamento solicitado. Qualquer ajuste, é só me chamar.
          </p>
        </div>

        <div class="section">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Un</th>
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
                  return `
                    <tr>
                      <td>
                        ${item.nome}<br/>
                        <small style="color: #888">${
                          item.selectedVariation.nomeVariacao
                        } | Altura: ${item.altura}m | Largura: ${
                    item.largura
                  }m</small>
                      </td>
                      <td>${item.unidade}</td>
                      <td style="align-items: center;">${item.quantidade}</td>
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
                <td colspan="6" class="text-right"><strong>Total:</strong>${totalValue?.toLocaleString(
                  "pt-BR",
                  { style: "currency", currency: "BRL" }
                )}</td>
              </tr>
              <tr>
                <td colspan="6" class="text-right"><strong>Desconto total:</strong>${totalDiscount?.toLocaleString(
                  "pt-BR",
                  { style: "currency", currency: "BRL" }
                )}</td>
              </tr>
              <tr>
                <td colspan="6" class="text-right"><strong>Total com desconto:</strong>${discountTotalValue?.toLocaleString(
                  "pt-BR",
                  { style: "currency", currency: "BRL" }
                )}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        ${
          clientImages?.length > 0
            ? `
          <div class="section">
            <h2>Imagens de referência</h2>
            <div class="images">
              ${clientImages
                .map(
                  (src) =>
                    `<img src="${src}" alt="Imagem fornecida pela 3 Irmãos" />`
                )
                .join("")}
            </div>
          </div>`
            : ""
        }

          ${
            imagesUrls
              ? `
          <div class="section">
            <h2>Imagens ilustrativas</h2>
            <div class="images">
              ${imagesUrls
                .map(
                  (src) =>
                    `<img src="${src}" alt="Imagem fornecida pela 3 Irmãos" />`
                )
                .join("")}
            </div>
          </div>`
              : ""
          }

      <div class="section">
        <h2>Observações</h2>
        <p style="white-space: pre-wrap; color: #555;">
          ${detailsPropostal?.obs || "Sem observações"}
        </p>
      </div>

      ${
        detailsPropostal?.itemsIncluded
          ? `<div class="section">
            <h2>Itens incluídos</h2>
            <p style="white-space: pre-wrap;">${detailsPropostal.itemsIncluded}</p>
          </div>`
          : ""
      }

      ${
        detailsPropostal?.itemsNotIncluded
          ? `<div class="section">
            <h2 style="color: red;">Itens não incluídos</h2>
            <p style="white-space: pre-wrap; color: red;">${detailsPropostal.itemsNotIncluded}</p>
          </div>`
          : ""
      }

  <div class="section">
    <h2>Facilidade no pagamento e agilidade na entrega</h2>
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
      <li><strong>Valor final:</strong> R$ ${(discountTotalValue
        ? discountTotalValue + (detailsPropostal?.delivery || 0)
        : 0
      )
        .toFixed(2)
        .replace(".", ",")}</li>
    </ul>
  </div>
  <div style="display: flex; flex-direction: column; gap: 16px;">
      <div>
        <span style="font-weight: bold; font-size: 18px;">
          Por que escolher a 3 Irmãos Arte em Madeira de Demolição?
        </span>
        <ul style="padding-left: 24px; margin-top: 10px;">
          <li style="margin-bottom: 6px;">✅ Mais de 40 anos de experiência, garantindo qualidade e compromisso.</li>
          <li style="margin-bottom: 6px;">✅ Madeira nobre e sustentável, com excelente durabilidade.</li>
          <li style="margin-bottom: 6px;">✅ Acabamento exclusivo, agregando valor ao seu imóvel.</li>
          <li style="margin-bottom: 6px;">✅ Atendimento especializado, acompanhando cada etapa do seu projeto.</li>
        </ul>
      </div>

      <div style="margin-top: 24px;">
        <p style="font-weight: 600;">📞 Vamos conversar e alinhar os próximos passos?</p>
        <p style="font-weight: 600;">Atenciosamente,</p>

        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px; font-weight: 600;">
          <p>👤 ${detailsPropostal?.selectedSeller?.name}</p>
          <p>📧 ${detailsPropostal?.selectedSeller?.email}</p>
          <p>📞 ${detailsPropostal?.selectedSeller?.phone}</p>
          <p>📸 @3irmaosmadeirademolicao</p>
          <p>🌐 3irmaosmadeirademolicao.com.br</p>
        </div>
      </div>
    </div>
  </body>
</html>
  `;

      const browser = await puppeteer.launch({
        headless: true, // recomendação atual
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({ format: "A4" });

      await browser.close();

      res
        .status(200)
        .header("Content-Type", "application/pdf")
        .header(
          "Content-Disposition",
          `attachment; filename=pedido-${orderId}.pdf`
        )
        .send(pdfBuffer);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      res.status(500).json({ message: "Erro ao gerar PDF." });
    }
  }
}
