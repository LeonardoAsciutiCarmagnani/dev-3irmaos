import { Request, Response, NextFunction } from "express";
import { productService } from "../../services/hiper/fetchProducts";
import { z } from "zod";

// Validação do query param opcional
const listProductsSchema = z.object({
  category: z.string().optional(),
});

export class ProductController {
  public static async GetAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validar e obter a categoria do query param, se existir
      const queryParams = listProductsSchema.parse({
        category: req.query.category
          ? decodeURIComponent(req.query.category as string)
          : undefined,
      });

      const category = queryParams.category;

      if (category) {
        console.log(`Buscando produtos da categoria: ${category}`);
      } else {
        console.log("Buscando todos os produtos");
      }

      // Buscar todos os produtos da API
      const apiResponse = await productService.fetchProducts();

      // Verificar se há categoria especificada para filtrar
      if (category) {
        const filteredProducts = apiResponse.produtos.filter(
          (produto) =>
            produto.categoria?.toLowerCase() === category.toLowerCase()
        );

        console.log(
          `Total de produtos encontrados na categoria ${category}: ${filteredProducts.length}`
        );

        // Retornar produtos filtrados com a estrutura original
        const filteredResponse = {
          ...apiResponse,
          produtos: filteredProducts,
        };

        res.status(200).json({
          success: true,
          products: filteredResponse,
        });
      } else {
        // Quando não há categoria especificada, retornar todos os produtos
        res.status(200).json({
          success: true,
          products: apiResponse,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      next(error);
    }
  }
}
