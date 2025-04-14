import { Request, Response, NextFunction } from "express";
import { productService } from "../../services/hiper/fetchProducts";

export class ProductController {
  public static async GetAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const Products = await productService.fetchProducts();
      res.status(200).json({
        success: true,
        products: Products,
      });
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      next(error);
    }
  }
}
