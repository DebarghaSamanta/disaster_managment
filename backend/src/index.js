import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import startServer from "./server.js";


dotenv.config({
  path: "./.env"
});

startServer()