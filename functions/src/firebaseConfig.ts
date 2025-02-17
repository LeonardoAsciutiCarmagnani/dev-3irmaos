import * as admin from "firebase-admin";
import credentials from "./credentials.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(credentials as admin.ServiceAccount),
    databaseURL: "https://neresbazar.firebaseio.com",
  });
}

const firestore = admin.firestore();

export { firestore, admin };
