import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import calculatorRouter from "./routes/calculation.routes.js";
import userRouter from "./routes/user.routes.js";
import chatRouter from "./routes/chat.routes.js";
import newsRouter from "./routes/news.routes.js";
import warehouseRouter from "./routes/warehouse.routes.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Routers
app.use("/api/v1/users", userRouter);
app.use("/api/v1/aid", calculatorRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/news", newsRouter);
app.use("/api/v1/warehouse", warehouseRouter);

export { app };
