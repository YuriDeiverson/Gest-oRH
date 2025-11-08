import { Router } from "express";
import presenceController from "../controllers/presence.controller";
import { adminAuth } from "../middleware/auth";

const router = Router();

// Rotas de check-in (membros podem fazer)
router.post("/checkin", presenceController.checkIn.bind(presenceController));

// Rotas de consulta
router.get(
  "/meeting/:meetingId",
  presenceController.listByMeeting.bind(presenceController),
);
router.get(
  "/member/:memberId",
  presenceController.listByMember.bind(presenceController),
);

// Rotas de reuniões
router.get(
  "/meetings",
  presenceController.listMeetings.bind(presenceController),
);
router.post(
  "/meetings",
  adminAuth,
  presenceController.createMeeting.bind(presenceController),
);
router.delete(
  "/meetings/:id",
  adminAuth,
  presenceController.deleteMeeting.bind(presenceController),
);

export default router;
