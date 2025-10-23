import { Router } from "express";
import passport from "passport";
import AuthController from "../controllers/auth";

const router = Router();
const authController = new AuthController();

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  authController.googleCallback
);

router.get("/logout", authController.logout);
router.get("/check", authController.checkAuth);

// Token-based auth endpoint for cross-origin issues
router.get("/token/:token", (req, res) => {
  const { token } = req.params;
  console.log("=== Token Auth ===");
  console.log("Token received:", token);

  try {
    const user = require("../utils/tokenStore").getUserFromToken(token);
    console.log("User from token:", !!user);

    if (user) {
      res.json({ authenticated: true, user });
    } else {
      res.status(401).json({ authenticated: false, message: "Invalid token" });
    }
  } catch (error) {
    console.log("Token auth error:", error);
    res.status(500).json({ authenticated: false, message: "Server error" });
  }
});

// Simple session test endpoint
router.get("/session-test", (req, res) => {
  console.log("=== Session Test ===");
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);
  console.log("Cookies received:", req.headers.cookie);
  res.json({
    sessionId: req.sessionID,
    hasSession: !!req.session,
    sessionData: req.session,
    cookies: req.headers.cookie,
  });
});

export default router;
