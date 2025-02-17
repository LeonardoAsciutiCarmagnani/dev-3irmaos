import axios, { AxiosInstance } from "axios";
import { fetchToken } from "./fetchToken";
import env from "../../config/env";
import { firestore } from "../../firebaseConfig";
import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

// Interfaces
interface Product {
  id: string;
  preco: number;
  nome: string;
  imagem?: string;
  categoria?: string;
  descricao?: string;
}

interface ApiResponse {
  pontoDeSincronizacao: number;
  produtos: Product[];
  errors: any[];
  message: string | null;
}

// Constants
const API_CONFIG = {
  baseURL: env.HIPER_API_URL,
  timeout: 10000,
} as const;

class ProductService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create(API_CONFIG);
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await fetchToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  public async fetchProducts(
    pontoDeSincronizacao: number = 0
  ): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get<ApiResponse>(
        `/produtos/pontoDeSincronizacao`,
        {
          params: { pontoDeSincronizacao },
        }
      );

      await this.updateDefaultFirebasePriceList(response.data);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro na requisição:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }

      return this.createErrorResponse(error);
    }
  }

  private createErrorResponse(error: unknown): ApiResponse {
    return {
      pontoDeSincronizacao: 0,
      produtos: [],
      errors: [error],
      message: "Erro ao buscar produtos",
    };
  }

  private async updateDefaultFirebasePriceList(
    fetchedProducts: ApiResponse
  ): Promise<void> {
    try {
      const priceListData = fetchedProducts.produtos.map(
        (product: Product) => ({
          id: product.id,
          preco: product.preco,
          nome: product.nome,
          descricao: product.descricao,
          imagem: product.imagem,
          categoria: product.categoria,
        })
      );

      const now = new Date();
      const timeZone = "America/Sao_Paulo";

      const formattedDate = formatInTimeZone(
        now, // Data e hora em UTC
        timeZone, // Fuso horário desejado
        "HH:mm:ss - dd/MM", // Formato desejado
        { locale: ptBR } // Localização para formatação
      );

      // Atualiza a coleção "default_prices-list" no Firestore com os novos dados
      await firestore.collection("default_prices-list").doc("DEFAULT").set({
        name: "Lista padrão",
        products: priceListData,
        updatedAt: formattedDate,
      });

      console.log(
        "Lista de preço padrão atualizada com sucesso",
        formattedDate
      );
    } catch (error) {
      console.error("Erro ao atualizar lista de preço padrão", error);
      throw error; // Propaga o erro para ser tratado em um nível superior, se necessário.
    }
  }
}

// Export singleton instance
export const productService = new ProductService();
