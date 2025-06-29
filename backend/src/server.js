import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { app } from "./app.js";
import { connectDB } from "./db/index.js";
import socketHandler from "./socket/socketHandler.js";

export const startServer = async () => {
  try {
    await connectDB(); // connect to MongoDB

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "*", // customize for frontend origin
      },
    });

    // Attach io to request object
    global._io = io;

    // Handle socket connections
    socketHandler(io);

    const PORT = process.env.PORT || 8000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB or start server:", err);
  }
};
