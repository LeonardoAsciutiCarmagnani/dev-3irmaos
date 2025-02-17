import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { productService } from "../services/hiper/fetchProducts";
import postUser from "../services/firebase/postUser";
import { checkEmailExists } from "../services/firebase/checkEmail";
import postOrder from "../services/hiper/postOrder";
import fetchCEP from "../services/others/fetchCEP";
import fetchAdminOrderCompleted from "../services/chat4sales/push/adminOrderCompleted";
import fetchPaymentLinkAdded from "../services/chat4sales/push/paymentLinkAdded";
import fetchOrderCompleted from "../services/chat4sales/push/orderCompleted";
import updateUserData from "../services/firebase/updateClient";
import { fetchPricesLists } from "../services/firebase/fetchPricesLists";
import { fetchPriceListById } from "../services/firebase/fetchPriceList";
import postPricesList from "../services/firebase/postPriceList";
import putPriceListInFirestore from "../services/firebase/putPriceList";
import deletePriceList from "../services/firebase/deletePriceList";
import deleteUserData from "../services/firebase/deleteClient";

// Types
interface ProductQuery {
  categoria?: string;
}

// Schemas
const createUserSchema = z.object({
  user_id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  CEP: z.string().min(8, "CEP inválido"),
  numberHouse: z.string().min(1, "Número da casa inválido"),
  phoneNumber: z.string().min(11, "Telefone inválido"),
  IBGE: z.number().min(7, "Código IBGE inválido"),
  bairro: z.string().min(1, "Bairro inválido"),
  localidade: z.string().min(1, "Cidade inválida"),
  logradouro: z.string().min(1, "Logradouro inválido"),
  uf: z.string().min(1, "UF inválida"),
  type_user: z.string().min(1, "Tipo de usuário é obrigatório"),
});

// Controllers
export class ProductController {
  public static async getProducts(
    req: Request<{}, {}, {}, ProductQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const productsResponse = await productService.fetchProducts();

      if (!productsResponse.produtos) {
        throw new Error("Falha ao obter produtos da API");
      }

      const products = productsResponse.produtos;
      console.log("Total de produtos:", products.length);

      console.log("Produtos encontrados:", products.length);

      res.status(200).json({
        success: true,
        data: products,
        total: products.length,
      });
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      next(error);
    }
  }
}

export class UserController {
  public static async createUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userData = createUserSchema.parse(req.body);

      console.log("Dados do usuário a ser cadastrado: ", userData);

      const result = await postUser(userData);

      console.log("Usuário criado com sucesso:", {
        ...result,
        password: "[REDACTED]",
      });

      res.status(201).json({
        success: true,
        message: "Usuário criado com sucesso",
        data: {
          name: userData.name,
          email: userData.email,
          cpf: userData.cpf,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          errors: error.errors,
        });
        return;
      }

      console.error("Erro ao criar usuário:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
      next(error);
    }
  }

  public static async putClientById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      console.log(
        "Dados recebidos no backend para atualizar o usuário:",
        updatedData,
        id
      );
      const resp = await updateUserData(id, updatedData);
      res.json({ resp });
      console.log(resp);
    } catch (e) {
      next(e);
    }
  }

  public static async checkEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validação do email
      const emailSchema = z.object({
        email: z.string().email("Email inválido"),
      });
      const { email } = emailSchema.parse(req.body);

      const emailExists = await checkEmailExists(email);

      if (emailExists.success) {
        res.status(200).json({
          success: true,
          message: "E-mail encontrado com sucesso",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "E-mail não encontrado",
        });
      }
    } catch (error: any) {
      // Tipagem do erro
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          errors: error.errors,
        });
        return;
      } else if (error.message === "Email não encontrado") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error("Erro ao recuperar senha:", error);
      next(error); // Passar o erro para o errorHandler
    }
  }
  public static async deleteUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = req.params.id;
      const result = await deleteUserData(id);

      if (result.error) {
        return res.status(404).json(result);
      }

      console.log("Usuário deletado:", result);
      res.json(result);
    } catch (e) {
      console.error("Erro no backend:", e);
      next(e);
    }
  }
}

export interface OrderData {
  IdClient: string;
  created_at: string;
  cliente: {
    documento: string;
    email: string;
    inscricaoEstadual?: string;
    nomeDoCliente: string;
    nomeFantasia?: string;
  };
  enderecoDeCobranca: {
    bairro: string;
    cep: string;
    codigoIbge: number;
    complemento?: string;
    logradouro: string;
    numero: string;
  };
  enderecoDeEntrega: {
    bairro: string;
    cep: string;
    codigoIbge: number;
    complemento: string;
    logradouro: string;
    numero: string;
  };
  itens: [
    {
      produtoId: string;
      quantidade: number;
      precoUnitarioBruto: number;
      precoUnitarioLiquido: number;
    }
  ];
  meiosDePagamento: [
    {
      idMeioDePagamento: number;
      parcelas: number;
      valor: number;
    }
  ];
  numeroPedidoDeVenda: string;
  observacaoDoPedidoDeVenda: string;
  valorDoFrete: number;
}

export class OrderController {
  public static async postOrderSale(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const orderData: OrderData = req.body;
      const userId = orderData.IdClient;
      console.log("BACK-END: USUÁRIO IDENTIFICADO: ", userId);

      const result = await postOrder(orderData, userId);

      console.log("result: ", result);

      res.status(201).json({
        success: true,
        message: "Venda enviada com sucesso",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Erro ao enviar venda",
      });

      next(error);
    }
  }
}

export class PricesListsController {
  public static async getAllPricesLists(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const pricesLists = await fetchPricesLists();
      res.json({ pricesLists });
      console.log("Listas de preços obtidas:", pricesLists);
    } catch (e) {
      next(e);
    }
  }
  public static async getPriceListById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id;
      const priceList = await fetchPriceListById(id);
      res.json({ priceList });
      console.log("Lista de preço selecionada:", priceList);
    } catch (e) {
      next(e);
    }
  }
  public static async createPriceList(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const pricesListData = req.body;
      const pricesList = await postPricesList(pricesListData);
      res.json({ pricesList });
      console.log("Listas de preços obtidas:", pricesList);
    } catch (e) {
      next(e);
    }
  }
  public static async putPriceListById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id;
      const priceListData = req.body;
      const priceList = await putPriceListInFirestore(id, priceListData);
      res.json({ priceList });
      console.log("Lista de precos atualizada:", priceList);
    } catch (e) {
      next(e);
    }
  }
  public static async deletePriceListById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = req.params.id;
      const result = await deletePriceList(id);

      if (result.error) {
        return res.status(404).json(result.error);
      }

      console.log("Lista de preços deletada:", result);
      res.json(result);
    } catch (e) {
      console.error("Erro no backend:", e);
      next(e);
    }
  }
}

export class CEPController {
  public static async getCEP(req: Request, res: Response, next: NextFunction) {
    const { cep } = req.body;
    console.log("Body recebido:", req.body);
    if (!cep) {
      return res.status(400).json({ error: "CEP é obrigatório." });
    }

    try {
      const resultCEP = await fetchCEP(cep);

      if (resultCEP === null) {
        return res
          .status(201)
          .json({ success: false, message: "CEP não encontrado." });
      }

      res.status(201).json({
        success: true,
        message: "CEP encontrado com sucesso",
        dataAddress: resultCEP,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Erro ao buscar CEP",
        dataAddress: null,
      });

      next(error);
    }
  }
}

export const validateCEP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { cep } = req.body;

  if (!cep) {
    return res.status(400).json({ error: "CEP é obrigatório." });
  }

  try {
    const data = await fetchCEP(cep);

    if (!data) {
      return res.status(404).json({ error: "CEP não encontrado." });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao validar o CEP:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
};

export class PushController {
  public static async postAdminOrderCompleted(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const body = req.body;
    console.log("Body recebido:", req.body);
    if (!body) {
      return res.status(400).json({ error: "Corpo da requisição inválido" });
    }

    try {
      const resultPush = await fetchAdminOrderCompleted(body);
      console.log("Resultado retornado após envio do push: ", resultPush?.data);
      res.status(201).json({
        success: true,
        message: "Push enviado com sucesso",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Erro ao enviar push",
      });

      next(error);
    }
  }

  public static async postOrderCompleted(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const body = req.body;
    console.log("Body recebido:", req.body);
    if (!body) {
      return res
        .status(400)
        .json({ error: "Corpo da requisição é obrigatório" });
    }

    try {
      const resultPush = await fetchOrderCompleted(body);
      console.log("Resultado retornado após envio do push: ", resultPush?.data);
      res.status(201).json({
        success: true,
        message: "Push enviado com sucesso",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Erro ao enviar push",
      });

      next(error);
    }
  }

  public static async postPaymentLinkAdded(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const body = req.body;
    console.log("Body recebido:", req.body);
    if (!body) {
      return res
        .status(400)
        .json({ error: "Corpo da requisição é obrigatório" });
    }

    try {
      const resultPush = await fetchPaymentLinkAdded(body);
      console.log("Resultado retornado após envio do push: ", resultPush?.data);
      res.status(201).json({
        success: true,
        message: "Push enviado com sucesso",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Erro ao enviar push",
      });

      next(error);
    }
  }
}

// Error Handler Middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error Handler:", err);

  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
