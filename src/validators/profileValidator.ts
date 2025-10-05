import { z } from "zod";

export const createProfileSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  position: z.string().min(1, { message: "Position is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
});

export const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
});

export const getProfileSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, { message: "userId must be a valid numeric ID" }),
});
