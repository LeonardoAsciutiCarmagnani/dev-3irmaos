import { firestore } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";

type UserStoreState = {
  typeUser: string | null;
  setTypeUser: (typeUser: string | null) => void;
  username: string | null;
  setUserName: (username: string | null) => void;
  getUidFromLocalStorage: () => string;
  fetchUserName: () => Promise<string | null>;
  fetchTypeUser: () => void;
  fetchSaveUsername: () => void;
};

const useUserStore = create<UserStoreState>((set) => ({
  typeUser: null,
  setTypeUser: (typeUser) => set({ typeUser }),
  username: null,
  setUserName: (username) => set({ username }),
  getUidFromLocalStorage: () => {
    const userJSON = localStorage.getItem("loggedUser");
    if (userJSON) {
      try {
        const user = JSON.parse(userJSON);
        return user?.uid || null;
      } catch (e) {
        console.error("Erro ao parsear o objeto user do localStorage", e);
        return null;
      }
    }
    return null;
  },
  fetchUserName: async () => {
    const id = useUserStore.getState().getUidFromLocalStorage();

    if (!id) {
      console.error("ID não encontrado no localStorage.");
      return null;
    }

    try {
      const clientDoc = doc(firestore, "clients", id);
      const docSnap = await getDoc(clientDoc);
      console.log("Requisição feita");

      if (docSnap.exists()) {
        const userName: string = docSnap.data()?.user_name;
        localStorage.setItem("userName", userName);

        return userName || null;
      } else {
        console.error("Documento não encontrado.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar user_name no Firestore:", error);
      return null;
    }
  },
  fetchTypeUser: async () => {
    const id = useUserStore.getState().getUidFromLocalStorage();

    if (!id) {
      console.error("ID não encontrado no localStorage.");
      return null;
    }

    try {
      const clientDoc = doc(firestore, "clients", id);
      const docSnap = await getDoc(clientDoc);
      console.log("Tipo do usuário encontrado.");

      if (docSnap.exists()) {
        const typeUser = docSnap.data()?.type_user || null;

        useUserStore.getState().setTypeUser(typeUser);

        return typeUser;
      } else {
        console.error("Usuário não encontrado.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar user_name no Firestore:", error);
      return null;
    }
  },
  fetchSaveUsername: async () => {
    const localStorageName = localStorage.getItem("userName");

    if (!localStorageName) {
      console.log("Buscando username...");
      const name = await useUserStore.getState().fetchUserName();
      console.log("Nome: ", name);
      if (name) {
        localStorage.setItem("userName", name);
        useUserStore.getState().setUserName(name);
      }
    } else {
      useUserStore.getState().setUserName(localStorageName);
    }
  },
}));

export default useUserStore;
