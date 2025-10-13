import { Router } from "express";
import { register, login, me, logout, verifyEmail } from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../validators/authValidator";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.get("/verify-email", verifyEmail);
router.post("/login", validate(loginSchema), login);
router.get("/me", authMiddleware, me);
router.post("/logout", authMiddleware, logout);

export default router;
