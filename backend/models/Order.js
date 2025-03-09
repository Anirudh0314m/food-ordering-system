const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Preparing", "Out for Delivery", "Delivered"], default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
