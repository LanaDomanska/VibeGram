import { Router } from "express";
import { getExploreFeed } from "../controllers/explore.controller.js";

const router = Router();
router.get("/", getExploreFeed);
export default router;
