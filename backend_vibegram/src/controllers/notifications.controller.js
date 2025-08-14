import * as notificationsService from "../services/notifications.service.js";

export const getNotifications = async (req, res) => {
  const notifications = await notificationsService.getNotifications(req.user.id);
  res.json(notifications);
};

export const markAsRead = async (req, res) => {
  await notificationsService.markAsRead(req.user.id, req.params.id);
  res.json({ message: "Notification marked as read" });
};
