import { firestore } from "@/firebaseConfig";
import axios from "axios";
import { doc, setDoc } from "firebase/firestore";

import { create } from "zustand";

export interface PriceListProps {
  id: string;
  name: string;
}

export interface Product {
  pontoDeSincronizacao: number;
  altura: number;
  ativo: number;
  categoria: string;
  codigo: string;
  comprimento: number;
  descricao: string;
  grade: string;
  id: string;
  imagem: string;
  imagensAdicionais: string;
  largura: number;
  marca: string;
  ncm: string;
  nome: string;
  peso: number;
  preco: number;
  quantity: number;
  id_seq: number;
}

interface ContextStates {
  loading: boolean;
  error: string | null;
  products: Product[];
  countItemsInCart: number;
  listProductsInCart: Product[];
  priceLists: PriceListProps[];
  setProducts: () => void;
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

  filterPricesList: (id) =>
    set((state) => {
      const filteredPricesList = [...state.priceLists];
      filteredPricesList.filter((list) => list.id !== id);

      return {
        priceLists: filteredPricesList,
      };
    }),

  updateDefaultFirebasePriceList: async (fetchedProducts) => {
    try {
      const priceListData = fetchedProducts.map((product) => ({
        id: product.id,
        value: product.preco,
        name: product.nome,
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
          quantity: 0,
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
      const existingProductIndex = state.listProductsInCart.findIndex(
        (product) => product.id === newProduct.id
      );

      const updateList = [...state.listProductsInCart];
      let updateCountInCard = 0;
      if (existingProductIndex !== -1) {
        updateCountInCard = state.countItemsInCart + 1;
        updateList[existingProductIndex] = {
          ...updateList[existingProductIndex],
          quantity: updateList[existingProductIndex].quantity + 1,
        };
      } else {
        updateCountInCard = state.countItemsInCart + 1;
        updateList.push({ ...newProduct, quantity: 1 });
      }

      const updateProducts = state.products.map((product) =>
        product.id === newProduct.id
          ? { ...product, quantity: product.quantity + 1 }
          : product
      );

      return {
        listProductsInCart: updateList,
        products: updateProducts,
        countItemsInCart: updateCountInCard,
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
              quantity: item.quantity - 1,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      const updateProducts = state.products.map((product) => {
        if (product.id === productId) {
          if (product.quantity > 0) {
            return {
              ...product,
              quantity: product.quantity - 1,
            };
          } else {
            return {
              ...product,
              quantity: 0,
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
