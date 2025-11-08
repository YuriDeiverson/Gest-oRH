import { Request, Response } from "express";
import prisma from "../lib/prisma";

class PostController {
  // Criar nova publicação (membro)
  async create(req: Request, res: Response) {
    try {
      const { authorId, content, imageUrl } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Conteúdo é obrigatório" });
      }

      const post = await prisma.post.create({
        data: {
          authorId: authorId || null,
          content,
          imageUrl: imageUrl || null,
        },
        include: {
          author: {
            include: {
              intention: { select: { name: true, email: true } },
            },
          },
        },
      });

      res.status(201).json({ message: "Publicação criada", data: post });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Erro ao criar publicação" });
    }
  }

  // Listar publicações (feed)
  async list(req: Request, res: Response) {
    try {
      const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            include: {
              intention: { select: { name: true } },
            },
          },
        },
      });

      res.json({ data: posts });
    } catch (error) {
      console.error("Error listing posts:", error);
      res.status(500).json({ error: "Erro ao listar publicações" });
    }
  }

  // Listar publicações por membro
  async listByMember(req: Request, res: Response) {
    try {
      const { memberId } = req.params;

      const posts = await prisma.post.findMany({
        where: { authorId: memberId },
        orderBy: { createdAt: "desc" },
      });

      res.json({ data: posts });
    } catch (error) {
      console.error("Error listing posts by member:", error);
      res.status(500).json({ error: "Erro ao listar publicações do membro" });
    }
  }
}

export default new PostController();
