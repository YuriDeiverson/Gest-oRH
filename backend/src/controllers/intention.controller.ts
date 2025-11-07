import { Request, Response } from "express";
import { nanoid } from "nanoid";
import prisma from "../lib/prisma";
import { IntentionStatus } from "../types/enums";

/**
 * Controller para gerenciar intenções de participação
 */
export class IntentionController {
  /**
   * Criar nova intenção de participação (público)
   */
  async create(req: Request, res: Response) {
    try {
      const { name, email, company, reason } = req.body;

      // Validação básica
      if (!name || !email || !company || !reason) {
        return res.status(400).json({
          error: "Todos os campos são obrigatórios",
        });
      }

      // Verificar se email já existe
      const existingIntention = await prisma.intention.findUnique({
        where: { email },
      });

      if (existingIntention) {
        return res.status(409).json({
          error: "Este email já possui uma intenção cadastrada",
        });
      }

      // Criar intenção
      const intention = await prisma.intention.create({
        data: {
          name,
          email,
          company,
          reason,
          status: IntentionStatus.PENDING,
        },
      });

      res.status(201).json({
        message: "Intenção de participação enviada com sucesso!",
        data: intention,
      });
    } catch (error) {
      console.error("Error creating intention:", error);
      res.status(500).json({ error: "Erro ao criar intenção de participação" });
    }
  }

  /**
   * Listar todas as intenções (admin)
   */
  async list(req: Request, res: Response) {
    try {
      const { status, referredBy } = req.query;

      const whereConditions: any = {};

      if (status) {
        whereConditions.status = status as IntentionStatus;
      }

      if (referredBy) {
        whereConditions.referredBy = referredBy as string;
      }

      const intentions = await prisma.intention.findMany({
        where:
          Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          member: {
            select: {
              id: true,
              isActive: true,
              joinedAt: true,
            },
          },
        },
      });

      res.json({ data: intentions });
    } catch (error) {
      console.error("Error listing intentions:", error);
      res.status(500).json({ error: "Erro ao listar intenções" });
    }
  }

  /**
   * Buscar intenção por ID (admin)
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const intention = await prisma.intention.findUnique({
        where: { id },
        include: {
          member: true,
        },
      });

      if (!intention) {
        return res.status(404).json({ error: "Intenção não encontrada" });
      }

      res.json({ data: intention });
    } catch (error) {
      console.error("Error getting intention:", error);
      res.status(500).json({ error: "Erro ao buscar intenção" });
    }
  }

  /**
   * Aprovar intenção e criar membro automaticamente (admin)
   */
  async approve(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const intention = await prisma.intention.findUnique({
        where: { id },
      });

      if (!intention) {
        return res.status(404).json({ error: "Intenção não encontrada" });
      }

      if (intention.status !== IntentionStatus.PENDING) {
        return res.status(400).json({
          error: "Apenas intenções pendentes podem ser aprovadas",
        });
      }

      // Verificar se já existe um membro para esta intenção
      const existingMember = await prisma.member.findUnique({
        where: { intentionId: id },
      });

      if (existingMember) {
        return res.status(400).json({
          error: "Já existe um membro criado para esta intenção",
        });
      }

      // Gerar token único para cadastro completo
      const token = nanoid(32);

      // Atualizar intenção e criar membro em uma transação
      const result = await prisma.$transaction(async (tx) => {
        // Atualizar intenção para APROVADA com token
        const updatedIntention = await tx.intention.update({
          where: { id },
          data: {
            status: IntentionStatus.APPROVED,
            token,
          },
        });

        // Criar membro automaticamente com os dados da intenção
        const newMember = await tx.member.create({
          data: {
            intentionId: id,
            isActive: true, // Ativo imediatamente ao aprovar
            // Campos opcionais - serão preenchidos quando completar cadastro
          },
        });

        return { updatedIntention, newMember };
      });

      // Simular envio de email
      const registrationLink = `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/register/${token}`;

      console.log(`\n📧 ========================================`);
      console.log(`📨 EMAIL ENVIADO PARA: ${intention.email}`);
      console.log(`👤 Destinatário: ${intention.name}`);
      console.log(`🏢 Empresa: ${intention.company}`);
      console.log(`🔗 Link de cadastro: ${registrationLink}`);

      if (intention.referredBy) {
        console.log(`👥 Indicado por: Membro ID ${intention.referredBy}`);
      }

      console.log(`========================================\n`);

      res.json({
        message: "Intenção aprovada! Email de cadastro enviado ao candidato.",
        data: result.updatedIntention,
        member: result.newMember,
        registrationLink, // Para desenvolvimento - remover em produção
      });
    } catch (error) {
      console.error("Error approving intention:", error);
      res.status(500).json({ error: "Erro ao aprovar intenção" });
    }
  }

  /**
   * Rejeitar intenção (admin)
   */
  async reject(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const intention = await prisma.intention.findUnique({
        where: { id },
      });

      if (!intention) {
        return res.status(404).json({ error: "Intenção não encontrada" });
      }

      if (intention.status !== IntentionStatus.PENDING) {
        return res.status(400).json({
          error: "Apenas intenções pendentes podem ser rejeitadas",
        });
      }

      const updatedIntention = await prisma.intention.update({
        where: { id },
        data: {
          status: IntentionStatus.REJECTED,
        },
      });

      res.json({
        message: "Intenção rejeitada",
        data: updatedIntention,
      });
    } catch (error) {
      console.error("Error rejecting intention:", error);
      res.status(500).json({ error: "Erro ao rejeitar intenção" });
    }
  }

  /**
   * Validar token de cadastro (público)
   */
  async validateToken(req: Request, res: Response) {
    try {
      const { token } = req.params;

      const intention = await prisma.intention.findUnique({
        where: { token },
      });

      if (!intention) {
        return res.status(404).json({ error: "Token inválido" });
      }

      if (intention.status !== IntentionStatus.APPROVED) {
        return res.status(400).json({
          error: "Esta intenção não está aprovada",
        });
      }

      // Verificar se já foi usado
      const existingMember = await prisma.member.findUnique({
        where: { intentionId: intention.id },
      });

      if (existingMember) {
        return res.status(400).json({
          error: "Este token já foi utilizado",
        });
      }

      res.json({
        valid: true,
        data: {
          name: intention.name,
          email: intention.email,
          company: intention.company,
        },
      });
    } catch (error) {
      console.error("Error validating token:", error);
      res.status(500).json({ error: "Erro ao validar token" });
    }
  }

  /**
   * Atualizar tracking status de uma intention (público)
   */
  async updateTrackingStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { trackingStatus } = req.body;

      const intention = await prisma.intention.findUnique({
        where: { id },
      });

      if (!intention) {
        return res.status(404).json({ error: "Intenção não encontrada" });
      }

      // Atualizar o trackingStatus
      const updatedIntention = await prisma.intention.update({
        where: { id },
        data: { trackingStatus },
      });

      res.json({
        message: "Status de acompanhamento atualizado",
        data: updatedIntention,
      });
    } catch (error) {
      console.error("Error updating tracking status:", error);
      res.status(500).json({ error: "Erro ao atualizar status" });
    }
  }
}

export default new IntentionController();
