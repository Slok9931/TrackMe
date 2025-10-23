import { Request, Response } from "express";
import User from "../models/User";

export default class UserController {
  async getProfile(req: Request, res: Response) {
    try {
      console.log("=== User Profile Debug ===");
      console.log("Session ID:", req.sessionID);
      console.log("User in request:", !!req.user);
      console.log("Session data:", req.session);
      console.log("Cookies:", req.headers.cookie);
      
      if (!req.user) {
        console.log("No user found in request - returning 401");
        return res.status(401).json({ message: "Not authenticated" });
      }

      console.log("User found, returning profile");
      // req.user should already be the complete user object from passport
      res.json(req.user);
    } catch (error) {
      console.log("Error in getProfile:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?._id; // Assuming user ID is stored in req.user
      const updatedData = req.body; // Assuming the updated data is sent in the request body
      const user = await User.findByIdAndUpdate(userId, updatedData, {
        new: true,
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
}
