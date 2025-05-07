import { Request, Response, NextFunction } from "express";
import { productService } from "../../services/hiper/fetchProducts";
import { z } from "zod";

// Validação rigorosa do query param
const listProductsSchema = z.string({
  required_error: "O parâmetro 'category' é obrigatório na query.",
  invalid_type_error: "A categoria deve ser uma string.",
});

export class ProductController {
  public static async GetAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.query.category) {
        throw new Error("Parâmetro 'category' não fornecido.");
      }

      const categoriaDecodificada = decodeURIComponent(
        req.query.category as string
      );
      const category = listProductsSchema.parse(categoriaDecodificada);

      console.log(`Buscando produtos da categoria: ${category}`);

      const apiResponse = await productService.fetchProducts();

      const filteredProducts = apiResponse.produtos.filter(
        (produto) => produto.categoria?.toLowerCase() === category.toLowerCase()
      );

      console.log("Produtos encontrados na categoria: ", filteredProducts);

      const filteredResponse = {
        ...apiResponse,
        produtos: filteredProducts,
      };

      res.status(200).json({
        success: true,
        products: filteredResponse,
      });
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      next(error);
    }
  }
}
