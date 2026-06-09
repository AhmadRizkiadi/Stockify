import express from "express";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../controllers/userController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const userRoutes = express.Router();

userRoutes
  .route("/")
  .get(protect, adminOnly, getUsers)
  .post(protect, adminOnly, createUser);
userRoutes
  .route("/:id")
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

export default userRoutes;
