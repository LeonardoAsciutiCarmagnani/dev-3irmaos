import { admin } from "../../firebaseConfig";
import { v4 as uuid } from "uuid";

interface Client {
  Id: string;
  name: string;
  email: string;
  document: string;
  phone: string;
  ie: string | null;
  fantasyName: string | null;
  address: {
    cep: string;
    street: string;
    number: number;
    neighborhood: string;
    city: string;
    state: string;
    ibge: string;
  };
  password: string;
  createdAt: string;
  updatedAt: string;
}

interface UserFirestore {
  Id: string;
  name: string;
  email: string;
  document: string;
  phone: string;
  ie: string | null;
  fantasyName: string | null;
  address: {
    cep: string;
    street: string;
    number: number;
    neighborhood: string;
    city: string;
    state: string;
    ibge: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type CreateClientResponse = {
  success: boolean;
  data?: UserFirestore;
  error?: string;
};

export class CreateClient {
  public static async execute(
    userData: Omit<Client, "Id" | "createdAt" | "updatedAt">
  ): Promise<CreateClientResponse> {
    const randomHash = uuid();
    try {
      const firestore = admin.firestore();

      const querySnapshot = await firestore
        .collection("clients")
        .where("clientDocument", "==", userData.document)
        .get();

      if (!querySnapshot.empty) {
        return { success: false, error: "CPF/CNPJ já cadastrado." };
      }

      const auth = admin.auth();
      const createdUser = await auth.createUser({
        displayName: userData.name,
        email: userData.email,
        password: userData.password,
        uid: randomHash,
      });

      await auth.setCustomUserClaims(createdUser.uid, {
        role: "client",
      });

      const { password, ...userWithoutPassword } = userData;

      const userFirestoreData: UserFirestore = {
        ...userWithoutPassword,
        Id: createdUser.uid,
        createdAt: new Date().toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        updatedAt: new Date().toLocaleString("pt-BR", {
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
