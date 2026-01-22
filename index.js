process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('CRITICAL UNCAUGHT EXCEPTION:', err);
});

import express from "express";
import "dotenv/config";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth-routes.js";
import thumbnailRouter from "./routes/thumbnail-routes.js";
import userRouter from "./routes/user-routes.js";
import errorMiddleware from "./middleware/error-middleware.js";
import session from "express-session";
import MongoStore from "connect-mongo";

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    credentials: true,
  }),
);
console.log("i ma here")
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // one week 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
  }),
);

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/thumbnail", thumbnailRouter);
app.use("/api/user", userRouter);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Hello world");
});

// Remove the old if/else block and replace with this:
const startServer = async () => {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== "production") {
      app.listen(port, () => {
        console.log(`Server running on port: ${port}`);
      });
    }
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();

export default app;