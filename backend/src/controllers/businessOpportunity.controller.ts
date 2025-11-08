import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class BusinessOpportunityController {
  /**
   * Criar nova oportunidade (admin)
   */
  async create(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        company,
        contactName,
        category,
        segment,
        location,
        estimatedValue,
        deadline,
        expiresAt,
        authorName,
      } = req.body;

      if (!title || !description) {
        return res
          .status(400)
          .json({ error: "Título e descrição são obrigatórios" });
      }

      const opportunity = await prisma.businessOpportunity.create({
        data: {
          title,
          description,
          company,
          contactName,
          category: category || "GERAL",
          segment,
          location,
          estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
          deadline: deadline ? new Date(deadline) : null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          authorName: authorName || "Administração",
        },
      });

      res.status(201).json({
        message: "Oportunidade criada com sucesso",
        data: opportunity,
      });
    } catch (error) {
      console.error("Error creating opportunity:", error);
      res.status(500).json({ error: "Erro ao criar oportunidade" });
    }
  }

  /**
   * Listar oportunidades ativas (público para membros)
   */
  async list(req: Request, res: Response) {
    try {
      const { category, segment } = req.query;

      const where: any = {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      };

      if (category) {
        where.category = category;
      }

      if (segment) {
        where.segment = segment;
      }

      const opportunities = await prisma.businessOpportunity.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }],
      });

      res.json({ data: opportunities });
    } catch (error) {
      console.error("Error listing opportunities:", error);
      res.status(500).json({ error: "Erro ao listar oportunidades" });
    }
  }

  /**
   * Listar TODAS as oportunidades (admin)
   */
  async listAll(req: Request, res: Response) {
    try {
      const opportunities = await prisma.businessOpportunity.findMany({
        orderBy: [{ publishedAt: "desc" }],
      });

      res.json({ data: opportunities });
    } catch (error) {
      console.error("Error listing all opportunities:", error);
      res.status(500).json({ error: "Erro ao listar oportunidades" });
    }
  }

  /**
   * Buscar oportunidade por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const opportunity = await prisma.businessOpportunity.findUnique({
        where: { id },
      });

      if (!opportunity) {
        return res.status(404).json({ error: "Oportunidade não encontrada" });
      }

      res.json({ data: opportunity });
    } catch (error) {
      console.error("Error getting opportunity:", error);
      res.status(500).json({ error: "Erro ao buscar oportunidade" });
    }
  }

  /**
   * Atualizar oportunidade (admin)
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: any = {};

      // Apenas adiciona campos que foram enviados
      const fields = [
        "title",
        "description",
        "company",
        "contactName",
        "category",
        "segment",
        "location",
        "estimatedValue",
        "deadline",
        "expiresAt",
        "isActive",
      ];

      fields.forEach((field) => {
        if (req.body[field] !== undefined) {
          if (field === "deadline" || field === "expiresAt") {
            updateData[field] = req.body[field]
              ? new Date(req.body[field])
              : null;
          } else if (field === "estimatedValue") {
            updateData[field] = req.body[field]
              ? parseFloat(req.body[field])
              : null;
          } else {
            updateData[field] = req.body[field];
          }
        }
      });

      const opportunity = await prisma.businessOpportunity.update({
        where: { id },
        data: updateData,
      });

      res.json({
        message: "Oportunidade atualizada com sucesso",
        data: opportunity,
      });
    } catch (error) {
      console.error("Error updating opportunity:", error);
      res.status(500).json({ error: "Erro ao atualizar oportunidade" });
    }
  }

  /**
   * Deletar oportunidade (admin)
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.businessOpportunity.delete({
        where: { id },
      });

      res.json({ message: "Oportunidade deletada com sucesso" });
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      res.status(500).json({ error: "Erro ao deletar oportunidade" });
    }
  }

  /**
   * Desativar oportunidade (soft delete - admin)
   */
  async deactivate(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const opportunity = await prisma.businessOpportunity.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        message: "Oportunidade desativada com sucesso",
        data: opportunity,
      });
    } catch (error) {
      console.error("Error deactivating opportunity:", error);
      res.status(500).json({ error: "Erro ao desativar oportunidade" });
    }
  }

  /**
   * Obter estatísticas de oportunidades (admin)
   */
  async getStats(req: Request, res: Response) {
    try {
      const total = await prisma.businessOpportunity.count();
      const active = await prisma.businessOpportunity.count({
        where: { isActive: true },
      });
      const byCategory = await prisma.businessOpportunity.groupBy({
        by: ["category"],
        _count: true,
      });

      res.json({
        data: {
          total,
          active,
          inactive: total - active,
          byCategory,
        },
      });
    } catch (error) {
      console.error("Error getting opportunity stats:", error);
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  }
}

export default new BusinessOpportunityController();
