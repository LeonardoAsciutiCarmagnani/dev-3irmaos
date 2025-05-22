import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { CreateClient } from "../../services/User/createClient";
import { CreateAdmin } from "../../services/User/createAdmin";

const createClientSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("E-mail inválido").trim().toLowerCase(),
  document: z.string(),
  phone: z.string().min(15, "Telefone inválido."),
  ie: z.string().nullable(),
  fantasyName: z.string().nullable(),
  address: z.object({
    cep: z.string().length(9, "CEP inválido."),
    city: z.string().min(2, "Cidade inválida."),
    ibge: z.string().min(7, "Código IBGE inválido."),
    neighborhood: z.string().min(2, "Bairro inválido."),
    number: z.coerce.number().min(1, "Número inválido."),
    state: z.string().length(2, "UF inválida."),
    street: z.string().min(3, "Logradouro inválido."),
    complement: z.string().optional().default(""),
  }),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
});

const createAdminSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("E-mail inválido").trim().toLowerCase(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
});

export class UserController {
  public static async createClient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsedBody = createClientSchema.parse(req.body);

      console.log("User Controller (CREATE) - Body received:", req.body);

      console.log("User Controller (CREATE) - Creating User:", parsedBody);
      const createdUser = await CreateClient.execute(parsedBody);

      if (createdUser.success === false) {
        res.status(409).json(createdUser);
        return;
      }

      console.log("User Controller - Finishing and sending...:", createdUser);
      res.status(201).json(createdUser);
    } catch (error) {
      next(error);
    }
  }

  public static async createAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsedBody = createAdminSchema.parse(req.body);

      console.log(
        "User Controller (CREATE - ADMIN) - Body received:",
        req.body
      );

      console.log(
        "User Controller (CREATE - ADMIN) - Creating User:",
        parsedBody
      );
      const createdUser = await CreateAdmin.execute(parsedBody);

      if (createdUser.success === false) {
        res.status(409).json(createdUser);
        return;
      }

      console.log("User Controller - Finishing and sending...:", createdUser);
      res.status(201).json(createdUser);
    } catch (error) {
      next(error);
    }
  }
}
