// src/controllers/posts.controller.js
import * as postsService from "../services/posts.service.js";
import * as likesService from "../services/likes.service.js";

import { validateBody } from "../middlewares/validateBody.js";
import { postCreateSchema, postUpdateSchema } from "../validation/posts.schema.js";

import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import HttpException from "../utils/HttpException.js";

// ----------------- Создание поста -----------------
export const createPost = async (req, res, next) => {
  try {
    await validateBody(postCreateSchema, req.body);

    const postData = {
      ...req.body,
      author: req.user.id,
    };

    const post = await postsService.createPost(postData);
    res.status(201).json(post);
  } catch (e) {
    next(e);
  }
};

// ----------------- Лента (обогащено лайками) -----------------
export const getFeedPosts = async (req, res, next) => {
  try {
    const { posts } = await postsService.getFeedPosts(req.user.id);

    const ids = posts.map((p) => p._id);
    const { counts, liked } = await likesService.getLikesSummary(ids, req.user.id);

    const enriched = posts.map((p) => {
      const obj = p.toObject ? p.toObject() : p;
      const id = String(obj._id);
      return {
        ...obj,
        likes: counts.get(id) || 0,
        isLiked: liked.has(id),
      };
    });

    res.json({ posts: enriched });
  } catch (e) {
    next(e);
  }
};

// ----------------- Посты пользователя (обогащено лайками) -----------------
export const getUserPosts = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const posts = await postsService.getUserPosts(userId);

    const ids = posts.map((p) => p._id);
    const { counts, liked } = await likesService.getLikesSummary(ids, req.user.id);

    const enriched = posts.map((p) => {
      const obj = p.toObject ? p.toObject() : p;
      const id = String(obj._id);
      return {
        ...obj,
        likes: counts.get(id) || 0,
        isLiked: liked.has(id),
      };
    });

    res.json(enriched);
  } catch (e) {
    next(e);
  }
};

// ----------------- Один пост (обогащено лайками) -----------------
export const getPostById = async (req, res, next) => {
  try {
    const post = await postsService.getPostById(req.params.postId);

    const { counts, liked } = await likesService.getLikesSummary([post._id], req.user.id);
    const obj = post.toObject ? post.toObject() : post;
    const id = String(obj._id);

    res.json({
      ...obj,
      likes: counts.get(id) || 0,
      isLiked: liked.has(id),
    });
  } catch (e) {
    next(e);
  }
};

// ----------------- По username (обогащено лайками) -----------------
export const getPostsByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });

    const ids = posts.map((p) => p._id);
    const { counts, liked } = await likesService.getLikesSummary(ids, req.user.id);

    const enriched = posts.map((p) => {
      const obj = p.toObject ? p.toObject() : p;
      const id = String(obj._id);
      return {
        ...obj,
        likes: counts.get(id) || 0,
        isLiked: liked.has(id),
      };
    });

    res.json(enriched);
  } catch (e) {
    next(e);
  }
};

// ----------------- Удаление поста -----------------
export const deletePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    await postsService.deletePost(postId, userId);

    // Удаляем уведомления по этому посту
    await Notification.deleteMany({ post: postId });

    res.json({ message: "Post deleted" });
  } catch (e) {
    next(e);
  }
};

// ----------------- Обновление поста -----------------
export const updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const updated = await postsService.updatePost(postId, req.user.id, req.body);
    res.json(updated);
  } catch (e) {
    next(e);
  }
};

// ----------------- Загрузка изображения -----------------
export const uploadPostImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw HttpException(400, "Файл не загружен");
    }

    const imageUrl = `/posts/${req.file.filename}`;
    res.status(201).json({
      message: "Изображение загружено",
      imageUrl,
    });
  } catch (e) {
    next(e);
  }
};
