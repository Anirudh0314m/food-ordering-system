const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  isVeg: {
    type: Boolean,
    default: false
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  // New stock management fields
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);