import Product from "../models/Product.js";
import redisClient, { isRedisReady } from "../config/redis.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinaryUpload.js";
import {
  createPaginationMeta,
  getPagination,
} from "../utils/pagination.js";

const PRODUCT_CACHE_KEY = "products:all";
const DASHBOARD_CACHE_KEY = "dashboard:summary";

const clearProductRelatedCache = async () => {
  if (!isRedisReady()) return;

  await redisClient.del(PRODUCT_CACHE_KEY);
  await redisClient.del(DASHBOARD_CACHE_KEY);
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseNumber = (value) => {
  if (value === undefined || value === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const productSorts = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  nameAsc: { name: 1 },
  nameDesc: { name: -1 },
  stockAsc: { stock: 1 },
  stockDesc: { stock: -1 },
  priceAsc: { price: 1 },
  priceDesc: { price: -1 },
};

export const getProducts = async (req, res) => {
  try {
    const {
      category,
      lowStock,
      maxPrice,
      maxStock,
      minPrice,
      minStock,
      search,
      sort = "newest",
      stockStatus,
    } = req.query;
    const query = {};
    const andFilters = [];
    const { page, limit, skip } = getPagination(req.query);

    if (category && category !== "all") query.category = category;
    if (lowStock === "true" || stockStatus === "low") {
      andFilters.push({ $expr: { $lte: ["$stock", "$minimumStock"] } });
    }
    if (stockStatus === "available") {
      andFilters.push({ $expr: { $gt: ["$stock", "$minimumStock"] } });
    }
    if (stockStatus === "out") {
      query.stock = 0;
    }
    if (search) {
      const regex = { $regex: escapeRegex(search), $options: "i" };
      query.$or = [
        { name: regex },
        { sku: regex },
        { category: regex },
        { description: regex },
      ];
    }

    const parsedMinStock = parseNumber(minStock);
    const parsedMaxStock = parseNumber(maxStock);
    const parsedMinPrice = parseNumber(minPrice);
    const parsedMaxPrice = parseNumber(maxPrice);

    if (parsedMinStock !== null || parsedMaxStock !== null) {
      query.stock = {
        ...(typeof query.stock === "object" ? query.stock : {}),
        ...(parsedMinStock !== null ? { $gte: parsedMinStock } : {}),
        ...(parsedMaxStock !== null ? { $lte: parsedMaxStock } : {}),
      };
    }
    if (parsedMinPrice !== null || parsedMaxPrice !== null) {
      query.price = {
        ...(parsedMinPrice !== null ? { $gte: parsedMinPrice } : {}),
        ...(parsedMaxPrice !== null ? { $lte: parsedMaxPrice } : {}),
      };
    }
    if (andFilters.length) query.$and = andFilters;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(productSorts[sort] || productSorts.newest)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      source: "database",
      data: products,
      pagination: createPaginationMeta({ page, limit, total }),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const cacheKey = `products:${req.params.id}`;
    const cachedProduct = isRedisReady() ? await redisClient.get(cacheKey) : null;

    if (cachedProduct) {
      return res.status(200).json({
        success: true,
        source: "redis-cache",
        data: JSON.parse(cachedProduct),
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (isRedisReady()) {
      await redisClient.setEx(cacheKey, 60 * 5, JSON.stringify(product));
    }

    res.status(200).json({
      success: true,
      source: "database",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      stock,
      minimumStock,
      unit,
      price,
      description,
    } = req.body;

    if (!name || !sku || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, SKU, and category are required",
      });
    }

    const existingProduct = await Product.findOne({ sku });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists",
      });
    }

    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadedImage.secure_url;
      imagePublicId = uploadedImage.public_id;
    }

    const product = await Product.create({
      name,
      sku,
      category,
      stock,
      minimumStock,
      unit,
      price,
      description,
      imageUrl,
      imagePublicId,
    });

    await clearProductRelatedCache();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (req.body.sku && req.body.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: req.body.sku });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists",
        });
      }
    }

    const fields = [
      "name",
      "sku",
      "category",
      "stock",
      "minimumStock",
      "unit",
      "price",
      "description",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    if (req.file) {
      await deleteFromCloudinary(product.imagePublicId);
      const uploadedImage = await uploadToCloudinary(req.file.buffer);
      product.imageUrl = uploadedImage.secure_url;
      product.imagePublicId = uploadedImage.public_id;
    }

    const updatedProduct = await product.save();

    if (isRedisReady()) {
      await redisClient.del(`products:${req.params.id}`);
    }

    await clearProductRelatedCache();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await deleteFromCloudinary(product.imagePublicId);
    await product.deleteOne();

    if (isRedisReady()) {
      await redisClient.del(`products:${req.params.id}`);
    }

    await clearProductRelatedCache();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
