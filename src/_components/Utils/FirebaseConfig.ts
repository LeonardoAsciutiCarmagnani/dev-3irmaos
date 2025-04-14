// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC5wpdPZe_msHwfontjvlsgjrhEKaLy0OU",
  authDomain: "dev-3irmaos.firebaseapp.com",
  projectId: "dev-3irmaos",
  storageBucket: "dev-3irmaos.firebasestorage.app",
  messagingSenderId: "245791207453",
  appId: "1:245791207453:web:c3bc9a93f30721827b56f4",
  measurementId: "G-Z3B8WZJXFT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistência configurada para armazenamento local.");
  })
  .catch((error) => {
    console.error("Erro ao configurar a persistência:", error);
  });

export default { app };
