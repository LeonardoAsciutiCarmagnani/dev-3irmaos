// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);

export default {
  app,
  analytics,
};
