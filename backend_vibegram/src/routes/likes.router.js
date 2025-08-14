import { Router } from "express";
import {
  likePost,
  unlikePost,
  getPostLikes
} from "../controllers/likes.controller.js";

import { authenticate } from "../middlewares/authorization.js";

const likesRouter = Router();

likesRouter.post("/:postId", authenticate, likePost);
likesRouter.delete("/:postId", authenticate, unlikePost);
likesRouter.get("/:postId", authenticate, getPostLikes);

export default likesRouter;
