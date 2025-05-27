import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { onRequest } from "firebase-functions/v2/https";
import env from "./config/env";
import { ProductController } from "./controllers/Product/productController";
import { UserController } from "./controllers/User/UserController";
import { OrderController } from "./controllers/Order/OrderController";
import { PushController } from "./controllers/Push/PushController";
import puppeteer from "puppeteer-core";
import chromium from "chrome-aws-lambda";
import { getFunctions } from "firebase-admin/functions";
import { onCall } from "firebase-functions/v2/https";
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

interface PDFPlumResponse {
  success: boolean;
  message?: string;
  fileName?: string;
  downloadUrl?: string;
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

    const templateName = "Template teste";

    // URL da extensão PDFPLUM instalada no seu projeto
    const pdfPlumUrl =
      "https://us-central1-dev-3irmaos.cloudfunctions.net/ext-http-pdf-generator-executePdfGenerator";

    // Construir o caminho do template
    const templatePath =
      "dev-3irmaos.firebasestorage.app/template/template.zip";

    // Payload para o PDFPLUM
    const pdfPlumPayload = {
      templatePath: templatePath,
      data: data,
      returnPdfInResponse: true, // Retorna PDF diretamente
      outputFileName: outputFileName || `${templateName}-${Date.now()}.pdf`,
    };

    console.log("Chamando PDFPLUM", {
      templatePath,
      outputFileName: pdfPlumPayload.outputFileName,
      data: data,
    });

    // Fazer a requisição para a extensão
    const response = await axios.post(pdfPlumUrl, pdfPlumPayload, {
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    });

    console.log("Reponse PDFPLUM", response);

    // Verificar se a resposta foi bem-sucedida
    if (response.status !== 200) {
      throw new Error(`PDFPLUM retornou status ${response.status}`);
    }

    // Retornar o PDF diretamente
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdfPlumPayload.outputFileName}"`
    );
    res.setHeader("Content-Length", response.data.length.toString());

    res.send(response.data);

    console.log("PDF gerado com sucesso", {
      fileName: pdfPlumPayload.outputFileName,
    });
  } catch (error: any) {
    console.log("Erro ao gerar PDF com PDFPLUM", {
      error: error.message,
      stack: error.stack,
      response: error.response?.data,
    });

    // Tratamento específico de erros
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
    // Modificação principal: CORS configurado de forma mais explícita
    this.app.use((req, res, next) => {
      res.set("Access-Control-Allow-Origin", "https://dev-3irmaos.web.app");
      res.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.set("Access-Control-Max-Age", "3600");

      // Handle OPTIONS requests
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
    router.post("/create-adm", UserController.createAdmin);
    router.post("/generate-pdf-test", pdfPlumHandler);

    // PUSH ROUTES
    router.post("/send-push-createBudget", PushController.createdBudget);
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
    // Middleware global de erros
    this.app.use(errorHandler);

    // Captura rejeições de promises não tratadas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    process.on("unhandledRejection", (reason: any, promise) => {
      console.error("Unhandled Rejection:", reason);
    });

    // Captura exceções não tratadas
    process.on("uncaughtException", (error: Error) => {
      console.error("Uncaught Exception:", error);
      process.exit(1);
    });
  }

  public getApp(): Application {
    return this.app;
  }
}

// Initialize app
const application = new App();
const app = application.getApp();

// Export for Firebase Functions
console.log(`Server started in ${env.NODE_ENV} mode`);

export const api = onRequest(
  {
    timeoutSeconds: 120,
    memory: "1GiB",
    cors: ["https://dev-3irmaos.web.app"],
  },
  app
);
