import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { onRequest } from "firebase-functions/v2/https";

import helmet from "helmet";
import morgan from "morgan";
import env from "./config/env";
import { ProductController } from "./controllers/Product/productController";
import { UserController } from "./controllers/User/UserController";
import { OrderController } from "./controllers/Order/OrderController";
import { CreateAdmin } from "./services/User/createAdmin";
import proposalSent from "./services/chat4sales/push/proposalSent";
import { PushController } from "./controllers/Push/PushController";
import puppeteer from "puppeteer-core";
import chromium from "chrome-aws-lambda";

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

export const testPdfHandler = async (req: Request, res: Response) => {
  const html = `<html><body><h1>PDF de Teste</h1></body></html>`;

  try {
    console.log("Lançando o Puppeteer...");

    const executablePath = await chromium.executablePath;
    if (!executablePath) {
      throw new Error("Caminho do Chromium não encontrado!");
    }
    console.log("Caminho do Chromium:", executablePath);

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: chromium.headless,
      ignoreDefaultArgs: ["--disable-extensions"], // ajuda a reduzir falhas
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({ format: "A4" });

    await browser.close();

    res.status(200).set("Content-Type", "application/pdf").send(pdf);
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    res.status(500).send("Erro ao gerar PDF");
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

    router.post("/create-client", UserController.createClient);

    router.post("/post-budget", OrderController.createBudget);
    router.post("/post-order", OrderController.postOrderInHiper);
    router.post("/create-adm", UserController.createAdmin);
    router.post("/generate-pdf", testPdfHandler);

    // PUSH ROUTES

    router.post("/send-push-createBudget", PushController.createdBudget);
    router.post("/send-push-proposalSent", PushController.sendProposal);
    router.post("/send-push-proposalRejected", PushController.proposalRejected);
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
