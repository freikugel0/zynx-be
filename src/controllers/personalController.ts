import { Request, Response } from "express";
import prisma from "../config/prisma";
import { success, error } from "../utils/response";

// ✅ CREATE Personal
export const createPersonal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { jobTitle, bio, company, role, socialLinks } = req.body;

    // Cek apakah user sudah punya personal
    const existing = await prisma.personal.findUnique({ where: { userId } });
    if (existing) {
      return res
        .status(400)
        .json(error("Personal info already exists for this user", []));
    }

    const personal = await prisma.personal.create({
      data: {
        userId,
        jobTitle,
        bio,
        company,
        role,
        socialLinks,
      },
    });

    return res
      .status(201)
      .json(success("Personal info created successfully", personal));
  } catch (err: any) {
    console.error("CREATE PERSONAL ERROR:", err);
    return res.status(500).json(error("Internal Server Error", [err.message]));
  }
};

// ✅ READ Personal (by user login)
export const getPersonal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const personal = await prisma.personal.findUnique({
      where: { userId },
    });

    if (!personal) {
      return res.status(404).json(error("Personal info not found", []));
    }

    return res
      .status(200)
      .json(success("Personal info fetched successfully", personal));
  } catch (err: any) {
    console.error("GET PERSONAL ERROR:", err);
    return res.status(500).json(error("Internal Server Error", [err.message]));
  }
};

// ✅ UPDATE Personal
export const updatePersonal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { jobTitle, bio, company, role, socialLinks } = req.body;

    const personal = await prisma.personal.findUnique({
      where: { id: Number(id) },
    });

    if (!personal) {
      return res.status(404).json(error("Personal info not found", []));
    }

    const updated = await prisma.personal.update({
      where: { id: Number(id) },
      data: { jobTitle, bio, company, role, socialLinks },
    });

    return res
      .status(200)
      .json(success("Personal info updated successfully", updated));
  } catch (err: any) {
    console.error("UPDATE PERSONAL ERROR:", err);
    return res.status(500).json(error("Internal Server Error", [err.message]));
  }
};

// ✅ DELETE Personal
export const deletePersonal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const personal = await prisma.personal.findUnique({
      where: { id: Number(id) },
    });

    if (!personal) {
      return res.status(404).json(error("Personal info not found", []));
    }

    await prisma.personal.delete({
      where: { id: Number(id) },
    });

    return res
      .status(200)
      .json(success("Personal info deleted successfully", []));
  } catch (err: any) {
    console.error("DELETE PERSONAL ERROR:", err);
    return res.status(500).json(error("Internal Server Error", [err.message]));
  }
};
