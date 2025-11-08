import { Request, Response } from "express";
import prisma from "../lib/prisma";

export class AdminController {
  /**
   * Obter estatísticas completas do dashboard admin
   */
  async getDashboardStats(req: Request, res: Response) {
    try {
      // Estatísticas de membros
      const totalMembers = await prisma.member.count();
      const activeMembers = await prisma.member.count({
        where: { isActive: true },
      });

      // Estatísticas de intenções
      const totalIntentions = await prisma.intention.count();
      const pendingIntentions = await prisma.intention.count({
        where: { status: "PENDING" },
      });

      // Estatísticas de indicações/referrals
      const totalReferrals = await prisma.referral.count();
      const pendingReferrals = await prisma.referral.count({
        where: { status: "PENDING" },
      });

      // Estatísticas de avisos
      const totalAnnouncements = await prisma.announcement.count();
      const activeAnnouncements = await prisma.announcement.count({
        where: { isActive: true },
      });

      // Estatísticas de oportunidades de negócio
      const totalOpportunities = await prisma.businessOpportunity.count();
      const activeOpportunities = await prisma.businessOpportunity.count({
        where: { isActive: true },
      });

      // Estatísticas de reuniões/presenças
      const totalMeetings = await prisma.meeting.count();
      const totalPresences = await prisma.presence.count();

      const dashboardData = {
        members: {
          totalMembers,
          activeMembers,
          inactiveMembers: totalMembers - activeMembers,
        },
        intentions: {
          totalIntentions,
          pendingIntentions,
          approvedIntentions: await prisma.intention.count({
            where: { status: "APPROVED" },
          }),
          rejectedIntentions: await prisma.intention.count({
            where: { status: "REJECTED" },
          }),
        },
        referrals: {
          totalReferrals,
          pendingReferrals,
          completedReferrals: await prisma.referral.count({
            where: { status: "CLOSED" },
          }),
        },
        announcements: {
          totalAnnouncements,
          activeAnnouncements,
        },
        opportunities: {
          totalOpportunities,
          activeOpportunities,
        },
        meetings: {
          totalMeetings,
          totalPresences,
        },
        // Campos compatíveis com o frontend atual
        totalMembers,
        activeMembers,
        pendingIntentions,
        totalIntentions,
        totalReferrals,
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      res
        .status(500)
        .json({ error: "Erro ao obter estatísticas do dashboard" });
    }
  }

  /**
   * Obter estatísticas resumidas
   */
  async getQuickStats(req: Request, res: Response) {
    try {
      const [totalMembers, activeMembers, pendingIntentions, totalReferrals] =
        await Promise.all([
          prisma.member.count(),
          prisma.member.count({ where: { isActive: true } }),
          prisma.intention.count({ where: { status: "PENDING" } }),
          prisma.referral.count(),
        ]);

      res.json({
        totalMembers,
        activeMembers,
        pendingIntentions,
        totalReferrals,
      });
    } catch (error) {
      console.error("Error getting quick stats:", error);
      res.status(500).json({ error: "Erro ao obter estatísticas" });
    }
  }
}

export const adminController = new AdminController();
