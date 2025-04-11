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
    set(({ productsInCart }) => {
      const findIndex = productsInCart.findIndex(
        (item) => item.id === product.id
      );

      const updatedProducts = [...productsInCart];
      if (findIndex !== -1) {
        updatedProducts[findIndex] = {
          ...updatedProducts[findIndex],
          quantidade:
            (updatedProducts[findIndex].quantidade || 1) +
            (product.quantidade || 1),
        };

        return {
          productsInCart: updatedProducts,
        };
      }

      return {
        productsInCart: [product],
      };
    }),
  /* Esas funcionalidade estará presente somente no popover do carrinho e na tela de checkout */
  handleRemoveProduct: (productId) =>
    set(({ productsInCart }) => {
      const removeItem = productsInCart.filter((item) => item.id !== productId);

      return { productsInCart: removeItem };
    }),
}));
