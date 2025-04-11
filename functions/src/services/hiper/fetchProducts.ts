import axios, { AxiosInstance } from "axios";
import { fetchToken } from "./fetchToken";
import env from "../../config/env";

// Interfaces
interface Product {
  pontoDeSincronizacao: number;
  altura: number;
  ativo: boolean;
  categoria: string;
  codigo: number;
  codigoDeBarras: string;
  comprimento: number;
  descricao: string;
  grade: boolean;
  id: string;
  imagem: string;
  imagensAdicionais?: {
    imagem: string;
  }[];
  largura: number;
  marca: string;
  nome: string;
  peso: number;
  preco: number;
  produtoPrimarioId: string;
  quantidadeEmEstoque: number;
  quantidadeMinimaEmEstoque: number;
  unidade: string;
  variacao?: {
    codigo: number;
    codigoDeBarras: string;
    id: string;
    nomeVariacaoA: string;
    nomeVariacaoB: string | null;
    quantidadeEmEstoque: number;
    quantidadeEmEstoqueReservado: number;
    quantidadeMinimaEmEstoque: number;
    tipoVariacaoA: string | null;
    tipoVariacaoB: string | null;
  }[];
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
}

// Export singleton instance
export const productService = new ProductService();
