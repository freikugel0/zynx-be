import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { success, error } from "../utils/response";

// 🔧 Fungsi slugify
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, username } = req.body;

    const userExist = await prisma.user.findUnique({ where: { email } });
    if (userExist) {
      return res.status(409).json(error("User is already registered", []));
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        fullName,
        username,
        ...(fullName && { slug: slugify(fullName) }),
      },
    });

    return res.status(201).json(
      success("User successfully created", {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        slug: user.slug,
      })
    );
  } catch (err: any) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json(error("Internal Server Error", [err.message]));
  }
};

// LOGIN — simpan token di cookies
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json(error("User not found", []));

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json(error("Wrong password", []));

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    // Simpan token ke cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // ubah ke "none" jika frontend beda domain
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
    });

    return res.status(200).json(
      success("Login successful", {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          slug: user.slug,
        },
      })
    );
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json(error("Internal Server Error", [err.message]));
  }
};

// AUTH ME
export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json(error("Unauthorized", []));

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        slug: true,
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json(error("User not found", []));

    return res.status(200).json(success("User profile fetched", user));
  } catch (err: any) {
    console.error("ME ERROR:", err);
    return res.status(500).json(error("Internal Server Error", [err.message]));
  }
};

// LOGOUT — hapus cookie token
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful, cookie cleared",
    });
  } catch (err: any) {
    console.error("LOGOUT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
};
