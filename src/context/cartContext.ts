import axios from "axios";
import { create } from "zustand";
import { useAuthStore } from "./authStore";
import apiBaseUrl from "@/lib/apiConfig";
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
  descricao: string;
  peso: number;
}

interface ContextStates {
  totalValue: number;
  loading: boolean;
  error: string | null;
  products: Product[];
  countItemsInCart: number;
  listProductsInCart: Product[];
  priceLists: PriceListProps[];
  isMobile: boolean;
  setIsMobile: (type: boolean) => void;
  setProducts: () => void;
  clearListProductsInCart: (list: Product[]) => void;
  setTotalValue: () => void;
  setCountItemsInCart: (count: number) => void;
  handleAddItemInList: (newProduct: Product) => void;
  handleRemoveItemFromCart: (productId: string) => void;
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
  isMobile: false,

  setIsMobile: () => set({ isMobile: true }),

  clearListProductsInCart: () =>
    set(() => {
      return {
        listProductsInCart: [],
        countItemsInCart: 0,
      };
    }),

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
      const response = await axios.get(`${apiBaseUrl}/prices-lists`);

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

  setProducts: async () => {
    const { user } = useAuthStore.getState();
    if (!user?.accessToken) {
      console.error("Token JWT não disponível.");
      set({ loading: false, error: "Usuário não autenticado." });
      return;
    }
    try {
      console.log("Requisitando produtos ao back-end...");
      const response = await axios.get(`${apiBaseUrl}/products`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
      let initialIdSeq = 0;
      /* quando estiver consultando os produtos na base da Multipoint, altere para  
      'response.data.products.produtos'
      valor original 'response.data.products'
      */
      const products = response.data.data;
      const updateProductsList = products.map((product: Product) => ({
        ...product,
        quantidade: 0,
        id_seq: (initialIdSeq += 1),
      }));
      set({
        products: updateProductsList,
        loading: false,
        error: null,
      });
      console.log(updateProductsList);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      set({ loading: true, error: "Erro ao buscar produtos" });
    }
  },

  setCountItemsInCart: (count: number) =>
    set(() => ({ countItemsInCart: count + 1 })),

  handleAddItemInList: (newProduct) =>
    set((state) => {
      const { id, nome, preco, imagem, categoria, descricao, peso } =
        newProduct;

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
          categoria,
          quantidade: 1,
          imagem,
          descricao,
          peso,
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
