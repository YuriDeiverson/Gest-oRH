import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class AnnouncementController {
  /**
   * Criar novo aviso (admin)
   */
  async create(req: Request, res: Response) {
    try {
      const { title, content, type, priority, expiresAt, authorName } =
        req.body;

      if (!title || !content) {
        return res
          .status(400)
          .json({ error: "Título e conteúdo são obrigatórios" });
      }

      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          type: type || "INFO",
          priority: priority || 0,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          authorName: authorName || "Administração",
        },
      });

      res.status(201).json({
        message: "Aviso criado com sucesso",
        data: announcement,
      });
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ error: "Erro ao criar aviso" });
    }
  }

  /**
   * Listar todos os avisos ativos (público para membros)
   */
  async list(req: Request, res: Response) {
    try {
      const announcements = await prisma.announcement.findMany({
        where: {
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        },
        orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
      });

      res.json({ data: announcements });
    } catch (error) {
      console.error("Error listing announcements:", error);
      res.status(500).json({ error: "Erro ao listar avisos" });
    }
  }

  /**
   * Listar TODOS os avisos (admin)
   */
  async listAll(req: Request, res: Response) {
    try {
      const announcements = await prisma.announcement.findMany({
        orderBy: [{ publishedAt: "desc" }],
      });

      res.json({ data: announcements });
    } catch (error) {
      console.error("Error listing all announcements:", error);
      res.status(500).json({ error: "Erro ao listar avisos" });
    }
  }

  /**
   * Buscar aviso por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const announcement = await prisma.announcement.findUnique({
        where: { id },
      });

      if (!announcement) {
        return res.status(404).json({ error: "Aviso não encontrado" });
      }

      res.json({ data: announcement });
    } catch (error) {
      console.error("Error getting announcement:", error);
      res.status(500).json({ error: "Erro ao buscar aviso" });
    }
  }

  /**
   * Atualizar aviso (admin)
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, content, type, priority, expiresAt, isActive } = req.body;

      const announcement = await prisma.announcement.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content && { content }),
          ...(type && { type }),
          ...(priority !== undefined && { priority }),
          ...(expiresAt !== undefined && {
            expiresAt: expiresAt ? new Date(expiresAt) : null,
          }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({
        message: "Aviso atualizado com sucesso",
        data: announcement,
      });
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ error: "Erro ao atualizar aviso" });
    }
  }

  /**
   * Deletar aviso (admin)
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.announcement.delete({
        where: { id },
      });

      res.json({ message: "Aviso deletado com sucesso" });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ error: "Erro ao deletar aviso" });
    }
  }

  /**
   * Desativar aviso (soft delete - admin)
   */
  async deactivate(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const announcement = await prisma.announcement.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        message: "Aviso desativado com sucesso",
        data: announcement,
      });
    } catch (error) {
      console.error("Error deactivating announcement:", error);
      res.status(500).json({ error: "Erro ao desativar aviso" });
    }
  }
}

export default new AnnouncementController();
