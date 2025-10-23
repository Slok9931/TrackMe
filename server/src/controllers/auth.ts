import { Request, Response } from "express";

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

    console.log("=== OAuth Callback Debug ===");
    console.log("User authenticated:", !!req.user);
    console.log("Client URL:", clientUrl);
    console.log("Session ID:", req.sessionID);

    if (req.user) {
      // Authentication successful
      const redirectUrl = `${clientUrl}/dsa`;
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
