import { firestore } from "@/firebaseConfig";
import axios from "axios";
import { doc, setDoc } from "firebase/firestore";

import { create } from "zustand";

export interface PriceListProps {
  id: string;
  name: string;
}

export interface Product {
  ativo?: boolean;
  categoria?: string;
  codigo?: string;
  id: string;
  imagem?: string;
  nome: string;
  preco: number;
  quantidade: number;
  id_seq?: number;
}

interface ContextStates {
  totalValue: number;
  loading: boolean;
  error: string | null;
  products: Product[];
  countItemsInCart: number;
  listProductsInCart: Product[];
  priceLists: PriceListProps[];
  setProducts: () => void;
  setTotalValue: () => void;
  setCountItemsInCart: (count: number) => void;
  handleAddItemInList: (newProduct: Product) => void;
  handleRemoveItemFromCart: (productId: string) => void;
  updateDefaultFirebasePriceList: (fetchedProducts: Product[]) => Promise<void>;
  setPricesList: (list: PriceListProps) => void;
  filterPricesList: (id: string) => void;
  fetchPriceLists: () => void;
}

export const useZustandContext = create<ContextStates>((set) => ({
  countItemsInCart: 0,
  testCount: 0,
  listProductsInCart: [],
  loading: true,
  error: null,
  products: [],
  priceLists: [],
  totalValue: 0,

  setTotalValue: () =>
    set((state) => {
      const totalValue = state.listProductsInCart.reduce((acc, product) => {
        if (product.preco) {
          acc += product.preco * product.quantidade;
          return acc;
        }
        return acc;
      }, 0);

      return {
        totalValue: totalValue,
      };
    }),

  fetchPriceLists: async () => {
    try {
      const response = await axios.get(
        "https://us-central1-server-kyoto.cloudfunctions.net/api/v1/prices-lists"
      );

      console.log(response.data.pricesLists);

      // useZustandContext.getState().setPricesList(response.data.pricesLists);

      set(() => ({
        priceLists: response.data.pricesLists,
        loading: false,
      }));
    } catch (error) {
      console.error("Erro ao buscar listas de preços:", error);

      return {
        error: "Erro ao buscar listas de preços.",
        loading: false,
      };
    }
  },

  setPricesList: (list) =>
    set((state) => {
      const updatePricesList = [
        ...state.priceLists,
        { id: list.id, name: list.name },
      ];
      return {
        priceLists: updatePricesList,
      };
    }),
  filterPricesList: (id: string) =>
    set((state) => ({
      priceLists: state.priceLists.filter((list) => list.id !== id),
    })),

  updateDefaultFirebasePriceList: async (fetchedProducts) => {
    try {
      const priceListData = fetchedProducts.map((product) => ({
        id: product.id,
        preco: product.preco,
        nome: product.nome,
      }));

      await setDoc(doc(firestore, "default_prices-list", "DEFAULT"), {
        products: priceListData,
        updatedAt: new Date(),
      });

      console.log("Lista de preço padrão atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar lista de preço padrão", error);
    }
  },

  setProducts: async () => {
    try {
      const response = await axios.get(
        "https://us-central1-server-kyoto.cloudfunctions.net/api/v1/produtos"
      );
      let initialIdSeq = 0;
      const updateProductsList = response.data.products.produtos.map(
        (product: Product) => ({
          ...product,
          quantidade: 0,
          id_seq: (initialIdSeq += 1), // Inicializar quantidade como 0
        })
      );
      await useZustandContext
        .getState()
        .updateDefaultFirebasePriceList(updateProductsList);

      set({
        products: updateProductsList,
        loading: false,
      });
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      set({ loading: true, error: "Erro ao buscar produtos" });
    }
  },

  setCountItemsInCart: (count: number) =>
    set(() => ({ countItemsInCart: count + 1 })),

  handleAddItemInList: (newProduct) =>
    set((state) => {
      const { id, nome, preco } = newProduct;

      const existingProductIndex = state.listProductsInCart.findIndex(
        (product) => product.id === id
      );

      const updateList = [...state.listProductsInCart];
      let updateCountInCart = state.countItemsInCart;

      if (existingProductIndex !== -1) {
        updateList[existingProductIndex] = {
          ...updateList[existingProductIndex],
          quantidade: updateList[existingProductIndex].quantidade + 1,
        };
      } else {
        updateList.push({
          id,
          nome,
          preco,
          quantidade: 1, // Inicializar com quantidade 1
        });
      }

      const updateProducts = state.products.map((product) =>
        product.id === id
          ? { ...product, quantidade: product.quantidade + 1 }
          : product
      );

      updateCountInCart += 1;
      console.log(updateList);
      return {
        listProductsInCart: updateList,
        products: updateProducts,
        countItemsInCart: updateCountInCart,
      };
    }),

  handleRemoveItemFromCart: (productId) =>
    set((state) => {
      let updateCountInCard = state.countItemsInCart;

      const newList = state.listProductsInCart
        .map((item) => {
          if (item.id === productId) {
            updateCountInCard -= 1;

            return {
              ...item,
              quantidade: item.quantidade - 1,
            };
          }
          return item;
        })
        .filter((item) => item.quantidade > 0);

      const updateProducts = state.products.map((product) => {
        if (product.id === productId) {
          if (product.quantidade > 0) {
            return {
              ...product,
              quantidade: product.quantidade - 1,
            };
          } else {
            return {
              ...product,
              quantidade: 0,
            };
          }
        } else {
          return product;
        }
      });

      return {
        listProductsInCart: newList,
        products: updateProducts,
        countItemsInCart: Math.max(updateCountInCard, 0),
      };
    }),
}));
