import "dotenv/config";

import connectDatabase from "./config/db.js";
import startServer from "./server.js";
import startWebsocketServer from "./wsServer.js";

const bootstrap = async () => {
  try {
    await connectDatabase();

    const server = startServer(); // возвращаем `server` из server.js

    // Запускаем WebSocket сервер, если он есть
    startWebsocketServer(server);
    
  } catch (error) {
    console.error("❌ Error during app startup:", error);
    process.exit(1);
  }
};

bootstrap();
