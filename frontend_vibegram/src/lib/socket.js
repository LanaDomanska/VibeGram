// src/lib/socket.js
import { io } from "socket.io-client";

// Берём API и убираем "/api" на конце -> получаем origin сервера (3000/5000)
const API = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");

export const socket = io(API, {
  transports: ["websocket"],
  withCredentials: true,
  auth: { token: localStorage.getItem("token") || "" },
});

socket.on("connect", () => console.log("[socket] connected", socket.id));
socket.on("connect_error", (e) => console.warn("[socket] connect_error", e.message));
