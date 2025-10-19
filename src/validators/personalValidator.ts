import { z } from "zod";

// ✅ CREATE Personal
export const createPersonalSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  bio: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  socialLinks: z
    .record(z.string(), z.string().url().or(z.string().min(1)))
    .optional(),
});

// ✅ UPDATE Personal
export const updatePersonalSchema = z.object({
  jobTitle: z.string().optional(),
  bio: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  socialLinks: z
    .record(z.string(), z.string().url().or(z.string().min(1)))
    .optional(),
});
