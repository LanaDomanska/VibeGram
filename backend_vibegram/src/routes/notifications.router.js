import { Router } from "express";
import {
  getNotifications,
  markAsRead
} from "../controllers/notifications.controller.js";

import { authenticate } from "../middlewares/authorization.js";

const notificationsRouter = Router();

notificationsRouter.get("/", authenticate, getNotifications);
notificationsRouter.put("/:id/read", authenticate, markAsRead);

export default notificationsRouter;
