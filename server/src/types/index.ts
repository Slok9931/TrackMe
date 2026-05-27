import { Request } from "express";

export interface User {
  _id: string;
  name: string;
  email: string;
  googleId: string;
  profilePicture?: string;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

declare global {
  namespace Express {
    interface User {
      _id: string;
      name: string;
      email: string;
      googleId: string;
      profilePicture?: string;
      createdAt: Date;
    }
  }
}

export interface UserResponse {
  user: User;
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
}
