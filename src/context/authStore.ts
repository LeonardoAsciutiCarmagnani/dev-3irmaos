import { create } from "zustand";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

interface AuthUser {
  uid: string;
  email: string | null;
  accessToken: string;
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Inicializa o usuário com base no localStorage
  user: JSON.parse(localStorage.getItem("user") || "null"),

  setUser: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user)); // Armazena o usuário completo no localStorage
    } else {
      localStorage.removeItem("user");
    }
    set({ user });
  },

  login: async (email, password) => {
    // Realiza o login com Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Obtém o token JWT
    const accessToken = await firebaseUser.getIdToken();

    // Cria o objeto do usuário com token
    const user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      accessToken,
    };

    // Atualiza o estado global e localStorage
    set({ user });
    localStorage.setItem("user", JSON.stringify(user));
  },

  logout: async () => {
    // Realiza o logout no Firebase
    await signOut(auth);

    // Remove o estado e limpa o localStorage
    set({ user: null });
    localStorage.removeItem("user");
  },
}));

// Sincroniza o estado de autenticação ao carregar a aplicação
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    // Se o usuário estiver autenticado, obtenha o token
    const accessToken = await firebaseUser.getIdToken();
    const user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      accessToken,
    };

    // Atualiza o estado global
    useAuthStore.getState().setUser(user);
  } else {
    // Se não houver usuário, limpa o estado
    useAuthStore.getState().setUser(null);
  }
});
