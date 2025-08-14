import { Server } from "socket.io";
import jwt from "jsonwebtoken";                 
import Message from "./models/Message.js";
import mongoose from "mongoose";

const connectedUsers = new Map(); 

export default function startWebsocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  global._io = io;
  global._connectedUsers = connectedUsers;

  io.on("connection", (socket) => {
    console.log("🔌 socket connected:", socket.id);

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
    }

    socket.on("register", (userId) => {
      const uid = String(userId);
      connectedUsers.set(uid, socket.id);
      socket.data.userId = uid;
      console.log(`✅ user ${uid} online`);
      socket.broadcast.emit("userOnline", { userId: uid });
    });


    socket.on("sendMessage", async (payload, ack) => {
      const to = String(payload?.to || "");
      const from = String(payload?.from || socket.data.userId || "");
      const content = (payload?.content || "").trim();
      await handleSend(io, { from, to, text: content }, ack);
    });

    socket.on("message:send", async (payload, ack) => {
      const to = String(payload?.recipientId || "");
      const from = String(socket.data.userId || payload?.from || "");
      const text = (payload?.text || "").trim();
      await handleSend(io, { from, to, text }, ack);
    });

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

    socket.on("typing", ({ from, to }) => {
      const rs = connectedUsers.get(String(to));
      if (rs) io.to(rs).emit("typing", { from: String(from) });
    });
    socket.on("stopTyping", ({ from, to }) => {
      const rs = connectedUsers.get(String(to));
      if (rs) io.to(rs).emit("stopTyping", { from: String(from) });
    });

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


async function handleSend(io, { from, to, text }, ack) {
  try {
    if (!from || !to || !text) throw new Error("from, to, text are required");

    const message = await Message.create({
  sender: new mongoose.Types.ObjectId(String(from)),
  recipient: new mongoose.Types.ObjectId(String(to)),
      content: text,
    });

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

    if (typeof ack === "function") ack(null, payloadForSender);
  } catch (err) {
    console.error("send error:", err);
    if (typeof ack === "function") ack(err.message || "Send error");
  }
}
