import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import { connectDB } from "./db/index.js";
import { app } from "./app.js";
import socketHandler from "./socket/socketHandler.js";
import { fetchAndStoreNews } from "./Controllers/news.controller.js";

dotenv.config({ path: "./.env" });

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "*", // Replace with your frontend origin in production
      },
    });

    global._io = io; // Make accessible globally if needed
    socketHandler(io);

    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);

      // Initial news fetch
      fetchAndStoreNews();

      // Schedule news fetching every hour
      cron.schedule("0 * * * *", async () => {
        console.log("🔁 Cron job running: Updating disaster news...");
        await fetchAndStoreNews();
      });
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB or start server:", err);
  }
};
 export default startServer
