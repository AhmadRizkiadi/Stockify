import express from "express";

import { getTransactions } from "../controllers/stockController.js";
import { protect } from "../middleware/authMiddleware.js";

const transactionRoutes = express.Router();

transactionRoutes.get("/", protect, getTransactions);

export default transactionRoutes;
