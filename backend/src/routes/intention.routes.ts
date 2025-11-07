import { Router } from "express";
import intentionController from "../controllers/intention.controller";
import { adminAuth } from "../middleware/auth";

const router = Router();

// Rotas públicas
router.post("/", intentionController.create.bind(intentionController));
router.get(
  "/validate/:token",
  intentionController.validateToken.bind(intentionController),
);
router.get("/public/list", intentionController.list.bind(intentionController));
router.patch(
  "/:id/tracking-status",
  intentionController.updateTrackingStatus.bind(intentionController),
);

// Rotas protegidas (admin)
router.get("/", adminAuth, intentionController.list.bind(intentionController));
router.get(
  "/:id",
  adminAuth,
  intentionController.getById.bind(intentionController),
);
router.patch(
  "/:id/approve",
  adminAuth,
  intentionController.approve.bind(intentionController),
);
router.patch(
  "/:id/reject",
  adminAuth,
  intentionController.reject.bind(intentionController),
);

export default router;
