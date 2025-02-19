import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyjujL6BGlNM6RtKUS2KAWuxSBqFcX3M4",
  authDomain: "exata-3b42b.firebaseapp.com",
  projectId: "exata-3b42b",
  storageBucket: "exata-3b42b.firebasestorage.app",
  messagingSenderId: "595519347118",
  appId: "1:595519347118:web:2aaa1012441d2a48d6903f",
  measurementId: "G-1Z6ZX46SFY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);

export {
  app,
  auth,
  firestore,
  analytics,
  doc,
  collection,
  getDoc,
  updateDoc,
  addDoc,
};
