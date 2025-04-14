import { admin } from "../../firebaseConfig";
import { v4 as uuid } from "uuid";

interface AdmFirestore {
  Id: string;
  Name: string;
  Email: string;
  Password: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export type CreateAdminResponse = {
  success: boolean;
  data?: AdmFirestore;
  error?: string;
};

export class CreateAdmin {
  public static async execute(
    userData: Omit<AdmFirestore, "Id" | "CreatedAt" | "UpdatedAt">
  ): Promise<CreateAdminResponse> {
    const randomHash = uuid();
    try {
      const firestore = admin.firestore();

      const querySnapshot = await firestore
        .collection("internal_users")
        .where("clientDocument", "==", userData.Email)
        .get();

      if (!querySnapshot.empty) {
        return { success: false, error: "E-mail já cadastrado." };
      }

      const auth = admin.auth();
      const createdUser = await auth.createUser({
        displayName: userData.Name,
        email: userData.Email,
        password: userData.Password,
        uid: randomHash,
      });

      await auth.setCustomUserClaims(createdUser.uid, {
        role: "admin",
      });

      const userFirestoreData: AdmFirestore = {
        ...userData,
        Id: createdUser.uid,
        CreatedAt: new Date().toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        UpdatedAt: new Date().toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };

      await admin
        .firestore()
        .collection("internal_users")
        .doc(createdUser.uid)
        .set(userFirestoreData);

      return { success: true, data: userFirestoreData };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(`Service Create User fail! Error: ${error.message}`);
    }
  }
}
