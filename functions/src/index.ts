import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { onRequest } from "firebase-functions/v2/https";
import {
  CEPController,
  OrderController,
  ProductController,
  UserController,
} from "./controllers/api";
import helmet from "helmet";
import morgan from "morgan";
import env from "./config/env";

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
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: env.CORS_ORIGIN,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false,
      })
    );

    // Logging
    if (env.NODE_ENV === "development") {
      this.app.use(morgan("dev"));
    } else {
      this.app.use(morgan("combined"));
    }

    // Custom request logger
    this.app.use((req, res, next) => {
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${
          req.ip
        }`
      );
      next();
    });
  }

  private setupRoutes(): void {
    const router = express.Router();

    // ****API ROUTES**** \\
    //GET ROUTES
    router.get("/get-products", ProductController.getProducts);
    // router.get("/prices-lists", PricesListsController.getAllPricesLists);
    // router.get("/prices-lists/:id", PricesListsController.getPriceListById);
    // //POST ROUTES
    // router.post("/create-user", UserController.createUser);
    // router.post("/create-prices-list", PricesListsController.createPriceList);
    // router.post("/check-email", UserController.checkEmail);
    // router.post("/post-order", OrderController.postOrderSale);
    // router.post("/post-budget", OrderController.postBudget);
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
    // HEALTH CHECK ROUTE

    // Apply routes with version prefix
    this.app.use("/v1", router);

    // Handle 404
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

export const api = onRequest(app);
