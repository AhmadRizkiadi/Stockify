import Category from "../models/Category.js";
import Product from "../models/Product.js";
import StockTransaction from "../models/StockTransaction.js";
import redisClient, { isRedisReady } from "../config/redis.js";

const DASHBOARD_CACHE_KEY = "dashboard:summary";

export const getDashboardSummary = async (req, res) => {
  try {
    const cachedSummary = isRedisReady()
      ? await redisClient.get(DASHBOARD_CACHE_KEY)
      : null;

    if (cachedSummary) {
      return res.status(200).json({
        success: true,
        source: "redis-cache",
        data: JSON.parse(cachedSummary),
      });
    }

    const [
      totalProducts,
      totalCategories,
      lowStockProducts,
      stockStats,
      recentTransactions,
    ] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Product.find({ $expr: { $lte: ["$stock", "$minimumStock"] } })
        .sort({ stock: 1 })
        .limit(10),
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalStock: { $sum: "$stock" },
            inventoryValue: { $sum: { $multiply: ["$stock", "$price"] } },
          },
        },
      ]),
      StockTransaction.find()
        .populate("product", "name sku")
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const summary = {
      totalProducts,
      totalCategories,
      totalStock: stockStats[0]?.totalStock || 0,
      inventoryValue: stockStats[0]?.inventoryValue || 0,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentTransactions,
    };

    if (isRedisReady()) {
      await redisClient.setEx(
        DASHBOARD_CACHE_KEY,
        60 * 5,
        JSON.stringify(summary)
      );
    }

    res.status(200).json({
      success: true,
      source: "database",
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
