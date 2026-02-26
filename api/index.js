
import "dotenv/config";
import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
//! ROUTES
import notificationRouter from "../routes/notification.route.js";
import userRouter from "../routes/user.routes.js";
import concernRouter from "../routes/concern.route.js";
import categoryRouter from "../routes/category.route.js";
import announcementRouter from "../routes/announcement.route.js";
import { initWebSocket } from "../lib/ws.js";
import { createServer } from 'http';
import summonRouter from "../routes/summon.route.js";
import feedbackRouter from "../routes/feedback.route.js"

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is Missing")
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Add these middlewares BEFORE your routes
const corsOptions = process.env.NODE_ENV === "production" ? {
  origin: process.env.FRONTEND_URL,
  credentials: true,
} : {}
app.use(cors(corsOptions));

app.get("/api/", (req, res) => {
  res.json({ status: "ok", message: "Server is running!" });
});
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Server is running!" });
});

app.use("/api/users", userRouter);

app.use("/api/concern", concernRouter);

app.use("/api/category", categoryRouter);
app.use("/api/summon", summonRouter);

app.use("/api/notification", notificationRouter);
app.use("/api/feedback", feedbackRouter)
app.use("/api/announcements", announcementRouter);
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`➡️  ${req.method} ${req.originalUrl}`);
    next();
  });
}
const server = createServer(app)
initWebSocket(server)
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV === "development") {
  console.log("\n📌 Concern Router endpoints:");
  console.table(listEndpoints(concernRouter));

  console.log("\n📌 User Router endpoints:");
  console.table(listEndpoints(userRouter));

  console.log("\n📌 Feedback Router endpoints:");
  console.table(listEndpoints(feedbackRouter));

  console.log("\n📌 Notification Router endpoints:");
  console.table(listEndpoints(notificationRouter));
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
