import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { error } from "../utils/response";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 🔹 Ambil token dari cookies ATAU Authorization header
    const token =
      req.cookies?.token ||
      req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json(error("Unauthorized — no token provided", []));
    }

    // 🔹 Verifikasi token JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    (req as any).userId = payload.userId;

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json(error("Unauthorized or invalid token", []));
  }
};
