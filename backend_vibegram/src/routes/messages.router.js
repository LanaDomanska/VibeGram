import { Router } from "express";
import {
  sendMessage,
  getMessagesBetweenUsers,
  getInbox,
} from "../controllers/messages.controller.js";
import { deleteMessage } from "../controllers/messages.controller.js";

import { authenticate } from "../middlewares/authorization.js";

const messagesRouter = Router();

messagesRouter.post("/", authenticate, sendMessage);
messagesRouter.get("/inbox", authenticate, getInbox);
messagesRouter.get("/:userId", authenticate, getMessagesBetweenUsers);
messagesRouter.delete("/:id", authenticate, deleteMessage);

export default messagesRouter;
