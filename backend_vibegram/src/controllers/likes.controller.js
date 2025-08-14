// src/controllers/likes.controller.js
import * as likesService from "../services/likes.service.js";
import Post from "../models/Post.js";
import { createNotification } from "../services/notifications.service.js";
import Notification from "../models/Notification.js";

export const likePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const { likes } = await likesService.likePost(userId, postId);

    const post = await Post.findById(postId).select("author");
    if (post && String(post.author) !== String(userId)) {
      await createNotification({
        user: post.author,
        fromUser: userId,
        post: post._id,
        type: "like",
      });
    }

    res.json({ likes, isLiked: true });
  } catch (e) {
    next(e);
  }
};

export const unlikePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const { likes } = await likesService.unlikePost(userId, postId);

    const post = await Post.findById(postId).select("author");
    if (post && String(post.author) !== String(userId)) {
      await Notification.findOneAndDelete({
        type: "like",
        user: post.author,
        fromUser: userId,
        post: postId,
      });
    }

    res.json({ likes, isLiked: false });
  } catch (e) {
    next(e);
  }
};

export const getPostLikes = async (req, res, next) => {
  try {
    const { likes } = await likesService.getPostLikes(req.params.postId);
    res.json({ likes });
  } catch (e) {
    next(e);
  }
};
