import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validate";
import {
  createPersonal,
  getPersonal,
  updatePersonal,
  deletePersonal,
} from "../controllers/personalController";
import {
  createPersonalSchema,
  updatePersonalSchema,
} from "../validators/personalValidator";

const router = Router();

// 🟢 Create personal info
router.post("/", authMiddleware, validate(createPersonalSchema, "body"), createPersonal);

// 🟡 Get personal info of logged-in user
router.get("/", authMiddleware, getPersonal);

// 🔵 Update personal by ID
router.put("/:id", authMiddleware, validate(updatePersonalSchema, "body"), updatePersonal);

// 🔴 Delete personal by ID
router.delete("/:id", authMiddleware, deletePersonal);

export default router;
