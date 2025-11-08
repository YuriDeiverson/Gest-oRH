import { Router } from "express";
import businessOpportunityController from "../controllers/businessOpportunity.controller";
import { adminAuth } from "../middleware/auth";

const router = Router();

// Rotas admin (devem vir ANTES das rotas com parâmetros)
router.get(
  "/admin/all",
  adminAuth,
  businessOpportunityController.listAll.bind(businessOpportunityController),
);
router.get(
  "/admin/stats",
  adminAuth,
  businessOpportunityController.getStats.bind(businessOpportunityController),
);
router.post(
  "/",
  adminAuth,
  businessOpportunityController.create.bind(businessOpportunityController),
);

// Rotas públicas (para membros visualizarem oportunidades)
router.get(
  "/",
  businessOpportunityController.list.bind(businessOpportunityController),
);
router.get(
  "/:id",
  businessOpportunityController.getById.bind(businessOpportunityController),
);

// Rotas admin de edição/exclusão (devem vir DEPOIS das rotas específicas)
router.patch(
  "/:id/deactivate",
  adminAuth,
  businessOpportunityController.deactivate.bind(businessOpportunityController),
);
router.patch(
  "/:id",
  adminAuth,
  businessOpportunityController.update.bind(businessOpportunityController),
);
router.delete(
  "/:id",
  adminAuth,
  businessOpportunityController.delete.bind(businessOpportunityController),
);

export default router;
