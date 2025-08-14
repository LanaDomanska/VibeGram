import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import notFoundHandler from "./middlewares/notFoundHandler.js";
import errorHandler from "./middlewares/errorHandler.js";

import authRouter from "./routes/auth.router.js";
import usersRouter from "./routes/users.router.js";
import postsRouter from "./routes/posts.router.js";
import commentsRouter from "./routes/comments.router.js";
import likesRouter from "./routes/likes.router.js";
import commentLikesRouter from "./routes/commentLikes.router.js";
import searchRouter from "./routes/search.router.js";
import messagesRouter from "./routes/messages.router.js";
import notificationsRouter from "./routes/notifications.router.js";
import followsRouter from "./routes/follows.router.js";
import exploreRouter from "./routes/explore.router.js";
import mime from "mime";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startServer = () => {
  const app = express();

  // CORS
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma", "Expires"],
    })
  );

  app.use(express.json());
  app.use(morgan("dev"));
  app.use(cookieParser());

  function getMimeType(filePath) {
    return mime.getType(filePath) || "application/octet-stream";
  }


  app.use(
    "/public",
    express.static(path.join(__dirname, "../public"), {
      setHeaders: (res, filePath) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        res.setHeader("Content-Type", getMimeType(filePath));
      },
    })
  );

  app.use("/posts", express.static(path.join(__dirname, "../public/posts")));

  app.use(
    "/avatars",
    express.static(path.join(__dirname, "../public/avatars"), {
      setHeaders: (res, filePath) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        res.setHeader("Content-Type", getMimeType(filePath));
      },
    })
  );

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/posts", postsRouter);
  app.use("/api/comments", commentsRouter);
  app.use("/api/comment-likes", commentLikesRouter);
  app.use("/api/likes", likesRouter);
  app.use("/api/messages", messagesRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/follows", followsRouter);
  app.use("/api/explore", exploreRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });

  return server;
};

export default startServer;
