import { admin } from "../../firebaseConfig";
import { v4 as uuid } from "uuid";

interface UserFirestore {
  Id: string;
  Name: string;
  Email: string;
  Document: string;
  Phone: string;
  IE: string | null;
  FantasyName: string | null;
  Address: {
    Cep: string;
    Street: string;
    Number: number;
    Neighborhood: string;
    City: string;
    State: string;
    Ibge: string;
  };
  Password: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export type CreateClientResponse = {
  success: boolean;
  data?: UserFirestore;
  error?: string;
};

export class CreateClient {
  public static async execute(
    userData: Omit<UserFirestore, "Id" | "CreatedAt" | "UpdatedAt">
  ): Promise<CreateClientResponse> {
    const randomHash = uuid();
    try {
      const firestore = admin.firestore();

      const querySnapshot = await firestore
        .collection("clients")
        .where("clientDocument", "==", userData.Document)
        .get();

      if (!querySnapshot.empty) {
        return { success: false, error: "CNPJ/CPF já cadastrado." };
      }

      const auth = admin.auth();
      const createdUser = await auth.createUser({
        displayName: userData.Name,
        email: userData.Email,
        password: userData.Password,
        uid: randomHash,
      });

      await auth.setCustomUserClaims(createdUser.uid, {
        role: "client",
      });

      const userFirestoreData: UserFirestore = {
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
        .collection("clients")
        .doc(createdUser.uid)
        .set(userFirestoreData);

      return { success: true, data: userFirestoreData };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(`Service Create User fail! Error: ${error.message}`);
    }
  }
}
