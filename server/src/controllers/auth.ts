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
    }

    // Handle session-based logout
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  }

  public async googleCallback(req: Request, res: Response) {
    // Handle Google OAuth callback logic here
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    if (req.user) {
      // Create a temporary token as fallback for cross-origin issues
      const token = generateToken(req.user);

      // Force save the session
      req.session.save((err) => {
      });

      // Authentication successful - redirect with token for cross-origin workaround
      const redirectUrl = `${clientUrl}/dsa?token=${token}`;
      res.redirect(redirectUrl);
    } else {
      // Authentication failed
      const errorUrl = `${clientUrl}/login?error=auth_failed`;
      res.redirect(errorUrl);
    }
  }
}
