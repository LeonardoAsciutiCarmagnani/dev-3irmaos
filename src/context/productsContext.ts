import { Product } from "@/interfaces/Product";
import { create } from "zustand";

interface IProductsContext {
  productsInCart: Product[];
  handleAddProduct: (product: Product) => void;
  handleRemoveProduct: (productId: string) => void;
  handlingClearCart: () => void;
}

export const productsContext = create<IProductsContext>((set) => ({
  productsInCart: [],
  handleAddProduct: (product) =>
    set(({ productsInCart }) => {
      console.log("Recebendo produto na função", product);
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
      } else {
        return {
          productsInCart: [
            ...productsInCart,
            { ...product, quantidade: product.quantidade },
          ],
        };
      }
    }),
  /* Esas funcionalidade estará presente somente no popover do carrinho e na tela de checkout */
  handleRemoveProduct: (productId) =>
    set(({ productsInCart }) => {
      const updatedCart = productsInCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantidade: (item.quantidade ?? 0) - 1 }
            : item
        )
        .filter((item) => (item.quantidade ?? 0) > 0);

      return { productsInCart: updatedCart };
    }),
  handlingClearCart: () =>
    set(({ productsInCart }) => {
      const clearPropsProducts = productsInCart.map((product) => ({
        ...product,
        quantity: 0,
      }));

      return {
        productsInCart: clearPropsProducts,
      };
    }),
}));
