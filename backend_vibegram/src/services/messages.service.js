import Message from "../models/Message.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import HttpException from "../utils/HttpException.js";

export async function sendMessage(senderId, recipientId, text) {
  if (!senderId || !recipientId || !text?.trim()) {
    throw HttpException(400, "senderId, recipientId и text обязательны");
  }
  if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(recipientId)) {
    throw HttpException(400, "Invalid senderId or recipientId");
  }

  const message = await Message.create({
    sender: new mongoose.Types.ObjectId(senderId),
    recipient: new mongoose.Types.ObjectId(recipientId),
    content: text.trim(),
  });

  const io = global._io;
  const users = global._connectedUsers;
  if (io && users) {
    const recipientSocket = users.get(String(recipientId));
    const senderSocket = users.get(String(senderId));
    if (recipientSocket) io.to(recipientSocket).emit("message:new", message);
    if (senderSocket)   io.to(senderSocket).emit("message:new", message);
  }

  return message;
}

export async function deleteMessage(messageId, userId) {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw HttpException(400, "Invalid messageId");
  }

  const message = await Message.findById(messageId);
  if (!message) throw HttpException(404, "Сообщение не найдено");
  if (String(message.sender) !== String(userId)) {
    throw HttpException(403, "Можно удалить только свои сообщения");
  }

  await Message.deleteOne({ _id: messageId });

  const io = global._io;
  const users = global._connectedUsers;
  const recipientSocket = users?.get(String(message.recipient));
  if (io && recipientSocket) {
    io.to(recipientSocket).emit("messageDeleted", { messageId, from: userId });
  }

  return { _id: messageId };
}

export async function getMessagesBetweenUsers(user1Id, user2Id) {
  return Message.find({
    $or: [
      { sender: user1Id, recipient: user2Id },
      { sender: user2Id, recipient: user1Id },
    ],
  })
    .populate("sender", "username avatar")
    .sort({ createdAt: 1 });
}

export async function getInbox(userId) {
  const objectId = new mongoose.Types.ObjectId(userId);

  const raw = await Message.aggregate([
    { $match: { $or: [{ sender: objectId }, { recipient: objectId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ["$sender", objectId] }, "$recipient", "$sender"],
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$recipient", objectId] }, { $eq: ["$read", false] }] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const partnerIds = raw.map((i) => i._id);
  const users = await User.find({ _id: { $in: partnerIds } }).select("username avatar");

  return raw.map((i) => {
    const user = users.find((u) => String(u._id) === String(i._id));
    return {
      user, 
      lastMessage: {
        content: i.lastMessage.content,
        createdAt: i.lastMessage.createdAt,
      },
      unreadCount: i.unreadCount,
    };
  });
}
