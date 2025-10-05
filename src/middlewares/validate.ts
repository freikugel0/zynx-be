import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { error } from "../utils/response";

export const validate =
  (schema: ZodSchema<any>, source: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const data =
      source === "body"
        ? req.body
        : source === "params"
          ? req.params
          : req.query;
    const result = schema.safeParse(data);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const details = zodError.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json(error("Validation error", details));
    }

    next();
  };
