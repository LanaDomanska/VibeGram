import { Router } from "express";
import {
  createComment,
  deleteComment,
  getPostComments
} from "../controllers/comments.controller.js";
import { authenticate } from "../middlewares/authorization.js";

const commentsRouter = Router();

commentsRouter.post("/:postId", authenticate, createComment);
commentsRouter.delete("/:commentId", authenticate, deleteComment);
commentsRouter.get("/:postId", authenticate, getPostComments);

export default commentsRouter;
