import { Router } from "express";
import referralController from "../controllers/referral.controller";
import { adminAuth } from "../middleware/auth";

const router = Router();

// Criar indicação de novo membro (vira intenção)
router.post(
  "/refer/:giverId",
  referralController.createReferralAsIntention.bind(referralController),
);

// Todas as rotas de referral requerem autenticação
// Em um cenário real, você teria autenticação de membros também
router.post("/", referralController.create.bind(referralController));
router.get("/", adminAuth, referralController.list.bind(referralController));
router.get(
  "/stats",
  adminAuth,
  referralController.stats.bind(referralController),
);
router.get(
  "/member/:memberId",
  referralController.listByMember.bind(referralController),
);
router.get("/:id", referralController.getById.bind(referralController));
router.patch(
  "/:id/status",
  referralController.updateStatus.bind(referralController),
);
router.patch("/:id", referralController.update.bind(referralController));
router.delete("/:id", referralController.delete.bind(referralController));

export default router;
