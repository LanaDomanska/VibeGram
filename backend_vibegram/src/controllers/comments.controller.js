import * as commentsService from "../services/comments.service.js";
import Post from "../models/Post.js";
import { createNotification } from "../services/notifications.service.js";
import { validateBody } from "../middlewares/validateBody.js";
import { commentCreateSchema } from "../validation/comments.schema.js";
import Notification from "../models/Notification.js";
import HttpException from "../utils/HttpException.js";

export const createComment = async (req, res) => {
  await validateBody(commentCreateSchema, req.body);

  const postId = req.params.postId;
  const userId = req.user.id;
  const text = req.body.text;

  const comment = await commentsService.createComment(userId, postId, text);

  const post = await Post.findById(postId);
  if (post && post.author.toString() !== userId.toString()) {
    await createNotification({
      user: post.author,
      fromUser: userId,
      post: post._id,
      type: "comment",
    });
  }

  res.status(201).json(comment); 
};

export const deleteComment = async (req, res) => {
  const userId = req.user.id;
  const commentId = req.params.commentId;

  const comment = await commentsService.deleteComment(commentId, userId);
  await Notification.findOneAndDelete({
    type: "comment",
    fromUser: userId,
    post: comment.post,
  });

  res.json({ message: "Comment deleted" });
};

export const getPostComments = async (req, res) => {
  const comments = await commentsService.getPostComments(req.params.postId);
  res.json(comments);
};
