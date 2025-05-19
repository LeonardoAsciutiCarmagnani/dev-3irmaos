import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import proposalSent from "../../services/chat4sales/push/proposalSent";

const sendProposalSchema = z.object({
  orderCode: z.number(),
  clientName: z.string(),
  clientPhone: z.string(),
  createdAt: z.string(),
});

export type SendProposalProps = z.infer<typeof sendProposalSchema>;

export class PushController {
  public static async sendProposal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = sendProposalSchema.parse(req.body);

      console.log("Send Proposal Push - Body received:", body);

      const sentPropostal = await proposalSent(body);

      console.log("Retorno =>", sentPropostal);
      res.status(201).json(sentPropostal);
    } catch (error) {
      console.log("Erro ao enviar push:", error);
      next(error);
    }
  }
}
