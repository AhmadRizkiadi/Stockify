import Product from "../models/Product.js";
import StockTransaction from "../models/StockTransaction.js";
import User from "../models/User.js";
import redisClient, { isRedisReady } from "../config/redis.js";
import {
  createPaginationMeta,
  getPagination,
} from "../utils/pagination.js";

const clearStockCache = async (productId) => {
  if (!isRedisReady()) return;

  await redisClient.del("products:all");
  await redisClient.del(`products:${productId}`);
  await redisClient.del("dashboard:summary");
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseNumber = (value) => {
  if (value === undefined || value === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const transactionSorts = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  quantityAsc: { quantity: 1 },
  quantityDesc: { quantity: -1 },
};

const changeStock = async ({ productId, type, quantity, note, userId }) => {
  const parsedQuantity = Number(quantity);

  if (!productId || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    const error = new Error("Product and positive quantity are required");
    error.status = 400;
    throw error;
  }

  const product = await Product.findById(productId);

  if (!product) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }

  if (type === "OUT" && product.stock < parsedQuantity) {
    const error = new Error("Insufficient stock");
    error.status = 400;
    throw error;
  }

  product.stock =
    type === "IN"
      ? product.stock + parsedQuantity
      : product.stock - parsedQuantity;

  await product.save();

  const transaction = await StockTransaction.create({
    product: product._id,
    type,
    quantity: parsedQuantity,
    note,
    createdBy: userId,
  });

  await clearStockCache(product._id.toString());

  return { product, transaction };
};

export const stockIn = async (req, res) => {
  try {
    const result = await changeStock({
      productId: req.body.product,
      type: "IN",
      quantity: req.body.quantity,
      note: req.body.note,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Stock in recorded successfully",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const stockOut = async (req, res) => {
  try {
    const result = await changeStock({
      productId: req.body.product,
      type: "OUT",
      quantity: req.body.quantity,
      note: req.body.note,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Stock out recorded successfully",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const {
      dateFrom,
      dateTo,
      product,
      quantityMax,
      quantityMin,
      search,
      sort = "newest",
      type,
    } = req.query;
    const query = {};
    const { page, limit, skip } = getPagination(req.query);

    if (type && type !== "all") query.type = type.toUpperCase();
    if (product) query.product = product;
    if (dateFrom || dateTo) {
      query.createdAt = {
        ...(dateFrom ? { $gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { $lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
      };
    }

    const parsedQuantityMin = parseNumber(quantityMin);
    const parsedQuantityMax = parseNumber(quantityMax);

    if (parsedQuantityMin !== null || parsedQuantityMax !== null) {
      query.quantity = {
        ...(parsedQuantityMin !== null ? { $gte: parsedQuantityMin } : {}),
        ...(parsedQuantityMax !== null ? { $lte: parsedQuantityMax } : {}),
      };
    }

    if (search) {
      const regex = { $regex: escapeRegex(search), $options: "i" };
      const [matchingProducts, matchingUsers] = await Promise.all([
        Product.find({
          $or: [{ name: regex }, { sku: regex }, { category: regex }],
        }).select("_id"),
        User.find({
          $or: [{ name: regex }, { email: regex }],
        }).select("_id"),
      ]);

      query.$or = [
        { note: regex },
        { product: { $in: matchingProducts.map((item) => item._id) } },
        { createdBy: { $in: matchingUsers.map((item) => item._id) } },
      ];
    }

    const [transactions, total] = await Promise.all([
      StockTransaction.find(query)
        .populate("product", "name sku category unit")
        .populate("createdBy", "name email role")
        .sort(transactionSorts[sort] || transactionSorts.newest)
        .skip(skip)
        .limit(limit),
      StockTransaction.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: createPaginationMeta({ page, limit, total }),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
