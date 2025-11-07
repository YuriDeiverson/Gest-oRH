import { Router } from "express";
import memberController from "../controllers/member.controller";
import { adminAuth } from "../middleware/auth";

const router = Router();

// Rotas públicas
router.post(
  "/register/:token",
  memberController.register.bind(memberController),
);
router.post("/login", memberController.login.bind(memberController));
router.post(
  "/:id/complete-profile",
  memberController.completeProfile.bind(memberController),
);
router.get("/public/list", memberController.list.bind(memberController));
router.get("/:id/public", memberController.getById.bind(memberController));

// Rotas protegidas (admin ou membro autenticado)
router.get("/", adminAuth, memberController.list.bind(memberController));
router.get("/stats", adminAuth, memberController.stats.bind(memberController));
router.get("/:id", adminAuth, memberController.getById.bind(memberController));
router.patch("/:id", adminAuth, memberController.update.bind(memberController));
router.patch(
  "/:id/deactivate",
  adminAuth,
  memberController.deactivate.bind(memberController),
);

export default router;
