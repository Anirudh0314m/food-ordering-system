require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react'],
  extensions: ['.jsx', '.js']
});

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const fs = require('fs');


const authRoutes = require("./routes/authRoutes.jsx");
const authMiddleware = require("./middleware/authMiddleware.jsx");
const restaurantRoutes = require('./routes/restaurantRoutes.jsx');
const cartRoutes = require("./routes/cartRoutes.jsx");
const orderRoutes = require("./routes/orderRoutes.jsx");
const paymentRoutes = require("./routes/paymentRoutes.jsx");
const menuItemRoutes = require("./routes/menuItems.jsx"); // Changed to match file name
const dialogflowRouter = require('./routes/dialogFlow');
const addressRoutes = require('./routes/addressRoutes.jsx');
const deliveryPartnerRoutes = require('./routes/deliveryPartnerRoutes.jsx');




const app = express();

app.use(cors({
  origin: ['https://food-ordering-system-beige.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Add this debugging middleware to see all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/food-delivery', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

// Authentication Routes
app.use("/api/auth", authRoutes);

// Protected Route: Requires JWT Token
app.use("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "You accessed a protected route!", user: req.user });
});

// Register Other Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api', menuItemRoutes); // Change this line to use /api base path
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use('/api/dialogflow', dialogflowRouter);
app.use('/api/user/addresses', addressRoutes);
// Add this line with your other routes
app.use('/api/stock', require('./routes/stockRoutes.jsx'));
app.use('/api/auth/delivery-partner', deliveryPartnerRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Add a test endpoint directly in server.jsx to verify Express is working
app.get('/test', (req, res) => {
  res.json({ message: 'Express server is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// 404 handler
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
