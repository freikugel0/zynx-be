import { Request, Response } from "express";
import prisma from "../config/prisma";
import { success, error } from "../utils/response";

// ✅ POST /profile
export const createProfile = async (req: Request, res: Response) => {
  const userId = (req as any).userId; // dari authMiddleware
  const { fullName, position, phone } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json(error("User not found", []));
    }

    const photo = req.file ? req.file.filename : undefined;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { fullName, position, phone, photo },
    });

    return res
      .status(201)
      .json(success("Profile successfully created", updated));
  } catch (err) {
    console.error(err);
    return res.status(400).json(error("Failed to create profile", []));
  }
};

// ✅ PUT /profile
export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { fullName, position, phone } = req.body;

  try {
    const photo = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { fullName, position, phone, ...(photo && { photo }) },
      omit: {
        password: true,
      },
    });

    return res
      .status(200)
      .json(success("Profile successfully updated", updated));
  } catch (err) {
    console.error(err);
    return res.status(400).json(error("Failed to update profile", []));
  }
};

// ✅ GET /profile/:userId
export const getProfileById = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const profile = await prisma.user.findUnique({
      where: { slug: slug },
      select: {
        id: true,
        fullName: true,
        position: true,
        phone: true,
        photo: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return res.status(404).json(error("Profile not found", []));
    }

    return res
      .status(200)
      .json(success("Profile successfully retrieved", profile));
  } catch (err) {
    console.error(err);
    return res.status(400).json(error("Failed to get profile", []));
  }
};
