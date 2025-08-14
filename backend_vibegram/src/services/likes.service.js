import Like from "../models/Like.js";
import { Types } from "mongoose";

export async function likePost(userId, postId) {
  await Like.updateOne(
    { user: userId, post: postId },
    { $setOnInsert: { user: userId, post: postId } },
    { upsert: true }
  );
  const likes = await Like.countDocuments({ post: postId });
  return { liked: true, likes };
}

export async function unlikePost(userId, postId) {
  await Like.deleteOne({ user: userId, post: postId });
  const likes = await Like.countDocuments({ post: postId });
  return { liked: false, likes };
}

export async function getPostLikes(postId) {
  const likes = await Like.countDocuments({ post: postId });
  return { likes };
}

/** соберёт для пачки постов:
 *  - Map counts: postId -> кол-во
 *  - Set liked: postId, которые лайкнул userId
 */
export async function getLikesSummary(postIds, userId) {
  const ids = postIds.map((id) => new Types.ObjectId(id));
  const [countsAgg, myLikes] = await Promise.all([
    Like.aggregate([
      { $match: { post: { $in: ids } } },
      { $group: { _id: "$post", count: { $sum: 1 } } },
    ]),
    Like.find({ user: userId, post: { $in: ids } }).select("post").lean(),
  ]);

  const counts = new Map(countsAgg.map((c) => [String(c._id), c.count]));
  const liked = new Set(myLikes.map((m) => String(m.post)));
  return { counts, liked };
}
