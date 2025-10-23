import { Request, Response } from "express";
import {
  generateToken,
  getUserFromToken,
  deleteToken,
} from "../utils/tokenStore";

export default class AuthController {
  public async login(req: Request, res: Response) {
    // Handle login logic here
    res.json({ message: "Login endpoint" });
  }

  public async checkAuth(req: Request, res: Response) {
    // Debug endpoint to check authentication status
    console.log("=== Auth Check Debug ===");
    console.log("Session ID:", req.sessionID);
    console.log("User in request:", !!req.user);
    console.log("Session data:", req.session);
    console.log("Cookies:", req.headers.cookie);

    if (req.user) {
      res.json({ authenticated: true, user: req.user });
    } else {
      res.json({ authenticated: false, user: null });
    }
  }

  public async logout(req: Request, res: Response) {
    // Handle token-based logout
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      deleteToken(token); // Clear the token from store
      console.log("Token cleared:", token);
    }

    // Handle session-based logout
    req.logout((err) => {
      if (err) {
        console.log("Session logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      console.log("Session logout successful");
      res.json({ message: "Logged out successfully" });
    });
  }

  public async googleCallback(req: Request, res: Response) {
    // Handle Google OAuth callback logic here
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    console.log("=== OAuth Callback Debug ===");
    console.log("User authenticated:", !!req.user);
    console.log("Client URL:", clientUrl);
    console.log("Session ID:", req.sessionID);
    console.log("Session after auth:", req.session);

    if (req.user) {
      // Create a temporary token as fallback for cross-origin issues
      const token = generateToken(req.user);
      console.log("Generated token:", token);

      // Force save the session
      req.session.save((err) => {
        if (err) {
          console.log("Session save error:", err);
        } else {
          console.log("Session saved successfully");
        }
      });

      // Authentication successful - redirect with token for cross-origin workaround
      const redirectUrl = `${clientUrl}/dsa?token=${token}`;
      console.log("Redirecting to:", redirectUrl);
      res.redirect(redirectUrl);
    } else {
      // Authentication failed
      const errorUrl = `${clientUrl}/login?error=auth_failed`;
      console.log("Authentication failed, redirecting to:", errorUrl);
      res.redirect(errorUrl);
    }
  }
}
