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
  apiKey: "AIzaSyBhGrmKMl87ENDG0HUHRwFKouggufm-yyY",
  authDomain: "server-kyoto.firebaseapp.com",
  projectId: "server-kyoto",
  storageBucket: "server-kyoto.appspot.com",
  messagingSenderId: "1046472904539",
  appId: "1:1046472904539:web:623b43335c4d7dce0b147e",
  measurementId: "G-0XNJSQ6N6G",
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
