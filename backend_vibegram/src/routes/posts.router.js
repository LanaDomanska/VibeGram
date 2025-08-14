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

// ВАЖНО: два отдельных импорта
import uploadPostImage from "../middlewares/uploadPostImage.js"; // default export из мидлвары
import { uploadPostImage as uploadPostImageController } from "../controllers/posts.controller.js"; // именованный из контроллера

const postsRouter = Router();

// Создать пост
postsRouter.post("/", authenticate, validateBody(postCreateSchema), createPost);

// Лента
postsRouter.get("/feed", authenticate, getFeedPosts);

// По username
postsRouter.get("/username/:username", authenticate, getPostsByUsername);

// Посты пользователя
postsRouter.get("/user/:userId", authenticate, getUserPosts);

// Один пост
postsRouter.get("/:postId", authenticate, getPostById);

// Обновить
postsRouter.put("/:postId", authenticate, validateBody(postUpdateSchema), updatePost);

// Удалить
postsRouter.delete("/:postId", authenticate, deletePost);

// Загрузка изображения поста
postsRouter.post(
  "/image",
  authenticate,
  uploadPostImage.single("image"),
  uploadPostImageController
);

// ✅ Алиасы лайков, чтобы фронт мог бить в /api/posts/:id/like
postsRouter.post("/:postId/like", authenticate, likePost);
postsRouter.delete("/:postId/like", authenticate, unlikePost);

export default postsRouter;
