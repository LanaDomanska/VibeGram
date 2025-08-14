import { Router } from "express";
import { authenticate } from "../middlewares/authorization.js";
import { like, unlike, get } from "../controllers/commentLikes.controller.js";

const router = Router();
router.post("/:commentId", authenticate, like);
router.delete("/:commentId", authenticate, unlike);
router.get("/:commentId", authenticate, get);

export default router;
