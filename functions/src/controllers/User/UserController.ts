import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { CreateClient } from "../../services/User/createClient";
import { CreateAdmin } from "../../services/User/createAdmin";

const createClientSchema = z.object({
  Name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  Email: z.string().email("E-mail inválido").trim().toLowerCase(),
  Document: z.string(),
  Phone: z.string().min(15, "Telefone inválido."),
  IE: z.string().nullable(),
  FantasyName: z.string().nullable(),
  Address: z.object({
    Cep: z.string().length(9, "CEP inválido."),
    Street: z.string().min(3, "Logradouro inválido."),
    Number: z.coerce.number().min(1, "Número inválido."),
    Neighborhood: z.string().min(2, "Bairro inválido."),
    City: z.string().min(2, "Cidade inválida."),
    State: z.string().length(2, "UF inválida."),
    Ibge: z.string().min(7, "Código IBGE inválido."),
  }),
  Password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
});

const createAdminSchema = z.object({
  Name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  Email: z.string().email("E-mail inválido").trim().toLowerCase(),
  Password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
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
