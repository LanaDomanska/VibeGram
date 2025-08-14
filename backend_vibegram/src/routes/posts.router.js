import { Router } from "express";
import {
  createPost,
  getFeedPosts,
  getUserPosts,
  getPostById,
  deletePost,
  updatePost,
  getPostsByUsername,
} from "../controllers/posts.controller.js";

import { likePost, unlikePost } from "../controllers/likes.controller.js";
import { authenticate } from "../middlewares/authorization.js";
import { validateBody } from "../middlewares/validateBody.js";
import { postCreateSchema, postUpdateSchema } from "../validation/posts.schema.js";

import uploadPostImage from "../middlewares/uploadPostImage.js"; 
import { uploadPostImage as uploadPostImageController } from "../controllers/posts.controller.js"; 

const postsRouter = Router();

postsRouter.post("/", authenticate, validateBody(postCreateSchema), createPost);

postsRouter.get("/feed", authenticate, getFeedPosts);

postsRouter.get("/username/:username", authenticate, getPostsByUsername);

postsRouter.get("/user/:userId", authenticate, getUserPosts);

postsRouter.get("/:postId", authenticate, getPostById);

postsRouter.put("/:postId", authenticate, validateBody(postUpdateSchema), updatePost);

postsRouter.delete("/:postId", authenticate, deletePost);

postsRouter.post(
  "/image",
  authenticate,
  uploadPostImage.single("image"),
  uploadPostImageController
);

postsRouter.post("/:postId/like", authenticate, likePost);
postsRouter.delete("/:postId/like", authenticate, unlikePost);

export default postsRouter;
