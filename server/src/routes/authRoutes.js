import express from "express";
import { register, login } from "../controllers/authController.js";
import { updateProfile } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
const router = express.Router();
router.put("/profile", verifyToken, updateProfile);
router.post("/register", register);
router.post("/login", login);

export default router;
