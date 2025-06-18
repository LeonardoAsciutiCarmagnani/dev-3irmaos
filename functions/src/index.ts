import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { onRequest } from "firebase-functions/v2/https";
import env from "./config/env";
import { ProductController } from "./controllers/Product/productController";
import { UserController } from "./controllers/User/UserController";
import {
  BudgetType,
  OrderController,
} from "./controllers/Order/OrderController";
import { PushController } from "./controllers/Push/PushController";
import axios from "axios";

const errorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

interface PDFPlumRequest {
  templateName: string; // Nome do template (ex: "orcamento", "contrato")
  data: Record<string, any>; // Dados para preencher o template
  outputFileName?: string; // Nome do arquivo final
}

export const pdfPlumHandler = async (req: Request, res: Response) => {
  try {
    const { data, outputFileName }: PDFPlumRequest = req.body;

    // Validações básicas
    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Data é obrigatório",
      });
    }

    console.log("Dados recebidos para gerar PDF:", data);

    const {
      orderId,
      client,
      deliveryAddress,
      billingAddress,
      createdAt,
      products,
      clientImages,
      imagesUrls,
      detailsPropostal,
      discountTotalValue,
      totalValue,
      totalDiscount,
    } = data as BudgetType;

    // CORREÇÃO: Manter valores numéricos como números, não converter strings formatadas
    const deliveryValue = detailsPropostal?.delivery || 0;
    console.log("Valor da variavel deliveryValue =>", deliveryValue);
    const formattedDetailsPropostalDelivery = deliveryValue.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );

    const formattedDiscountTotalValue =
      ((discountTotalValue ?? 0) + deliveryValue)?.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }) || "R$ 0,00";

    console.log(
      "Valor total com desconto formatado => ",
      formattedDiscountTotalValue
    );
    const formattedTotalValue =
      totalValue?.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }) || "R$ 0,00";
    const formattedTotalDiscount =
      totalDiscount?.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }) || "R$ 0,00";

    const detailsObservation = detailsPropostal?.obs || "Sem observações";
    const detailsItemsIncluded = detailsPropostal?.itemsIncluded
      ?.trim()
      .split("\n")
      .filter((line) => line.trim() !== "");
    const detailsItemsNotIncluded = detailsPropostal?.itemsNotIncluded
      ?.trim()
      .split("\n")
      .filter((line) => line.trim() !== "");

    const detailsProposalPayment = detailsPropostal?.payment || "Não informado";
    const detailsProposalTime = detailsPropostal?.time || "Não informado";
    const detailsProposalSellerName =
      detailsPropostal?.selectedSeller?.name || "Não informado";
    const detailsProposalSellerPhone =
      detailsPropostal?.selectedSeller?.phone || "Não informado";
    const detailsProposalSellerEmail =
      detailsPropostal?.selectedSeller?.email || "Não informado";
    const showDiscount = products.some((item) => item.desconto);

    const updatedProducts = products.map((product) => {
      return {
        ...product,
        showDimensions:
          product.categoria !== "Assoalhos, Escadas, Decks e Forros" &&
          product.categoria !== "Antiguidades",
        preco: product.preco.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        desconto: product.desconto
          ? product.desconto.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : (0).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            }),
        totalValue: (
          product.preco * product.quantidade -
          (product.desconto ?? 0) * product.quantidade
        ).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
      };
    });

    // CORREÇÃO: Criar objeto limpo sem conversões problemáticas
    const detailsProposalFormatted = {
      ...detailsPropostal,
      obs: detailsObservation,
      delivery: deliveryValue, // Manter como número
      payment: detailsProposalPayment,
      time: detailsProposalTime,
      itemsIncluded: detailsItemsIncluded,
      itemsNotIncluded: detailsItemsNotIncluded,
      selectedSeller: {
        name: detailsProposalSellerName,
        phone: detailsProposalSellerPhone,
        email: detailsProposalSellerEmail,
      },
    };

    const formattedData = {
      orderId,
      client,
      deliveryAddress,
      billingAddress,
      createdAt,
      showDiscount,
      products: updatedProducts,
      clientImages,
      imagesUrls,
      detailsPropostal: detailsProposalFormatted,
      formattedDetailsPropostalDelivery,
      formattedTotalValue,
      formattedTotalDiscount,
      formattedDiscountTotalValue,
    };

    console.log(
      "Detalhes da proposta enviados para o PDFPLUM:",
      JSON.stringify(detailsProposalFormatted, null, 2)
    );
    console.log(
      "Produtos enviados para o PDFPLUM:",
      JSON.stringify(products, null, 2)
    );

    const templateName = "Template teste";

    const pdfPlumUrl =
      "https://us-central1-dev-3irmaos.cloudfunctions.net/ext-http-pdf-generator-executePdfGenerator";

    const templatePath =
      "dev-3irmaos.firebasestorage.app/template/template.zip";

    const pdfPlumPayload = {
      templatePath: templatePath,
      data: formattedData,
      returnPdfInResponse: true,
      outputFileName: outputFileName || `${templateName}-${Date.now()}.pdf`,
    };

    console.log(
      "Chamando PDFPLUM:",
      JSON.stringify(
        {
          templatePath,
          outputFileName: pdfPlumPayload.outputFileName,
          dataKeys: Object.keys(formattedData), // Log apenas as chaves para evitar logs gigantes
        },
        null,
        2
      )
    );

    const response = await axios.post(pdfPlumUrl, pdfPlumPayload, {
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    });

    if (response.status !== 200) {
      throw new Error(`PDFPLUM retornou status ${response.status}`);
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdfPlumPayload.outputFileName}"`
    );
    res.setHeader("Content-Length", response.data.length.toString());

    res.send(response.data);

    console.log("PDF gerado com sucesso:", {
      fileName: pdfPlumPayload.outputFileName,
    });
  } catch (error: any) {
    console.error("Erro ao gerar PDF com PDFPLUM:", {
      error: error.message,
      stack: error.stack,
      response: error.response?.data,
    });

    if (error.code === "ECONNABORTED") {
      return res.status(408).json({
        success: false,
        message: "Timeout ao gerar PDF - tente novamente",
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message:
          "Template não encontrado. Verifique se o arquivo existe no Storage.",
      });
    }

    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        message: "Erro nos dados enviados para geração do PDF",
      });
    }

    res.status(500).json({
      success: false,
      message: "Erro interno ao gerar PDF",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

class App {
  private app: Application;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    this.app.use((req, res, next) => {
      res.set("Access-Control-Allow-Origin", "https://dev-3irmaos.web.app");
      res.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.set("Access-Control-Max-Age", "3600");

      if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
      }

      next();
    });

    this.app.use(
      cors({
        origin: env.CORS_ORIGIN,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false,
      })
    );
  }

  private setupRoutes(): void {
    const router = express.Router();

    // ****API ROUTES**** \\
    //GET ROUTES
    router.get("/get-products", ProductController.GetAll);

    //POST ROUTES

    router.post("/create-client", UserController.createClient);
    router.post("/post-order", OrderController.postOrderInHiper);
    router.post("/post-budget", OrderController.createBudget);
    router.post("/post-order", OrderController.postOrderInHiper);
    router.post("/create-adm", UserController.createAdmin);
    router.post("/generate-pdf", pdfPlumHandler);

    // PUSH ROUTES
    router.post("/send-push-createBudget", PushController.createdBudget);
    router.post("/send-push-createClient", PushController.createClient);
    router.post("/send-push-createBudgetADM", PushController.createdBudgetADM);
    router.post("/send-push-proposalSent", PushController.sendProposal);
    router.post("/send-push-proposalRejected", PushController.proposalRejected);
    router.post("/send-push-proposalAccepted", PushController.proposalAccepted);
    router.post("/send-push-proposalApproved", PushController.proposalApproved);
    router.post(
      "/send-push-proposalInProduction",
      PushController.proposalInProduction
    );
    router.post(
      "/send-push-proposalDispatched",
      PushController.proposalDispatched
    );
    router.post(
      "/send-push-proposalCompleted",
      PushController.proposalCompleted
    );

    this.app.use("/v1", router);
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);

    process.on("unhandledRejection", (reason: any, promise) => {
      console.error("Unhandled Rejection:", reason);
    });

    process.on("uncaughtException", (error: Error) => {
      console.error("Uncaught Exception:", error);
      process.exit(1);
    });
  }

  public getApp(): Application {
    return this.app;
  }
}

const application = new App();
const app = application.getApp();

console.log(`Server started in ${env.NODE_ENV} mode`);

export const api = onRequest(
  {
    timeoutSeconds: 120,
    memory: "1GiB",
    cors: ["https://dev-3irmaos.web.app"],
  },
  app
);
