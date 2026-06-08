import express from "express";

import {
  deleteUser,
  getUsers,
  updateUser,
} from "../controllers/userController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const userRoutes = express.Router();

userRoutes.get("/", protect, adminOnly, getUsers);
userRoutes
  .route("/:id")
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

export default userRoutes;
