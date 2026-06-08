import express from "express";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const categoryRoutes = express.Router();

categoryRoutes.route("/").get(protect, getCategories).post(protect, adminOnly, createCategory);

categoryRoutes
  .route("/:id")
  .put(protect, adminOnly, updateCategory)
  .delete(protect, adminOnly, deleteCategory);

export default categoryRoutes;
