import { Request, Response } from "express";
import prisma from "../lib/prisma";

/**
 * Controller para gerenciar membros
 */
export class MemberController {
  /**
   * Completar cadastro de membro usando token
   */
  async register(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const { phone, linkedin, profession, segment, companyDescription } =
        req.body;

      // Validação
      if (!phone || !profession || !segment) {
        return res.status(400).json({
          error: "Campos obrigatórios: telefone, profissão e segmento",
        });
      }

      // Buscar intenção aprovada pelo token
      const intention = await prisma.intention.findUnique({
        where: { token },
      });

      if (!intention || intention.status !== "APPROVED") {
        return res
          .status(400)
          .json({ error: "Token inválido ou intenção não aprovada" });
      }

      // Verificar se já existe membro
      const existingMember = await prisma.member.findUnique({
        where: { intentionId: intention.id },
      });

      let member;

      if (existingMember) {
        // Atualizar membro existente (completar cadastro)
        member = await prisma.member.update({
          where: { id: existingMember.id },
          data: {
            phone,
            linkedin,
            profession,
            segment,
            companyDescription,
            isActive: true,
          },
          include: {
            intention: {
              select: {
                name: true,
                email: true,
                company: true,
              },
            },
          },
        });
      } else {
        // Criar novo membro
        member = await prisma.member.create({
          data: {
            intentionId: intention.id,
            phone,
            linkedin,
            profession,
            segment,
            companyDescription,
            isActive: true,
          },
          include: {
            intention: {
              select: {
                name: true,
                email: true,
                company: true,
              },
            },
          },
        });
      }

      res.status(existingMember ? 200 : 201).json({
        message: "Cadastro completo realizado com sucesso!",
        data: member,
      });
    } catch (error) {
      console.error("Error registering member:", error);
      res.status(500).json({ error: "Erro ao completar cadastro" });
    }
  }

  /**
   * Completar perfil do membro após primeiro login
   */
  async completeProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { phone, linkedin, profession, segment, companyDescription } =
        req.body;

      // Validação
      if (!phone || !profession || !segment) {
        return res.status(400).json({
          error: "Campos obrigatórios: telefone, profissão e segmento",
        });
      }

      // Buscar membro
      const existingMember = await prisma.member.findUnique({
        where: { id },
      });

      if (!existingMember) {
        return res.status(404).json({ error: "Membro não encontrado" });
      }

      // Atualizar membro
      const member = await prisma.member.update({
        where: { id },
        data: {
          phone,
          linkedin,
          profession,
          segment,
          companyDescription,
        },
        include: {
          intention: {
            select: {
              name: true,
              email: true,
              company: true,
            },
          },
        },
      });

      res.json({
        message: "Perfil completo com sucesso!",
        data: member,
      });
    } catch (error) {
      console.error("Error completing profile:", error);
      res.status(500).json({ error: "Erro ao completar perfil" });
    }
  }

  /**
   * Listar todos os membros (admin)
   */
  async list(req: Request, res: Response) {
    try {
      const { isActive } = req.query;

      const members = await prisma.member.findMany({
        where:
          isActive !== undefined
            ? { isActive: isActive === "true" }
            : undefined,
        include: {
          intention: {
            select: {
              name: true,
              email: true,
              company: true,
            },
          },
          _count: {
            select: {
              indicationsGiven: true,
              indicationsReceived: true,
              thanks: true,
            },
          },
        },
        orderBy: { joinedAt: "desc" },
      });

      res.json({ data: members });
    } catch (error) {
      console.error("Error listing members:", error);
      res.status(500).json({ error: "Erro ao listar membros" });
    }
  }

  /**
   * Buscar membro por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const member = await prisma.member.findUnique({
        where: { id },
        include: {
          intention: true,
          indicationsGiven: {
            include: {
              receiver: {
                include: {
                  intention: {
                    select: { name: true },
                  },
                },
              },
            },
          },
          indicationsReceived: {
            include: {
              giver: {
                include: {
                  intention: {
                    select: { name: true },
                  },
                },
              },
            },
          },
          thanks: true,
        },
      });

      if (!member) {
        return res.status(404).json({ error: "Membro não encontrado" });
      }

      res.json({ data: member });
    } catch (error) {
      console.error("Error getting member:", error);
      res.status(500).json({ error: "Erro ao buscar membro" });
    }
  }

  /**
   * Atualizar dados do membro
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { phone, linkedin, profession, segment, companyDescription } =
        req.body;

      const member = await prisma.member.update({
        where: { id },
        data: {
          phone,
          linkedin,
          profession,
          segment,
          companyDescription,
        },
      });

      res.json({
        message: "Membro atualizado com sucesso",
        data: member,
      });
    } catch (error) {
      console.error("Error updating member:", error);
      res.status(500).json({ error: "Erro ao atualizar membro" });
    }
  }

  /**
   * Desativar membro
   */
  async deactivate(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const member = await prisma.member.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        message: "Membro desativado com sucesso",
        data: member,
      });
    } catch (error) {
      console.error("Error deactivating member:", error);
      res.status(500).json({ error: "Erro ao desativar membro" });
    }
  }

  /**
   * Estatísticas gerais dos membros
   */
  async stats(req: Request, res: Response) {
    try {
      const totalMembers = await prisma.member.count();
      const activeMembers = await prisma.member.count({
        where: { isActive: true },
      });
      const inactiveMembers = totalMembers - activeMembers;

      const totalReferrals = await prisma.referral.count();
      const closedReferrals = await prisma.referral.count({
        where: { status: "CLOSED" },
      });

      const totalThanks = await prisma.thank.count();

      res.json({
        data: {
          members: {
            total: totalMembers,
            active: activeMembers,
            inactive: inactiveMembers,
          },
          referrals: {
            total: totalReferrals,
            closed: closedReferrals,
          },
          thanks: {
            total: totalThanks,
          },
        },
      });
    } catch (error) {
      console.error("Error getting stats:", error);
      res.status(500).json({ error: "Erro ao obter estatísticas" });
    }
  }

  /**
   * Login de membro usando e-mail
   */
  async login(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "E-mail é obrigatório" });
      }

      // Verificar se é email de demonstração
      const isDemoEmail = email === "demo@member.com";

      // Se for demo, criar membro de demonstração automaticamente
      if (isDemoEmail) {
        let intention = await prisma.intention.findFirst({
          where: { email: "demo@member.com" },
        });

        if (!intention) {
          intention = await prisma.intention.create({
            data: {
              name: "Membro Demonstração",
              email: "demo@member.com",
              company: "Empresa Demo",
              reason: "Conta de demonstração",
              status: "APPROVED",
            },
          });
        } else if (intention.status !== "APPROVED") {
          await prisma.intention.update({
            where: { id: intention.id },
            data: { status: "APPROVED" },
          });
        }

        let member = await prisma.member.findUnique({
          where: { intentionId: intention.id },
          include: {
            intention: {
              select: {
                name: true,
                email: true,
                company: true,
              },
            },
          },
        });

        if (!member) {
          member = await prisma.member.create({
            data: {
              intentionId: intention.id,
              phone: "(11) 99999-9999",
              linkedin: "linkedin.com/in/demo",
              profession: "Profissional de Demonstração",
              segment: "Tecnologia",
              companyDescription: "Empresa de demonstração do sistema",
              isActive: true,
            },
            include: {
              intention: {
                select: {
                  name: true,
                  email: true,
                  company: true,
                },
              },
            },
          });
        }

        return res.json({
          message: "Login realizado com sucesso (Demo)",
          data: {
            memberId: member.id,
            name: member.intention.name,
            email: member.intention.email,
            company: member.intention.company,
            needsCompletion: false,
          },
        });
      }

      // Buscar intenção pelo e-mail
      const intention = await prisma.intention.findFirst({
        where: {
          email,
          status: "APPROVED",
        },
      });

      if (!intention) {
        return res.status(404).json({
          error: "Membro não encontrado ou intenção não aprovada",
        });
      }

      // Buscar membro pela intenção
      const member = await prisma.member.findUnique({
        where: { intentionId: intention.id },
        include: {
          intention: {
            select: {
              name: true,
              email: true,
              company: true,
            },
          },
        },
      });

      if (!member) {
        return res.status(404).json({
          error:
            "Cadastro de membro não encontrado. Complete seu cadastro primeiro.",
        });
      }

      if (!member.isActive) {
        return res.status(403).json({
          error:
            "Sua conta está inativa. Entre em contato com o administrador.",
        });
      }

      // Verificar se precisa completar cadastro
      const needsCompletion =
        !member.phone || !member.profession || !member.segment;

      res.json({
        message: "Login realizado com sucesso",
        needsCompletion,
        member: {
          id: member.id,
          name: member.intention.name,
          email: member.intention.email,
          company: member.intention.company,
          profession: member.profession,
          segment: member.segment,
          phone: member.phone,
          linkedin: member.linkedin,
        },
      });
    } catch (error) {
      console.error("Error during member login:", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  }
}

export default new MemberController();
