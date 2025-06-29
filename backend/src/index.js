import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import { app } from "./app.js";
import cron from "node-cron";
import { fetchAndStoreNews } from "./Controllers/news.controller.js"; // ✅ Import the news fetch function

dotenv.config({
  path: "./.env"
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`✅ Server is running at port ${process.env.PORT}`);

      // 🟡 Run news fetch once at startup
      fetchAndStoreNews();

      // 🕒 Schedule it to run every 1 hour (you can change the interval)
      cron.schedule("0 * * * *", async () => {
        console.log("🔁 Cron job running: Updating disaster news...");
        await fetchAndStoreNews();
      });
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB server failed to connect!", err);
  });
