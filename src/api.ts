import { fetchProducts } from "./services/hiper/fetchProducts";
import { Request, Response, NextFunction } from "express";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const getProductsHiper = await fetchProducts();
    const productsHiper = getProductsHiper.produtos;
    console.log("Produtos Hiper", productsHiper);

    res.json({ productsHiper });
  } catch (e) {
    next(e);
  }
};
