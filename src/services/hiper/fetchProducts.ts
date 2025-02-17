import axios from "axios";
import { fetchToken, tokenCache } from "../hiper/fetchToken";
import { admin } from "../../firebaseConfig";

interface Product {
  id: string;
  preco: number;
  nome: string;
  imagem?: string;
  categoria?: string;
  grade: boolean;
  produtoPrimarioId?: string;
}

interface ProductConfig {
  id: string;
  disponivel: boolean;
  ultimaAtualizacao: Date;
}

interface ApiResponse {
  pontoDeSincronizacao: number;
  produtos: Product[];
  errors: any[];
  message: string | null;
}

export const fetchProducts = async (): Promise<ApiResponse> => {
  try {
    let token = await fetchToken();

    const response = await axios.get(
      "http://ms-ecommerce.hiper.com.br/api/v1/produtos/pontoDeSincronizacao?pontoDeSincronizacao=0",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const disponibilityRef = admin.firestore().collection("productsConfig");
    const disponibilitySnapshot = await disponibilityRef.get();

    const existingConfigurations = disponibilitySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as ProductConfig)
    );

    const productsWithDisponibility = response.data.produtos.map(
      (product: Product) => {
        const productConfig = existingConfigurations.find(
          (config) => config.id === product.id
        );

        if (!productConfig) {
          disponibilityRef.doc(product.id).set({
            disponivel: false,
            ultimaAtualizacao: new Date(),
          });
        }
        return {
          ...product,
          disponivel: productConfig ? productConfig.disponivel : false,
        };
      }
    );

    return {
      ...response.data,
      produtos: productsWithDisponibility,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const newToken = await fetchToken();
      tokenCache.set("token", newToken);
      return fetchProducts();
    } else {
      throw error;
    }
  }
};
