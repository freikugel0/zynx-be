import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../config/prisma";
import { success, error } from "../utils/response";
import { sendVerificationEmail } from "../utils/emailService";

// 🔧 Fungsi slugify
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

// 🟢 REGISTER — kirim email verifikasi
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, username } = req.body;

    const userExist = await prisma.user.findUnique({ where: { email } });
    if (userExist) {
      return res.status(409).json(error("User already registered", []));
    }

    const hashed = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        fullName,
        username,
        slug: slugify(fullName),
        verificationToken,
        isVerified: false,
      },
    });

    // ✉️ Kirim email verifikasi
    await sendVerificationEmail(user.email, verificationToken);

    return res.status(201).json(
      success("User registered. Please check your email to verify your account.", {
        id: user.id,
        email: user.email,
        username: user.username,
      })
    );
  } catch (err: any) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json(error("Internal Server Error", [err.message]));
  }
};

// 🟡 VERIFY EMAIL
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json(error("Invalid or missing token", []));

    const user = await prisma.user.findFirst({ where: { verificationToken: String(token) } });
    if (!user) return res.status(404).json(error("Invalid or expired verification token", []));

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },
    });

    return res.status(200).json(success("Email verified successfully! You can now log in.", []));
  } catch (err: any) {
    console.error("VERIFY EMAIL ERROR:", err);
    return res.status(500).json(error("Internal Server Error", [err.message]));
  }
};

// 🔵 LOGIN — hanya bisa kalau sudah verifikasi
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json(error("User not found", []));

    if (!user.isVerified) {
      return res.status(403).json(error("Please verify your email before logging in.", []));
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json(error("Wrong password", []));

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
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

// 🟣 ME — ambil data user login
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

// 🔴 LOGOUT — hapus cookie
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json(success("Logout successful", []));
  } catch (err: any) {
    console.error("LOGOUT ERROR:", err);
    return res.status(500).json(error("Failed to logout", [err.message]));
  }
};
