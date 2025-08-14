import Comment from "../models/Comment.js";
import HttpException from "../utils/HttpException.js";

// создать комментарий и вернуть с популяцией автора
export async function createComment(userId, postId, text) {
  const created = await Comment.create({
    post: postId,
    author: userId,
    text: text.trim(),
  });

  const withAuthor = await Comment.findById(created._id)
    .populate("author", "username avatar")
    .lean();

  // нормализуем key avatar -> avatarUrl (удобно для фронта)
  return {
    ...withAuthor,
    author: withAuthor.author
      ? { ...withAuthor.author, avatarUrl: withAuthor.author.avatar }
      : withAuthor.author,
  };
}

// список комментариев поста (со всплывающими авторами)
export async function getPostComments(postId) {
  const list = await Comment.find({ post: postId })
    .populate("author", "username avatar")
    .sort({ createdAt: 1 })
    .lean();

  return list.map((c) => ({
    ...c,
    author: c.author
      ? { ...c.author, avatarUrl: c.author.avatar }
      : c.author,
  }));
}

// удалить свой комментарий
export async function deleteComment(commentId, userId) {
  const deleted = await Comment.findOneAndDelete({
    _id: commentId,
    author: userId,
  });
  if (!deleted) throw HttpException(404, "Comment not found or unauthorized");
  return deleted;
}
