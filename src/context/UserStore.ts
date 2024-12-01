import { create } from "zustand";

type UserStoreState = {
  typeUser: string | null;
  setTypeUser: (typeUser: string | null) => void;
  username: string | null;
  setUserName: (username: string | null) => void;
};

const useUserStore = create<UserStoreState>((set) => ({
  typeUser: null,
  setTypeUser: (typeUser) => set({ typeUser }),
  username: null,
  setUserName: (username) => set({ username }),
}));

export default useUserStore;
