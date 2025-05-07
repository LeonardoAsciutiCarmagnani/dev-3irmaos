import axios from "axios";
import { tokenCache } from "../others/tokenCache";
import env from "../../config/env";
let tokenPromise: Promise<string> | null = null;

export const fetchToken = async (): Promise<string> => {
  console.log("Token ERPPOINT => ", env.API_SECRET_KEY_ERPPOINT);

  let token = tokenCache.get("token");

  if (!token) {
    if (!tokenPromise) {
      tokenPromise = new Promise(async (resolve, reject) => {
        try {
          const response = await axios.get(
            `${env.HIPER_API_URL}/auth/gerar-token/${env.API_SECRET_KEY_ERPPOINT}`
          );

          token = response.data.token;
          if (typeof token === "string") {
            tokenCache.set("token", token);
            console.log("Novo token gerado e armazenado no cache.");
            resolve(token);
          } else {
            reject(new Error("Token gerado não é uma string válida."));
          }
        } catch (error: any) {
          reject(new Error(`Erro ao gerar o token: ${error.message || error}`));
        } finally {
          tokenPromise = null;
        }
      });
    }
    token = await tokenPromise;
  } else {
    console.log("Token recuperado do cache.");
  }

  return token as string;
};

export { tokenCache };
