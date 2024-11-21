import { create } from "zustand";

interface TotalStore {
  total: number;
  setTotal: (value: number) => void;
}

export const usePostOrderStore = create<TotalStore>((set) => ({
  total: 0,
  setTotal: (value) => set({ total: value }),
}));
