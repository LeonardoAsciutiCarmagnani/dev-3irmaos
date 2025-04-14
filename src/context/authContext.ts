import { create } from "zustand";
import { auth } from "@/_components/Utils/FirebaseConfig";
import {
  signInWithEmailAndPassword,
  signOut,
  getIdTokenResult,
} from "firebase/auth";

interface AuthState {
  uid: string;
  email: string | null;
  accessToken: string;
  displayName: string | null;
  role: string;
}

interface AuthStore {
  user: AuthState | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthState | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,
  initialized: false,

  login: async (email, password) => {
    set({ error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);

      const user = auth.currentUser;
      if (user) {
        const idTokenResult = await getIdTokenResult(user, true);
        const role =
          typeof idTokenResult.claims.role === "string"
            ? idTokenResult.claims.role
            : "";
        const accessToken = await user.getIdToken();

        console.log("Acesso do usuário:", role);
        set({
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            accessToken,
            role,
          },
        });
      }
    } catch (error) {
      let errorMessage = "Erro ao fazer login.";
      if (error instanceof Error) {
        switch (error.message) {
          case "auth/invalid-email":
            errorMessage = "E-mail inválido.";
            break;
          case "auth/user-disabled":
            errorMessage = "Usuário desativado.";
            break;
          case "auth/user-not-found":
          case "auth/wrong-password":
            errorMessage = "E-mail ou senha incorretos.";
            break;
          default:
            errorMessage = error.message;
        }
      }

      set({ error: errorMessage });
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      set({ user: null });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Erro ao deslogar",
      });
    }
  },

  setUser: (user) => set({ user, loading: false, initialized: true }),
  clearError: () => set({ error: null }),
}));

auth.onAuthStateChanged(async (firebaseUser) => {
  if (firebaseUser) {
    const accessToken = await firebaseUser.getIdToken();
    const idTokenResult = await getIdTokenResult(firebaseUser, true);
    const role =
      typeof idTokenResult.claims.role === "string"
        ? idTokenResult.claims.role
        : "";
    useAuthStore.getState().setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      accessToken,
      role,
    });
  } else {
    useAuthStore.setState({ user: null, loading: false, initialized: true });
  }
});
