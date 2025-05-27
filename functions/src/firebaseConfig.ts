import * as admin from "firebase-admin";
import credentials from "./credentials.json";
import firebase from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(credentials as admin.ServiceAccount),
  });
}

const firestore = admin.firestore();

export { firestore, admin, firebase };
