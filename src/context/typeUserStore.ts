import { create } from "zustand";

type UserTypeState = {
  typeUser: string | null;
  setTypeUser: (typeUser: string | null) => void;
};

const useUserTypeStore = create<UserTypeState>((set) => ({
  typeUser: null,
  setTypeUser: (typeUser) => set({ typeUser }),
}));

export default useUserTypeStore;
