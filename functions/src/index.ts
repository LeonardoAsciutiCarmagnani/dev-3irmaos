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
    // router.get("/prices-lists", PricesListsController.getAllPricesLists);
    // router.get("/prices-lists/:id", PricesListsController.getPriceListById);
    // //POST ROUTES
    router.post("/create-client", UserController.createClient);
    // router.post("/create-prices-list", PricesListsController.createPriceList);
    // router.post("/check-email", UserController.checkEmail);
    router.post("/post-order", OrderController.postOrderInHiper);
    router.post("/post-budget", OrderController.createBudget);
    router.post("/create-adm", UserController.createAdmin);
    router.post("/generate-pdf", OrderController.generatePDF);
    router.post("/send-push-proposalSent", PushController.sendProposal);
    // router.post("/find-CEP", CEPController.getCEP);
    // //PUT ROUTES
    // router.put("/prices-lists/:id", PricesListsController.putPriceListById);
    // router.put("/client/:id", UserController.putClientById);
    // //DELETE ROUTES
    // router.delete(
    //   "/prices-lists/:id",
    //   PricesListsController.deletePriceListById
    // );
    // router.delete("/client/:id", UserController.deleteUserById);

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
    cors: ["https://dev-3irmaos.web.app"],
    maxInstances: 10,
  },
  app
);
