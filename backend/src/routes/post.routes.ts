import { Router } from "express";
import postController from "../controllers/post.controller";

const router = Router();

// Criar e listar publicações
router.post("/", postController.create.bind(postController));
router.get("/", postController.list.bind(postController));
router.get(
  "/member/:memberId",
  postController.listByMember.bind(postController),
);

export default router;
