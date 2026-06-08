import express from "express";

import { stockIn, stockOut } from "../controllers/stockController.js";
import { protect } from "../middleware/authMiddleware.js";

const stockRoutes = express.Router();

stockRoutes.post("/in", protect, stockIn);
stockRoutes.post("/out", protect, stockOut);

export default stockRoutes;
