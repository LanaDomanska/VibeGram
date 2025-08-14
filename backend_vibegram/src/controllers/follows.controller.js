import {
  followUser as followService,
  unfollowUser as unfollowService,
  getFollowers,
  getFollowing
} from "../services/follows.service.js";

import { createNotification } from "../services/notifications.service.js";

export const followUser = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    const result = await followService(currentUserId, targetUserId);

    // Если пользователь подписался на другого — отправить уведомление
    if (currentUserId !== targetUserId) {
      await createNotification({
        user: targetUserId,
        fromUser: currentUserId,
        type: "follow",
      });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    const result = await unfollowService(currentUserId, targetUserId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getUserFollowers = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const followers = await getFollowers(userId);
    res.status(200).json(followers);
  } catch (error) {
    next(error);
  }
};

export const getUserFollowing = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const following = await getFollowing(userId);
    res.status(200).json(following);
  } catch (error) {
    next(error);
  }
};
