
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },

  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  category: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  quantity: {
    type: Number,
    required: true,
    min: 0,
    validate: Number.isInteger
  },

  minStock: {
    type: Number,
    default: 10,
    min: 0
  },

  supplier: {
    type: String,
    default: "Unknown"
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
