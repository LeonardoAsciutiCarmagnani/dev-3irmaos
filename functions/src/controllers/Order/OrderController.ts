import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { CreateBudgetService } from "../../services/Order/createBudget";
import { PostOrderService } from "../../services/hiper/postOrder";

const createBudgetSchema = z.object({
  client: z.object({
    id: z.string().uuid("ID do cliente inválido."),
    name: z
      .string()
      .min(3, "Nome do cliente deve ter pelo menos 3 caracteres."),
    email: z.string().email("E-mail inválido").trim().toLowerCase(),
    phone: z.string({ message: "Telefone obrigatório." }),
    document: z.string({ message: "Documento obrigatório." }),
    ie: z.string().optional(),
  }),
  deliveryAddress: z.object({
    cep: z.string().min(8, "CEP deve ter 8 dígitos."),
    neighborhood: z.string({ message: "Bairro obrigatório." }),
    street: z.string({ message: "Logradouro obrigatório." }),
    number: z.number().min(1, "Número obrigatório."),
    city: z.string({ message: "Cidade obrigatória." }),
    state: z.string({ message: "Estado obrigatório." }),
    ibge: z.string().optional(),
  }),
  billingAddress: z.object({
    cep: z.string().min(8, "CEP deve ter 8 dígitos."),
    neighborhood: z.string({ message: "Bairro obrigatório." }),
    street: z.string({ message: "Logradouro obrigatório." }),
    number: z.number().min(1, "Número obrigatório."),
    city: z.string({ message: "Cidade obrigatória." }),
    state: z.string({ message: "Estado obrigatório." }),
    ibge: z.string().optional(),
  }),
  products: z.array(
    z.object({
      nome: z.string({ message: "Nome do produto obrigatório." }),
      quantidade: z.number().min(1, "Quantidade deve ser maior que 0."),
      altura: z.number().min(1, "Altura deve ser maior que 0."),
      largura: z.number().min(1, "Largura deve ser maior que 0."),
      // comprimento: z.number().min(1, "Comprimento deve ser maior que 0."),
      categoria: z.string({ message: "Categoria obrigatória." }).nullable(),
      preco: z.number({ message: "Preço obrigatório." }),
      selectedVariation: z.object({
        id: z.string({ message: "ID da variação obrigatória." }),
        nomeVariacao: z.string({ message: "Nome da variação obrigatória." }),
      }),
    })
  ),
  imagesUrls: z.array(z.string()).optional(),
  detailsPropostal: z
    .object({
      obs: z.string().optional(),
      payment: z.string().optional(),
      delivery: z.number().optional(),
      time: z.string().optional(),
    })
    .nullable()
    .optional(),
  createdAt: z.string().optional(),
  orderStatus: z.number(),
  totalValue: z.number().min(0, "Valor total inválido."),
});

const createOrderSchema = z.object({
  orderId: z.number(),
  client: z.object({
    id: z.string().uuid("ID do cliente inválido."),
    name: z
      .string()
      .min(3, "Nome do cliente deve ter pelo menos 3 caracteres."),
    email: z.string().email("E-mail inválido").trim().toLowerCase(),
    phone: z.string({ message: "Telefone obrigatório." }),
    document: z.string({ message: "Documento obrigatório." }),
    ie: z.string().optional(),
  }),
  deliveryAddress: z.object({
    cep: z.string().min(8, "CEP deve ter 8 dígitos."),
    neighborhood: z.string({ message: "Bairro obrigatório." }),
    street: z.string({ message: "Logradouro obrigatório." }),
    number: z.number().min(1, "Número obrigatório."),
    city: z.string({ message: "Cidade obrigatória." }),
    state: z.string({ message: "Estado obrigatório." }),
    ibge: z.string().optional(),
  }),
  billingAddress: z.object({
    cep: z.string().min(8, "CEP deve ter 8 dígitos."),
    neighborhood: z.string({ message: "Bairro obrigatório." }),
    street: z.string({ message: "Logradouro obrigatório." }),
    number: z.number().min(1, "Número obrigatório."),
    city: z.string({ message: "Cidade obrigatória." }),
    state: z.string({ message: "Estado obrigatório." }),
    ibge: z.string().optional(),
  }),
  products: z.array(
    z.object({
      nome: z.string({ message: "Nome do produto obrigatório." }),
      quantidade: z.number().min(1, "Quantidade deve ser maior que 0."),
      altura: z.number().min(1, "Altura deve ser maior que 0."),
      largura: z.number().min(1, "Largura deve ser maior que 0."),
      // comprimento: z.number().min(1, "Comprimento deve ser maior que 0."),
      categoria: z.string({ message: "Categoria obrigatória." }).nullable(),
      preco: z.number({ message: "Preço obrigatório." }),
      selectedVariation: z.object({
        id: z.string({ message: "ID da variação obrigatória." }),
        nomeVariacao: z.string({ message: "Nome da variação obrigatória." }),
      }),
      listImages: z.array(
        z.object({
          imagem: z.string().nullable(),
        })
      ),
    })
  ),
  detailsPropostal: z
    .object({
      obs: z.string().optional(),
      payment: z.string().optional(),
      delivery: z.number().optional(),
      time: z.string().optional(),
    })
    .nullable()
    .optional(),
  createdAt: z.string().optional(),
  orderStatus: z.number(),
  totalValue: z.number().min(0, "Valor total inválido."),
  imagesUrls: z.array(z.string()).optional(),
});

export type BudgetType = z.infer<typeof createBudgetSchema>;
export type OrderType = z.infer<typeof createOrderSchema>;

export class OrderController {
  public static async createBudget(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsedBody = createBudgetSchema.parse(req.body);

      console.log("Order Controller (CREATE) - Body received:", req.body);

      console.log("Order Controller (CREATE) - Creating Order:", parsedBody);
      const createdOrder = await CreateBudgetService.execute(parsedBody);

      if (createdOrder.success === false) {
        res.status(409).json(createdOrder);
      }

      res.status(201).json(createdOrder);
    } catch (error) {
      next(error);
    }
  }

  public static async postOrderInHiper(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      console.log("Dados Recebidos:", req.body);

      const parsedBody = createOrderSchema.parse(req.body);

      const userId = parsedBody.client.id;

      console.log("Order Controller (CREATE) - Body received:", req.body);

      console.log("Order Controller (CREATE) - Creating Order:", parsedBody);
      const createdOrder = await PostOrderService.postOrder(parsedBody, userId);

      if (createdOrder.success === false) {
        res.status(409).json(createdOrder);
      }

      res.status(201).json(createdOrder);
    } catch (error: ZodError | any) {
      if (error instanceof ZodError) {
        console.error("ZodError:", error.errors);
        res.status(400).json({
          success: false,
          message: "Erro de validação",
          errors: error.errors,
        });
      }
      next(error);
    }
  }
}
