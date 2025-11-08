import { Router } from "express";
import announcementController from "../controllers/announcement.controller";
import { adminAuth } from "../middleware/auth";

const router = Router();

// Rotas admin (devem vir ANTES das rotas com parâmetros)
router.get(
  "/admin/all",
  adminAuth,
  announcementController.listAll.bind(announcementController),
);
router.post(
  "/",
  adminAuth,
  announcementController.create.bind(announcementController),
);

// Rotas públicas (membros podem ver)
router.get("/", announcementController.list.bind(announcementController));
router.get("/:id", announcementController.getById.bind(announcementController));

// Rotas admin de edição/exclusão
router.patch(
  "/:id/deactivate",
  adminAuth,
  announcementController.deactivate.bind(announcementController),
);
router.patch(
  "/:id",
  adminAuth,
  announcementController.update.bind(announcementController),
);
router.delete(
  "/:id",
  adminAuth,
  announcementController.delete.bind(announcementController),
);

export default router;
