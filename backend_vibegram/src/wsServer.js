// src/server/ws/index.js (или как у тебя называется)
import { Server } from "socket.io";
import jwt from "jsonwebtoken";                 // опционально, если хочешь авторизовывать по токену
import Message from "./models/Message.js";
import mongoose from "mongoose";

const connectedUsers = new Map(); // userId -> socketId

export default function startWebsocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // доступ глобально (твой код на них опирается)
  global._io = io;
  global._connectedUsers = connectedUsers;

  io.on("connection", (socket) => {
    console.log("🔌 socket connected:", socket.id);

    // === 1) Авторизация (опционально). Если не хочешь — можно удалить блок ниже.
    try {
      const raw =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization || "").replace(/^Bearer\s+/i, "");
      if (raw && process.env.JWT_SECRET) {
        const { id } = jwt.verify(raw, process.env.JWT_SECRET);
        if (id) {
          connectedUsers.set(String(id), socket.id);
          socket.data.userId = String(id);
          socket.broadcast.emit("userOnline", { userId: String(id) });
        }
      }
    } catch {
      /* не рвём соединение — можно работать через register */
    }

    // === 2) Явная регистрация (твоя логика; фронт может вызвать socket.emit("register", myId))
    socket.on("register", (userId) => {
      const uid = String(userId);
      connectedUsers.set(uid, socket.id);
      socket.data.userId = uid;
      console.log(`✅ user ${uid} online`);
      socket.broadcast.emit("userOnline", { userId: uid });
    });

    // === 3) Отправка сообщения (понимаем оба формата)
    // A) твой формат:  "sendMessage" { to, from, content }
    socket.on("sendMessage", async (payload, ack) => {
      const to = String(payload?.to || "");
      const from = String(payload?.from || socket.data.userId || "");
      const content = (payload?.content || "").trim();
      await handleSend(io, { from, to, text: content }, ack);
    });

    // B) формат компонента: "message:send" { recipientId, text } + ack
    socket.on("message:send", async (payload, ack) => {
      const to = String(payload?.recipientId || "");
      const from = String(socket.data.userId || payload?.from || "");
      const text = (payload?.text || "").trim();
      await handleSend(io, { from, to, text }, ack);
    });

    // === 4) Прочитано
    socket.on("messageRead", async ({ from, to }) => {
      try {
        await Message.updateMany(
          { sender: String(from), recipient: String(to), read: false },
          { $set: { read: true } }
        );
        const senderSocket = connectedUsers.get(String(from));
        if (senderSocket) io.to(senderSocket).emit("messageRead", { by: String(to) });
      } catch (err) {
        console.error("messageRead error:", err);
      }
    });

    // === 5) typing индикатор
    socket.on("typing", ({ from, to }) => {
      const rs = connectedUsers.get(String(to));
      if (rs) io.to(rs).emit("typing", { from: String(from) });
    });
    socket.on("stopTyping", ({ from, to }) => {
      const rs = connectedUsers.get(String(to));
      if (rs) io.to(rs).emit("stopTyping", { from: String(from) });
    });

    // === 6) disconnect
    socket.on("disconnect", () => {
      for (const [userId, sockId] of connectedUsers.entries()) {
        if (sockId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`❌ user ${userId} offline`);
          socket.broadcast.emit("userOffline", { userId });
          break;
        }
      }
    });
  });

  console.log("📡 WebSocket server up");
}

/**
 * Единый обработчик сохранения и рассылки сообщения.
 * Понимает оба клиента и всегда отвечает ack, чтобы фронт не падал по timeout.
 */
async function handleSend(io, { from, to, text }, ack) {
  try {
    if (!from || !to || !text) throw new Error("from, to, text are required");

    const message = await Message.create({
  sender: new mongoose.Types.ObjectId(String(from)),
  recipient: new mongoose.Types.ObjectId(String(to)),
      content: text,
    });

    // эмитим СОБЫТИЯ В ОБОИХ НАЗВАНИЯХ для совместимости
    const payloadForRecipient = {
      _id: message._id,
      content: message.content,
      sender: from,
      recipient: to,
      createdAt: message.createdAt,
      read: false,
    };

    const payloadForSender = {
      _id: message._id,
      content: message.content,
      sender: from,
      recipient: to,
      createdAt: message.createdAt,
      read: false,
    };

    const rSock = global._connectedUsers.get(String(to));
    if (rSock) {
  
      io.to(rSock).emit("newMessage", payloadForRecipient);
    }

    const sSock = global._connectedUsers.get(String(from));
    if (sSock) {
      io.to(sSock).emit("messageSent", payloadForSender);
    }

    // обязательно вернуть ack, чтобы на фронте не срабатывал timeout
    if (typeof ack === "function") ack(null, payloadForSender);
  } catch (err) {
    console.error("send error:", err);
    if (typeof ack === "function") ack(err.message || "Send error");
  }
}
