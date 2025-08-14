import Post from "../models/Post.js";
import HttpException from "../utils/HttpException.js";
import Follow from "../models/Follow.js";

export const createPost = async (postData) => {
  return await Post.create(postData); // здесь всё уже валидно
};


export const getPostById = async (id) => {
  const post = await Post.findById(id).populate("author", "username avatar");
  if (!post) throw HttpException(404, "Post not found");
  return post;
};



export const getUserPosts = async (userId) => {
  return Post.find({ author: userId }).sort({ createdAt: -1 });
};
export const deletePost = async (id, userId) => {
  const post = await Post.findOneAndDelete({ _id: id, author: userId });
  if (!post) throw HttpException(404, "Post not found or unauthorized");
  return post;
};

export const updatePost = async (id, userId, updateData) => {
  const post = await Post.findOneAndUpdate(
    { _id: id, author: userId },
    updateData,
    { new: true }
  );
  if (!post) throw HttpException(404, "Post not found or unauthorized");
  return post;
};
export const getFeedPosts = async (userId) => {
  // Получаем ID всех пользователей, на кого подписан текущий
  const following = await Follow.find({ follower: userId }).select("following");
  const followingIds = following.map(f => f.following.toString());

  // Добавляем самого себя (чтобы видеть свои посты)
  followingIds.push(userId);

  // Находим посты авторов из списка
  const posts = await Post.find({ author: { $in: followingIds } })
    .populate("author", "username avatar")
    .sort({ createdAt: -1 });

  return { posts };
};
