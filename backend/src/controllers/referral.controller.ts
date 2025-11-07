import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ReferralStatus } from "../types/enums";

/**
 * Controller para gerenciar indicações/referências de negócios
 */
export class ReferralController {
  /**
   * Criar indicação de novo membro (cria uma Intenção pendente)
   */
  async createReferralAsIntention(req: Request, res: Response) {
    try {
      const { giverId } = req.params;
      const { name, email, company, reason } = req.body;

      // Validação
      if (!name || !email || !company || !reason) {
        return res.status(400).json({
          error: "Campos obrigatórios: nome, email, empresa e motivo",
        });
      }

      // Verificar se o membro que está indicando existe
      const giver = await prisma.member.findUnique({
        where: { id: giverId },
        include: { intention: true },
      });

      if (!giver) {
        return res.status(404).json({ error: "Membro não encontrado" });
      }

      // Verificar se já existe intenção com este email
      const existingIntention = await prisma.intention.findUnique({
        where: { email },
      });

      if (existingIntention) {
        return res.status(409).json({
          error: "Já existe uma intenção cadastrada com este email",
        });
      }

      // Criar intenção como indicação
      const intention = await prisma.intention.create({
        data: {
          name,
          email,
          company,
          reason,
          status: "PENDING",
          referredBy: giverId, // ID do membro que indicou
        },
      });

      console.log(`👥 Nova indicação criada por ${giver.intention.name}:`);
      console.log(`   Para: ${name} (${email})`);
      console.log(`   Empresa: ${company}`);

      res.status(201).json({
        message: "Indicação enviada para aprovação do administrador!",
        data: intention,
      });
    } catch (error) {
      console.error("Error creating referral as intention:", error);
      res.status(500).json({ error: "Erro ao criar indicação" });
    }
  }

  /**
   * Criar nova indicação
   */
  async create(req: Request, res: Response) {
    try {
      const {
        giverId,
        receiverId,
        companyName,
        contactName,
        contactInfo,
        opportunity,
      } = req.body;

      // Validação
      if (
        !giverId ||
        !receiverId ||
        !companyName ||
        !contactName ||
        !contactInfo ||
        !opportunity
      ) {
        return res.status(400).json({
          error: "Todos os campos são obrigatórios",
        });
      }

      // Verificar se os membros existem
      const [giver, receiver] = await Promise.all([
        prisma.member.findUnique({ where: { id: giverId } }),
        prisma.member.findUnique({ where: { id: receiverId } }),
      ]);

      if (!giver || !receiver) {
        return res.status(404).json({ error: "Membro não encontrado" });
      }

      // Criar indicação
      const referral = await prisma.referral.create({
        data: {
          giverId,
          receiverId,
          companyName,
          contactName,
          contactInfo,
          opportunity,
          status: ReferralStatus.NEW,
        },
        include: {
          giver: {
            include: {
              intention: {
                select: { name: true },
              },
            },
          },
          receiver: {
            include: {
              intention: {
                select: { name: true },
              },
            },
          },
        },
      });

      res.status(201).json({
        message: "Indicação criada com sucesso!",
        data: referral,
      });
    } catch (error) {
      console.error("Error creating referral:", error);
      res.status(500).json({ error: "Erro ao criar indicação" });
    }
  }

  /**
   * Listar indicações de um membro (dadas e recebidas)
   */
  async listByMember(req: Request, res: Response) {
    try {
      const { memberId } = req.params;
      const { type } = req.query; // 'given' ou 'received'

      let where: any = {};
      if (type === "given") {
        where = { giverId: memberId };
      } else if (type === "received") {
        where = { receiverId: memberId };
      } else {
        where = {
          OR: [{ giverId: memberId }, { receiverId: memberId }],
        };
      }

      const referrals = await prisma.referral.findMany({
        where,
        include: {
          giver: {
            include: {
              intention: {
                select: { name: true, email: true },
              },
            },
          },
          receiver: {
            include: {
              intention: {
                select: { name: true, email: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ data: referrals });
    } catch (error) {
      console.error("Error listing referrals:", error);
      res.status(500).json({ error: "Erro ao listar indicações" });
    }
  }

  /**
   * Listar todas as indicações (admin)
   */
  async list(req: Request, res: Response) {
    try {
      const { status } = req.query;

      const referrals = await prisma.referral.findMany({
        where: status ? { status: status as ReferralStatus } : undefined,
        include: {
          giver: {
            include: {
              intention: {
                select: { name: true },
              },
            },
          },
          receiver: {
            include: {
              intention: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ data: referrals });
    } catch (error) {
      console.error("Error listing referrals:", error);
      res.status(500).json({ error: "Erro ao listar indicações" });
    }
  }

  /**
   * Buscar indicação por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const referral = await prisma.referral.findUnique({
        where: { id },
        include: {
          giver: {
            include: {
              intention: true,
            },
          },
          receiver: {
            include: {
              intention: true,
            },
          },
        },
      });

      if (!referral) {
        return res.status(404).json({ error: "Indicação não encontrada" });
      }

      res.json({ data: referral });
    } catch (error) {
      console.error("Error getting referral:", error);
      res.status(500).json({ error: "Erro ao buscar indicação" });
    }
  }

  /**
   * Atualizar status da indicação
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(ReferralStatus).includes(status)) {
        return res.status(400).json({
          error:
            "Status inválido. Use: NEW, IN_CONTACT, NEGOTIATING, CLOSED ou REJECTED",
        });
      }

      const referral = await prisma.referral.update({
        where: { id },
        data: { status },
        include: {
          giver: {
            include: {
              intention: {
                select: { name: true },
              },
            },
          },
          receiver: {
            include: {
              intention: {
                select: { name: true },
              },
            },
          },
        },
      });

      res.json({
        message: "Status atualizado com sucesso",
        data: referral,
      });
    } catch (error) {
      console.error("Error updating referral status:", error);
      res.status(500).json({ error: "Erro ao atualizar status" });
    }
  }

  /**
   * Atualizar indicação completa
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { companyName, contactName, contactInfo, opportunity, status } =
        req.body;

      const referral = await prisma.referral.update({
        where: { id },
        data: {
          companyName,
          contactName,
          contactInfo,
          opportunity,
          status,
        },
      });

      res.json({
        message: "Indicação atualizada com sucesso",
        data: referral,
      });
    } catch (error) {
      console.error("Error updating referral:", error);
      res.status(500).json({ error: "Erro ao atualizar indicação" });
    }
  }

  /**
   * Deletar indicação
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.referral.delete({
        where: { id },
      });

      res.json({
        message: "Indicação deletada com sucesso",
      });
    } catch (error) {
      console.error("Error deleting referral:", error);
      res.status(500).json({ error: "Erro ao deletar indicação" });
    }
  }

  /**
   * Estatísticas de indicações
   */
  async stats(req: Request, res: Response) {
    try {
      const total = await prisma.referral.count();
      const byStatus = await prisma.referral.groupBy({
        by: ["status"],
        _count: true,
      });

      const statusCounts = byStatus.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        data: {
          total,
          byStatus: statusCounts,
        },
      });
    } catch (error) {
      console.error("Error getting referral stats:", error);
      res.status(500).json({ error: "Erro ao obter estatísticas" });
    }
  }
}

export default new ReferralController();
