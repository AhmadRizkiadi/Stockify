import express from "express";

import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadProductImage } from "../middleware/uploadMiddleware.js";

const productRoutes = express.Router();

productRoutes
  .route("/")
  .get(protect, getProducts)
  .post(protect, uploadProductImage.single("image"), createProduct);

productRoutes
  .route("/:id")
  .get(protect, getProductById)
  .put(protect, uploadProductImage.single("image"), updateProduct)
  .delete(protect, deleteProduct);

export default productRoutes;
