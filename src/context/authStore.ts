import { create } from "zustand";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
  registerUser: (email: string, password: string) => Promise<void>;
  isCreatingUser: boolean;
  setIsCreatingUser: (isCreating: boolean) => void;
}

const storedUser = localStorage.getItem("loggedUser");

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  isCreatingUser: false,

  setIsCreatingUser: (isCreating) => {
    set({ isCreatingUser: isCreating });
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem("loggedUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("loggedUser");
    }
    set({ user });
  },

  login: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;
    const accessToken = await firebaseUser.getIdToken();

    const user: AuthUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      accessToken,
    };

    set({ user });
    localStorage.setItem("loggedUser", JSON.stringify(user));
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
    localStorage.removeItem("loggedUser");
  },

  registerUser: async (email, password) => {
    const { setIsCreatingUser } = useAuthStore.getState();

    setIsCreatingUser(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Usuário criado com sucesso:", userCredential.user);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
    } finally {
      setIsCreatingUser(false);
    }
  },
}));

onAuthStateChanged(auth, async (firebaseUser) => {
  const { isCreatingUser, setUser } = useAuthStore.getState();

  console.log("onAuthStateChanged chamado. isCreatingUser:", isCreatingUser);

  if (isCreatingUser) {
    // Ignora alterações durante o registro
    return;
  }

  if (firebaseUser) {
    const accessToken = await firebaseUser.getIdToken();
    const user: AuthUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      accessToken,
    };

    setUser(user);
  } else {
    setUser(null);
  }
});
