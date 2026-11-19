
const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");

const router = express.Router();

// CREATE PRODUCT
router.post("/", async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product
    });
  } catch (err) {
    next(err);
  }
});

// GET ALL PRODUCTS WITH FILTERING, SORTING & PAGINATION
router.get("/", async (req, res, next) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (category) {
      filter.category = new RegExp(
        "^" + category + "$", "i"
      );
    }

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i"
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined)
        filter.price.$gte = Number(minPrice);

      if (maxPrice !== undefined)
        filter.price.$lte = Number(maxPrice);
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(
      100, Math.max(1, Number(limit) || 10)
    );

    const allowedSort = [
      "name", "price", "quantity", "createdAt"
    ];

    const sortField = allowedSort.includes(sort)
      ? sort
      : "createdAt";

    const sortOrder = order === "asc" ? 1 : -1;

    const products = await Product.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      products
    });
  } catch (err) {
    next(err);
  }
});

// LOW STOCK REPORT
router.get("/reports/low-stock", async (req, res, next) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ["$quantity", "$minStock"] }
    });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
});

// CATEGORY-WISE INVENTORY SUMMARY
router.get("/reports/category-summary", async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalValue: {
            $sum: {
              $multiply: ["$price", "$quantity"]
            }
          }
        }
      },
      {
        $sort: { totalValue: -1 }
      }
    ]);

    res.json({
      success: true,
      summary
    });
  } catch (err) {
    next(err);
  }
});

// GET SINGLE PRODUCT
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

// UPDATE PRODUCT DETAILS
router.put("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

// RESTOCK PRODUCT
router.patch("/:id/restock", async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive integer"
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { quantity: amount } },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Stock restocked successfully",
      product
    });
  } catch (err) {
    next(err);
  }
});

// SELL PRODUCT (SAFE STOCK DECREMENT)
router.patch("/:id/sale", async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive integer"
      });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        quantity: { $gte: amount }
      },
      { $inc: { quantity: -amount } },
      { new: true }
    );

    if (!product) {
      const exists = await Product.exists({
        _id: req.params.id
      });

      return res.status(exists ? 400 : 404).json({
        success: false,
        message: exists
          ? "Insufficient stock"
          : "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Sale completed successfully",
      product
    });
  } catch (err) {
    next(err);
  }
});

// DELETE PRODUCT
router.delete("/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
