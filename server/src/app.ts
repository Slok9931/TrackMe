import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import { config } from "dotenv";
import { connectDB } from "./config/database";
import { initializePassport } from "./config/passport";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import problemRoutes from "./routes/problem";
import { errorHandler } from "./middleware/errorHandler";

config();

const app = express();
const PORT = process.env.PORT;

// Trust proxy for production deployment (Render.com)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    name: 'trackme.session', // Custom session name
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      // Don't set domain - let it default to the current domain
    },
  })
);
// Debug middleware to log cookies
app.use((req, res, next) => {
  console.log("=== Request Debug ===");
  console.log("Path:", req.path);
  console.log("Session ID:", req.sessionID);
  console.log("Raw Cookies:", req.headers.cookie);
  console.log("User in session:", !!req.user);
  next();
});

app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
connectDB();

// Initialize Passport
initializePassport();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/problems", problemRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
