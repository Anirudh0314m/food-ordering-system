const express = require("express");
const Order = require("../models/Order.jsx");
const Cart = require("../models/Cart.jsx");
const authMiddleware = require("../middleware/authMiddleware.jsx");

const router = express.Router();

// **🔹 Place an Order (Checkout)**
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId }).populate("items.restaurantId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty. Add items before placing an order." });
    }

    // Calculate total order amount
    const totalAmount = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Create new order
    const newOrder = new Order({
      userId,
      items: cart.items,
      totalAmount,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newOrder.save();

    // Clear the cart after placing an order
    await Cart.findOneAndDelete({ userId });

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Order Placement Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// **🔹 Get All Orders for a User**
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// **🔹 Get a Single Order by ID**
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.restaurantId");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    console.error("Fetch Order Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// **🔹 Update Order Status (Admin Only)**
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

  
    res.json({ message: `Order status updated to ${status}`, order });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
