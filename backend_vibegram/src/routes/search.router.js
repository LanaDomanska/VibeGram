// routes/search.router.js
import { Router } from "express";
import { authenticate } from "../middlewares/authorization.js";
import { getSearch } from "../controllers/search.controller.js";

const router = Router();
router.get("/", authenticate, getSearch);

export default router;
