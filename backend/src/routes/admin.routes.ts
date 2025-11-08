import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { adminAuth } from "../middleware/auth";

const router = Router();

// Rotas protegidas por autenticação admin
router.get(
  "/dashboard",
  adminAuth,
  adminController.getDashboardStats.bind(adminController),
);
router.get(
  "/stats",
  adminAuth,
  adminController.getQuickStats.bind(adminController),
);

export default router;
