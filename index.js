// import express from "express";
// import "dotenv/config";
// import cors from "cors";
// import { connectDB } from "./config/db.js";
// import authRouter from "./routes/auth-routes.js";
// import thumbnailRouter from "./routes/thumbnail-routes.js";
// import userRouter from "./routes/user-routes.js";
// import errorMiddleware from "./middleware/error-middleware.js";
// import session from "express-session";
// import MongoStore from "connect-mongo";

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(cors());

// app.use(
//   session({
//     secret: process.env.SESSION_KEY,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 24 * 7, // one week
//     },
//     store: MongoStore.create({
//       mongoUrl: process.env.MONGODB_URI,
//       collectionName: "sessions",
//     }),
//   }),
// );

// app.use(express.json());

// app.use("/api/auth", authRouter);
// app.use("/api/thumbnail", thumbnailRouter);
// app.use("/api/user", userRouter);

// app.use(errorMiddleware);

// app.get("/", (req, res) => {
//   res.send("Hello world");
// });

// if (process.env.NODE_ENV !== "production") {
//   // Call it here for local development
//   connectDB().then(() => {
//     app.listen(port, () => {
//       console.log(`Server running on port: ${port}`);
//     });
//   });
// } else {
//   // Call it here for production (Vercel)
//   connectDB();
// }

// // THIS IS THE MOST IMPORTANT LINE FOR VERCEL
// export default app;


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

// 1. Trust Proxy is essential for Vercel/proxies to handle cookies correctly
app.set("trust proxy", 1);

app.use(
  cors({
    origin: ["http://localhost:5173"], // Specify your frontend URL
    credentials: true,
  })
);

app.use(express.json());

// 2. Session Configuration
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      // On Vercel (Production), these MUST be set for cross-site cookies
      secure: true, 
      sameSite: "none",
    },
  })
);

// Middleware to ensure DB is connected before processing any request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.get("/", (req, res) => res.send("API is running..."));
app.use("/api/auth", authRouter);
app.use("/api/thumbnail", thumbnailRouter);
app.use("/api/user", userRouter);

app.use(errorMiddleware);

// Only listen locally; Vercel handles the "listening"
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on port: ${port}`));
}

export default app;