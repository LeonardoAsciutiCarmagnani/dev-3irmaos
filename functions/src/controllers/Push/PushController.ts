import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import proposalSent from "../../services/chat4sales/push/proposalSent";
import proposalCompleted from "../../services/chat4sales/push/proposalCompleted";
import proposalDispatched from "../../services/chat4sales/push/dispatched";
import proposalInProduction from "../../services/chat4sales/push/inProduction";
import proposalApproved from "../../services/chat4sales/push/proposalApproved";
import proposalRejected from "../../services/chat4sales/push/proposalRejected";
import createBudget from "../../services/chat4sales/push/createBudget";
import proposalAccepted from "../../services/chat4sales/push/proposalAccepted";
import createBudgetADM from "../../services/chat4sales/push/createBudgetADM";
import createClient from "../../services/chat4sales/push/createClient";

const bodyPushesSchema = z.object({
  orderCode: z.number(),
  clientName: z.string(),
  clientPhone: z.string(),
  createdAt: z.string(),
  orderStatus: z.number(),
  deliveryDate: z.string().optional(),
});

const bodyCreateClientSchema = z.object({
  clientName: z.string(),
  clientPhone: z.string(),
  clientEmail: z.string(),
  clientPassword: z.string(),
});

type SendPushCreateClientProps = z.infer<typeof bodyCreateClientSchema>;
export type SendPushsProps = z.infer<typeof bodyPushesSchema>;

export class PushController {
  public static async createdBudget(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = bodyPushesSchema.parse(req.body);

      console.log("Create Budget Push - Body received:", body);

      const budgetCreatedPush = await createBudget(body);

      console.log("Retorno =>", budgetCreatedPush);
      res.status(201).json(budgetCreatedPush);
    } catch (error) {
      console.log("Erro ao enviar push:", error);
      next(error);
    }
  }

  public static async createdBudgetADM(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = bodyPushesSchema.parse(req.body);

      console.log("Create Budget Push - Body received:", body);

      const budgetCreatedPush = await createBudgetADM(body);

      console.log("Retorno =>", budgetCreatedPush);
      res.status(201).json(budgetCreatedPush);
    } catch (error) {
      console.log("Erro ao enviar push:", error);
      next(error);
    }
  }

  public static async createClient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = bodyCreateClientSchema.parse(req.body);

      console.log("Create Budget Push - Body received:", body);

      const createdClientPush = await createClient(body);

      console.log("Retorno =>", createdClientPush);
      res.status(201).json(createdClientPush);
    } catch (error) {
      console.log("Erro ao enviar push:", error);
      next(error);
    }
  }

  public static async sendProposal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = bodyPushesSchema.parse(req.body);

      console.log("Send Proposal Push - Body received:", body);

      const sentPropostal = await proposalSent(body);

      console.log("Retorno =>", sentPropostal);
      res.status(201).json(sentPropostal);
    } catch (error) {
      console.log("Erro ao enviar push:", error);
      next(error);
    }
  }

  public static async proposalRejected(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = bodyPushesSchema.parse(req.body);

      console.log("Proposal Rejected Push - Body received:", body);

      const proposalRejectedPush = await proposalRejected(body);

      console.log("Retorno =>", proposalRejectedPush);
      res.status(201).json(proposalRejectedPush);
    } catch (error) {
      console.log("Erro ao enviar push:", error);
      next(error);
    }
  }

  public static async proposalAccepted(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = bodyPushesSchema.parse(req.body);

      console.log("Proposal Accepted Push - Body received:", body);

      const proposalAcceptedPush = await proposalAccepted(body);

      console.log("Retorno =>", proposalAcceptedPush);
      res.status(201).json(proposalAcceptedPush);
    } catch (error) {
      console.log("Erro ao enviar push:", error);
      next(error);
    }
  }

  public static async proposalApproved(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = bodyPushesSchema.parse(req.body);

      console.log("Proposal Approved Push - Body received:", body);

      const proposalApprovedPush = await proposalApproved(body);

      console.log("Retorno =>", proposalApprovedPush);
      res.status(201).json(proposalApprovedPush);
    } catch (error) {
      console.log("Erro ao enviar push:", error);
      next(error);
    }
  }

  public static async proposalInProduction(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = bodyPushesSchema.parse(req.body);

      console.log("Proposal In Production Push - Body received:", body);

      const proposalInProductionPush = await proposalInProduction(body);

      console.log("Retorno =>", proposalInProductionPush);
      res.status(201).json(proposalInProductionPush);
    } catch (error) {
      console.log("Erro ao enviar push:", error);
      next(error);
    }
  }

  public static async proposalDispatched(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = bodyPushesSchema.parse(req.body);

      console.log("Dispatched Push - Body received:", body);

      const proposalDispatchedPush = await proposalDispatched(body);

      console.log("Retorno =>", proposalDispatchedPush);
      res.status(201).json(proposalDispatchedPush);
    } catch (error) {
      console.log("Erro ao enviar push:", error);
      next(error);
    }
  }

  public static async proposalCompleted(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = bodyPushesSchema.parse(req.body);

      console.log("Proposal Completed Push - Body received:", body);

      const proposalCompletedPush = await proposalCompleted(body);

      console.log("Retorno =>", proposalCompletedPush);
      res.status(201).json(proposalCompletedPush);
    } catch (error) {
      console.log("Erro ao enviar push:", error);
      next(error);
    }
  }
}
