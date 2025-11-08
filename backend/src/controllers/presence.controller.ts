import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class PresenceController {
  /**
   * Fazer check-in em uma reunião
   */
  async checkIn(req: Request, res: Response) {
    try {
      const { meetingId, memberId } = req.body;
      const { location, notes } = req.body;

      if (!meetingId || !memberId) {
        return res
          .status(400)
          .json({ error: "ID da reunião e do membro são obrigatórios" });
      }

      // Verificar se reunião existe
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
      });

      if (!meeting) {
        return res.status(404).json({ error: "Reunião não encontrada" });
      }

      // Verificar se membro existe
      const member = await prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        return res.status(404).json({ error: "Membro não encontrado" });
      }

      // Buscar ou criar presença
      let presence = await prisma.presence.findUnique({
        where: {
          meetingId_memberId: {
            meetingId,
            memberId,
          },
        },
      });

      if (presence) {
        // Se já existe, atualizar check-in
        presence = await prisma.presence.update({
          where: { id: presence.id },
          data: {
            checkedIn: true,
            checkedAt: new Date(),
            location: location || presence.location,
            notes: notes || presence.notes,
          },
          include: {
            member: {
              include: {
                intention: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
            meeting: true,
          },
        });
      } else {
        // Criar nova presença com check-in
        presence = await prisma.presence.create({
          data: {
            meetingId,
            memberId,
            checkedIn: true,
            checkedAt: new Date(),
            location,
            notes,
          },
          include: {
            member: {
              include: {
                intention: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
            meeting: true,
          },
        });
      }

      res.json({
        message: "Check-in realizado com sucesso",
        data: presence,
      });
    } catch (error) {
      console.error("Error checking in:", error);
      res.status(500).json({ error: "Erro ao realizar check-in" });
    }
  }

  /**
   * Listar presenças de uma reunião
   */
  async listByMeeting(req: Request, res: Response) {
    try {
      const { meetingId } = req.params;

      const presences = await prisma.presence.findMany({
        where: { meetingId },
        include: {
          member: {
            include: {
              intention: {
                select: {
                  name: true,
                  email: true,
                  company: true,
                },
              },
            },
          },
        },
        orderBy: { checkedAt: "desc" },
      });

      const stats = {
        total: presences.length,
        checkedIn: presences.filter((p) => p.checkedIn).length,
        pending: presences.filter((p) => !p.checkedIn).length,
      };

      res.json({
        data: presences,
        stats,
      });
    } catch (error) {
      console.error("Error listing presences:", error);
      res.status(500).json({ error: "Erro ao listar presenças" });
    }
  }

  /**
   * Listar reuniões e presenças de um membro
   */
  async listByMember(req: Request, res: Response) {
    try {
      const { memberId } = req.params;

      const presences = await prisma.presence.findMany({
        where: { memberId },
        include: {
          meeting: true,
        },
        orderBy: { meeting: { date: "desc" } },
      });

      const stats = {
        total: presences.length,
        attended: presences.filter((p) => p.checkedIn).length,
        missed: presences.filter((p) => !p.checkedIn).length,
        attendanceRate:
          presences.length > 0
            ? (
                (presences.filter((p) => p.checkedIn).length /
                  presences.length) *
                100
              ).toFixed(1)
            : "0",
      };

      res.json({
        data: presences,
        stats,
      });
    } catch (error) {
      console.error("Error listing member presences:", error);
      res.status(500).json({ error: "Erro ao listar presenças do membro" });
    }
  }

  /**
   * Criar reunião (admin)
   */
  async createMeeting(req: Request, res: Response) {
    try {
      const { title, description, date } = req.body;

      if (!title || !date) {
        return res
          .status(400)
          .json({ error: "Título e data são obrigatórios" });
      }

      const meeting = await prisma.meeting.create({
        data: {
          title,
          description,
          date: new Date(date),
        },
      });

      res.status(201).json({
        message: "Reunião criada com sucesso",
        data: meeting,
      });
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ error: "Erro ao criar reunião" });
    }
  }

  /**
   * Listar todas as reuniões
   */
  async listMeetings(req: Request, res: Response) {
    try {
      const { upcoming } = req.query;

      const where = upcoming
        ? {
            date: {
              gte: new Date(),
            },
          }
        : {};

      const meetings = await prisma.meeting.findMany({
        where,
        orderBy: { date: "desc" },
        include: {
          presences: {
            include: {
              member: {
                include: {
                  intention: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const meetingsWithStats = meetings.map((meeting) => ({
        ...meeting,
        stats: {
          totalPresences: meeting.presences.length,
          checkedIn: meeting.presences.filter((p) => p.checkedIn).length,
          pending: meeting.presences.filter((p) => !p.checkedIn).length,
        },
      }));

      res.json({ data: meetingsWithStats });
    } catch (error) {
      console.error("Error listing meetings:", error);
      res.status(500).json({ error: "Erro ao listar reuniões" });
    }
  }

  /**
   * Deletar reunião (admin)
   */
  async deleteMeeting(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.meeting.delete({
        where: { id },
      });

      res.json({ message: "Reunião deletada com sucesso" });
    } catch (error) {
      console.error("Error deleting meeting:", error);
      res.status(500).json({ error: "Erro ao deletar reunião" });
    }
  }
}

export default new PresenceController();
