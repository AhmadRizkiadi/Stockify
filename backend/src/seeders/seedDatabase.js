import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import StockTransaction from "../models/StockTransaction.js";
import User from "../models/User.js";

const shouldReset = process.argv.includes("--reset");

const users = [
  {
    name: "Admin Stockify",
    email: "admin@stockify.local",
    password: "stockify123",
    role: "admin",
  },
  {
    name: "Staff Gudang",
    email: "staff@stockify.local",
    password: "stockify123",
    role: "staff",
  },
];

const categories = [
  {
    name: "Electronics",
    description: "Devices, accessories, and electronic spare parts.",
  },
  {
    name: "Office Supplies",
    description: "Consumables and daily office support items.",
  },
  {
    name: "Packaging",
    description: "Boxes, wrap, labels, and shipment materials.",
  },
  {
    name: "Maintenance",
    description: "Tools and operational maintenance supplies.",
  },
];

const products = [
  {
    name: "USB-C Barcode Scanner",
    sku: "EL-SCN-001",
    category: "Electronics",
    stock: 18,
    minimumStock: 5,
    unit: "pcs",
    price: 425000,
    description: "Wired scanner for stock receiving and checkout desks.",
  },
  {
    name: "Thermal Label Printer",
    sku: "EL-PRN-014",
    category: "Electronics",
    stock: 4,
    minimumStock: 6,
    unit: "pcs",
    price: 1380000,
    description: "Compact printer for SKU and shipment labels.",
  },
  {
    name: "A4 Copy Paper 80gsm",
    sku: "OF-PPR-080",
    category: "Office Supplies",
    stock: 72,
    minimumStock: 20,
    unit: "rim",
    price: 62500,
    description: "Standard office paper for daily administration.",
  },
  {
    name: "Permanent Marker Black",
    sku: "OF-MKR-011",
    category: "Office Supplies",
    stock: 12,
    minimumStock: 15,
    unit: "box",
    price: 48000,
    description: "Black permanent markers for labeling cartons.",
  },
  {
    name: "Corrugated Box Medium",
    sku: "PK-BOX-024",
    category: "Packaging",
    stock: 160,
    minimumStock: 50,
    unit: "pcs",
    price: 4500,
    description: "Medium shipping box for marketplace orders.",
  },
  {
    name: "Fragile Sticker Roll",
    sku: "PK-STK-009",
    category: "Packaging",
    stock: 7,
    minimumStock: 10,
    unit: "roll",
    price: 32000,
    description: "Warning labels for breakable items.",
  },
  {
    name: "Safety Cutter",
    sku: "MT-CUT-006",
    category: "Maintenance",
    stock: 25,
    minimumStock: 8,
    unit: "pcs",
    price: 21000,
    description: "Warehouse cutter with retractable blade.",
  },
  {
    name: "Packing Tape Dispenser",
    sku: "MT-TAP-018",
    category: "Maintenance",
    stock: 6,
    minimumStock: 6,
    unit: "pcs",
    price: 57500,
    description: "Handheld tape dispenser for packing stations.",
  },
];

const transactionSeeds = [
  { sku: "EL-SCN-001", type: "IN", quantity: 8, note: "Initial supplier stock" },
  { sku: "EL-PRN-014", type: "OUT", quantity: 2, note: "Issued to branch A" },
  { sku: "OF-PPR-080", type: "IN", quantity: 20, note: "Monthly restock" },
  { sku: "PK-BOX-024", type: "OUT", quantity: 35, note: "Marketplace orders" },
  { sku: "PK-STK-009", type: "OUT", quantity: 3, note: "Packing station usage" },
];

const seedUsers = async () => {
  const seededUsers = [];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const seededUser = await User.findOneAndUpdate(
      { email: user.email },
      { ...user, password: hashedPassword },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    seededUsers.push(seededUser);
  }

  return seededUsers;
};

const seedCategories = async () => {
  for (const category of categories) {
    await Category.findOneAndUpdate({ name: category.name }, category, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
  }
};

const seedProducts = async () => {
  const seededProducts = [];

  for (const product of products) {
    const seededProduct = await Product.findOneAndUpdate(
      { sku: product.sku },
      product,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    seededProducts.push(seededProduct);
  }

  return seededProducts;
};

const seedTransactions = async ({ productsBySku, adminUser }) => {
  for (const transaction of transactionSeeds) {
    const product = productsBySku.get(transaction.sku);
    const payload = {
      product: product._id,
      type: transaction.type,
      quantity: transaction.quantity,
      note: transaction.note,
      createdBy: adminUser._id,
    };

    await StockTransaction.findOneAndUpdate(
      {
        product: product._id,
        type: transaction.type,
        note: transaction.note,
      },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }
};

const runSeeder = async () => {
  await connectDB();

  if (shouldReset) {
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      StockTransaction.deleteMany({}),
      User.deleteMany({}),
    ]);
  }

  const seededUsers = await seedUsers();
  await seedCategories();
  const seededProducts = await seedProducts();
  const productsBySku = new Map(
    seededProducts.map((product) => [product.sku, product])
  );

  await seedTransactions({
    productsBySku,
    adminUser: seededUsers.find((user) => user.role === "admin"),
  });

  console.log("Database seeded successfully.");
  console.log("Admin login: admin@stockify.local / stockify123");
  console.log("Staff login: staff@stockify.local / stockify123");
};

runSeeder()
  .catch((error) => {
    console.error(`Seeder failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
