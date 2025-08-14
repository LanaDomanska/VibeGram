import Follow from "../models/Follow.js";
import User from "../models/User.js";
import HttpException from "../utils/HttpException.js";

export const followUser = async (currentUserId, targetUserId) => {
  if (currentUserId === targetUserId) {
    throw HttpException(400, "You cannot follow yourself");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw HttpException(404, "Target user not found");

  const alreadyFollowing = await Follow.findOne({
    follower: currentUserId,
    following: targetUserId,
  });

  if (alreadyFollowing) {
    throw HttpException(409, "Already following this user");
  }

  await Follow.create({ follower: currentUserId, following: targetUserId });

  return { message: `You are now following @${targetUser.username}` };
};

export const unfollowUser = async (currentUserId, targetUserId) => {
  if (currentUserId === targetUserId) {
    throw HttpException(400, "You cannot unfollow yourself");
  }

  const deleted = await Follow.findOneAndDelete({
    follower: currentUserId,
    following: targetUserId,
  });

  if (!deleted) {
    throw HttpException(409, "You are not following this user");
  }

  return { message: `You have unfollowed @${targetUserId}` };
};

export const getFollowers = async (userId) => {
  const followers = await Follow.find({ following: userId }).populate("follower", "username email avatar");
  return followers.map((f) => f.follower);
};

export const getFollowing = async (userId) => {
  const following = await Follow.find({ follower: userId }).populate("following", "username email avatar");
  return following.map((f) => f.following);
};
