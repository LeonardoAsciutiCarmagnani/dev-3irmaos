import express, { Application } from "express";
import cors from "cors";
import { onRequest } from "firebase-functions/v2/https";
import {
  CEPController,
  OrderController,
  PricesListsController,
  ProductController,
  // PushController,
  UserController,
  errorHandler,
} from "./controllers/api";
import helmet from "helmet";
import morgan from "morgan";
import env from "./config/env";
import { Request } from "express";
import rateLimit from "express-rate-limit";

class App {
  private app: Application;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    this.app.set("trust proxy", true);
    // Security middlewares
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: env.CORS_ORIGIN,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      })
    );

    // Request parsing
    this.app.use(express.json({ limit: "10kb" }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: "Too many requests from this IP, please try again later",
      keyGenerator: (req: Request): string => {
        return req.ip || "unknown-ip";
      },
      validate: { ip: false },
    });

    this.app.use("/v1/", limiter);

    // Logging
    if (env.NODE_ENV === "development") {
      this.app.use(morgan("dev"));
    } else {
      this.app.use(morgan("combined"));
    }

    // Custom request logger
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      console.log(
        `[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip || "undefined"}`
      );
      next();
    });
  }

  private setupRoutes(): void {
    const router = express.Router();

    // ****API ROUTES**** \\
    //GET ROUTES
    router.get("/products", ProductController.getProducts);
    router.get("/prices-lists", PricesListsController.getAllPricesLists);
    router.get("/prices-lists/:id", PricesListsController.getPriceListById);
    //POST ROUTES
    router.post("/create-user", UserController.createUser);
    router.post("/create-prices-list", PricesListsController.createPriceList);
    router.post("/check-email", UserController.checkEmail);
    router.post("/post-order", OrderController.postOrderSale);
    router.post("/find-CEP", CEPController.getCEP);
    //PUT ROUTES
    router.put("/prices-lists/:id", PricesListsController.putPriceListById);
    router.put("/client/:id", UserController.putClientById);
    //DELETE ROUTES
    router.delete(
      "/prices-lists/:id",
      PricesListsController.deletePriceListById
    );
    router.delete("/client/:id", UserController.deleteUserById);
    // HEALTH CHECK ROUTE
    router.get("/health", (_, res) => {
      const agora = new Date();
      const dataHoraCorreta =
        agora
          .toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
          .replace(/\//g, "-")
          .replace(/, /g, "T")
          .replace(" ", "") + "Z";
      res.status(200).json({ status: "ok", timestamp: dataHoraCorreta });
    });

    // Apply routes with version prefix
    this.app.use("/v1", router);

    // Handle 404
    this.app.use((_, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found",
      });
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use(errorHandler);

    // Unhandled promise rejections
    process.on("unhandledRejection", (reason: Error) => {
      console.error("Unhandled Rejection:", reason);
      // You might want to do some cleanup here
    });

    // Uncaught exceptions
    process.on("uncaughtException", (error: Error) => {
      console.error("Uncaught Exception:", error);
      // You might want to do some cleanup here and exit gracefully
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
export const api = onRequest(app);

console.log(`Server started in ${env.NODE_ENV} mode`);
