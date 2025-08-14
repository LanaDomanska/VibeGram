import CommentLike from "../models/CommentLike.js";
import { Types } from "mongoose";

export async function likeComment(userId, commentId) {
  await CommentLike.updateOne(
    { user: userId, comment: commentId },
    { $setOnInsert: { user: userId, comment: commentId } },
    { upsert: true }
  );
  const likes = await CommentLike.countDocuments({ comment: commentId });
  return { isLiked: true, likes };
}

export async function unlikeComment(userId, commentId) {
  await CommentLike.deleteOne({ user: userId, comment: commentId });
  const likes = await CommentLike.countDocuments({ comment: commentId });
  return { isLiked: false, likes };
}

export async function getCommentLikes(commentId) {
  const likes = await CommentLike.countDocuments({ comment: commentId });
  return { likes };
}

export async function getLikesSummary(commentIds, userId) {
  const ids = commentIds.map((id) => new Types.ObjectId(id));

  const [countsAgg, myLikes] = await Promise.all([
    CommentLike.aggregate([
      { $match: { comment: { $in: ids } } },
      { $group: { _id: "$comment", count: { $sum: 1 } } },
    ]),
    CommentLike.find({ user: userId, comment: { $in: ids } }).select("comment").lean(),
  ]);

  const counts = new Map(countsAgg.map((c) => [String(c._id), c.count]));
  const liked = new Set(myLikes.map((m) => String(m.comment)));
  return { counts, liked };
}
