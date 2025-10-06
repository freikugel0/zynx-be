import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { success, error } from "../utils/response";

// 🔧 Fungsi slugify langsung di sini
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

    // cek email
    const userExist = await prisma.user.findUnique({ where: { email } });
    if (userExist) {
      return res.status(409).json(error("User is already registered", []));
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // simpan user
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
      success("User is successfully created", {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        slug: user.slug,
      }),
    );
  } catch (err: any) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json(error("Internal Server Error", [err.message]));
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json(error("User not found", []));
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json(error("Wrong password", []));
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    return res.status(200).json(success("Login successful", { token }));
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json(error("Internal Server Error", [err.message]));
  }
};

// AUTH ME
export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json(error("Unauthorized", []));
    }

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
