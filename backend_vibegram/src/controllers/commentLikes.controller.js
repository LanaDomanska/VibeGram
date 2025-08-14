// src/controllers/commentLikes.controller.js
import * as svc from "../services/commentLikes.service.js";

// PUT/POST лайкнуть комментарий
export async function like(req, res) {
  const { commentId } = req.params;
  const data = await svc.likeComment(req.user.id, commentId);
  // { isLiked: true, likes: number }
  res.json(data);
}

// DELETE снять лайк с комментария
export async function unlike(req, res) {
  const { commentId } = req.params;
  const data = await svc.unlikeComment(req.user.id, commentId);
  // { isLiked: false, likes: number }
  res.json(data);
}

// GET получить количество лайков комментария
export async function get(req, res) {
  const { commentId } = req.params;
  const data = await svc.getCommentLikes(commentId);
  // { likes: number }
  res.json(data);
}
