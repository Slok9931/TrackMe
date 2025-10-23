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

export default router;
