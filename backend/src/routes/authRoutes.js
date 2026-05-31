import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const authRoutes = express.Router();

authRoutes.post("/register", authLimiter, registerUser);
authRoutes.post("/login", authLimiter, loginUser );
authRoutes.get("/profile", protect, getProfile);

export default authRoutes;