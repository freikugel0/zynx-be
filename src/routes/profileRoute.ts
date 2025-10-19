import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validate";
import { upload } from "../config/multer";
import {createProfile, updateProfile, getProfileById} from "../controllers/profileController";
import {createProfileSchema,updateProfileSchema,getProfileSchema} from "../validators/profileValidator";

const router = Router();

router.post(
  "/",
  authMiddleware,
  upload.single("photo"),
  validate(createProfileSchema),
  createProfile,
);
router.put(
  "/",
  authMiddleware,
  upload.single("photo"),
  validate(updateProfileSchema),
  updateProfile,
);
router.get("/:slug", validate(getProfileSchema, "params"), getProfileById);

export default router;
