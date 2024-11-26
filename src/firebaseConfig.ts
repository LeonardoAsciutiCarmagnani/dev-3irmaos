// Import the functions you need from the SDKs
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
  apiKey: "AIzaSyAZmL9j0W_LOVkAA1KOwc80XIOxQWiu740",
  authDomain: "kyoto-f1764.firebaseapp.com",
  projectId: "kyoto-f1764",
  storageBucket: "kyoto-f1764.firebasestorage.app",
  messagingSenderId: "638846069672",
  appId: "1:638846069672:web:8225aebc75777eee744b9d",
  measurementId: "G-W5ZN56VVBG",
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
