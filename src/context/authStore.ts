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
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),

  setUser: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    set({ user });
  },

  login: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
    };
    set({ user });
    localStorage.setItem("loggedUser", JSON.stringify(user));
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
    localStorage.removeItem("loggedUser");
  },
}));

// Sincroniza o estado de autenticação ao carregar a aplicação
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    const user = { uid: firebaseUser.uid, email: firebaseUser.email };
    useAuthStore.getState().setUser(user);
  } else {
    useAuthStore.getState().setUser(null);
  }
});
