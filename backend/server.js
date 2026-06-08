import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import stockRoutes from "./src/routes/stockRoutes.js";
import transactionRoutes from "./src/routes/transactionRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import redisClient, { connectRedis, isRedisReady } from "./src/config/redis.js";
import openApiSpec from "./src/docs/openapi.js";
import swaggerPage from "./src/docs/swaggerPage.js";

const app = express();

app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Stockify API is running...");
});

app.get("/api-docs.json", (req, res) => {
  res.json(openApiSpec);
});

app.get("/api-docs", (req, res) => {
  res.type("html").send(swaggerPage);
});

app.get("/api/test-redis", async (req, res) => {
  if (!isRedisReady()) {
    return res.status(503).json({
      success: false,
      message: "Redis is not connected",
    });
  }

  await redisClient.set("hello", "stockify");

  const value = await redisClient.get("hello");

  res.json({
    success: true,
    value,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Server error",
  });
});

const startServer = async () => {
  await connectDB();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error(`Server startup failed: ${error.message}`);
  process.exit(1);
});
