const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require("../middleware/authMiddleware");
const Order = require("../models/Order");

const router = express.Router();

// **🔹 Debugging: Ensure Stripe API Key is Loaded**
console.log("🔑 Stripe API Key Loaded:", process.env.STRIPE_SECRET_KEY ? "✅ Yes" : "❌ No");

// **🔹 Create a Payment Intent (Stripe)**
router.post("/create-payment-intent", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Missing orderId" });
    }

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    console.log("💳 Creating Payment Intent for Order:", orderId);

    // Create a Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      currency: "usd", // Change to INR if needed
      metadata: { orderId: order._id.toString() }
    });

    console.log("✅ Payment Intent Created:", paymentIntent.id);

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error("❌ Payment Intent Error:", error);
    res.status(500).json({ message: "Payment processing error", error });
  }
});

// **🔹 Confirm Payment and Update Order Status**
router.post("/confirm-payment", authMiddleware, async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    if (!orderId || !paymentIntentId) {
      return res.status(400).json({ message: "Missing orderId or paymentIntentId" });
    }

    console.log("🔍 Checking Payment Intent:", paymentIntentId);

    // Verify payment from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(404).json({ message: "Payment Intent not found" });
    }

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not completed", status: paymentIntent.status });
    }

    console.log("✅ Payment Confirmed for Intent:", paymentIntentId);

    // Update order status
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "Paid";
    await order.save();

    console.log("🛍️ Order Marked as Paid:", orderId);

    res.json({ message: "Payment successful", order });
  } catch (error) {
    console.error("❌ Payment Confirmation Error:", error);
    res.status(500).json({ message: "Error confirming payment", error });
  }
});

module.exports = router;
