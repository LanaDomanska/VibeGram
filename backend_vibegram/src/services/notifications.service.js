// src/services/notifications.service.js
import Notification from "../models/Notification.js";

const pickAvatarUrl = (u) => (u?.avatarUrl || u?.avatar || "") ?? "";

export const getNotifications = async (userId) => {
  const docs = await Notification
    .find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("fromUser", "username avatar avatarUrl")
    .populate("post", "_id imageUrl")
    .lean();

  // нормализуем под фронт
  return docs.map(n => ({
    _id: n._id,
    type: n.type,
    createdAt: n.createdAt,
    readAt: n.readAt || (n.read ? n.updatedAt : null),  // поддержка старого флага read
    fromUser: {
      _id: n.fromUser?._id,
      username: n.fromUser?.username,
      avatarUrl: pickAvatarUrl(n.fromUser),            // фронт примет и относительный, и абсолютный
    },
    post: n.post ? { _id: n.post._id, imageUrl: n.post.imageUrl } : null,
  }));
};

export const createNotification = async (data) => {
  // на всякий случай не шлём себе
  if (data.user?.toString?.() === data.fromUser?.toString?.()) return null;
  return Notification.create(data);
};

export const markAsRead = async (userId, notificationId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true, readAt: new Date() },  // ← ставим дату
    { new: true }
  );
};
