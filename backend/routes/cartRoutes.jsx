const express = require("express");
const Cart = require("../models/Cart.jsx");
const authMiddleware = require("../middleware/authMiddleware.jsx");

const router = express.Router();

// **🔹 Add Item to Cart**
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { restaurantId, name, price, quantity } = req.body;
    const userId = req.user.userId; // Extract user ID from JWT

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.name === name && item.restaurantId.toString() === restaurantId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ restaurantId, name, price, quantity });
    }

    await cart.save();
    res.json({ message: "Item added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// **🔹 Get Cart Items**
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Extract user ID from JWT
    const cart = await Cart.findOne({ userId }).populate("items.restaurantId");
    
    if (!cart) return res.json({ items: [] });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// **🔹 Remove an Item from Cart**
router.delete("/:itemId", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.userId;
      const cart = await Cart.findOne({ userId });
  
      if (!cart) return res.status(404).json({ message: "Cart not found" });
  
      const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.itemId);
  
      if (itemIndex === -1) return res.status(404).json({ message: "Item not found in cart" });
  
      cart.items.splice(itemIndex, 1); // Remove the item
      await cart.save(); // Save changes to DB
  
      res.json({ message: "Item removed from cart", cart });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });
  
module.exports = router;