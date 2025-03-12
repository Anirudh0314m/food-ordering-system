const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  category: { type: String, required: true },
  address: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  deliveryTime: { type: String, default: '30-40 min' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);