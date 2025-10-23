import { Request, Response, NextFunction } from "express";
import { getUserFromToken } from "../utils/tokenStore";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // First check session-based authentication (Passport)
  if (req.isAuthenticated && req.isAuthenticated()) {
    console.log("User authenticated via session");
    return next();
  }

  // Check for token-based authentication
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = getUserFromToken(token);
    
    if (user) {
      console.log("User authenticated via token");
      // Attach user to request object for compatibility
      (req as any).user = user;
      return next();
    }
  }

  // Check for token in query params (for debugging/fallback)
  const queryToken = req.query.token as string;
  if (queryToken) {
    const user = getUserFromToken(queryToken);
    if (user) {
      console.log("User authenticated via query token");
      (req as any).user = user;
      return next();
    }
  }

  console.log("No valid authentication found");
  res.status(401).json({ message: "Unauthorized" });
};
