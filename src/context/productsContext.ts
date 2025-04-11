import { Product } from "@/interfaces/Product";
import { create } from "zustand";

interface IProductsContext {
  productsInCart: Product[];
  handleAddProduct: (product: Product) => void;
  handleRemoveProduct: (productId: string) => void;
}

export const productsContext = create<IProductsContext>((set) => ({
  productsInCart: [],
  handleAddProduct: (product) =>
    set(() => {
      console.log("Produto rebecido: ", product);
      return {};
    }),
  handleRemoveProduct: (productId) =>
    set(() => {
      console.log(productId);
      return {};
    }),
}));
