const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.jsx");

const router = express.Router();

// **Register Route**
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Debug log
    console.log('Registration attempt:', { name, email });

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Debug log
    console.log('User saved successfully:', user._id);

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '90d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// **Login Route**
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "90d",
    });

    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// **Refresh Token Route**
router.post("/refresh-token", async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    
    try {
      // Verify the expired token (ignoring expiration)
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
      
      // Get user information from the decoded token
      const userId = decoded.userId || decoded.user?.id || decoded.id;
      const role = decoded.role || 'user';
      
      if (!userId) {
        return res.status(400).json({ message: "Invalid token format" });
      }
      
      // Find the user in database to verify they still exist
      let user;
      
      if (role === 'delivery_partner') {
        // If token was for a delivery partner
        const DeliveryPartner = require('../models/DeliveryPartner.jsx');
        user = await DeliveryPartner.findById(userId);
      } else {
        // Regular user
        user = await User.findById(userId);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate new token with same payload but new expiration
      const newToken = jwt.sign(
        role === 'delivery_partner' 
          ? { id: user._id, role: 'delivery_partner' } 
          : { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '90d' } // Set to longer duration if needed
      );
      
      // Return the new token
      return res.json({ 
        message: "Token refreshed successfully",
        token: newToken,
        userId: user._id
      });
      
    } catch (tokenError) {
      // If there's an error other than expiration
      if (tokenError.name !== 'TokenExpiredError') {
        return res.status(401).json({ message: "Invalid token" });
      }
      throw tokenError;
    }
    
  } catch (err) {
    console.error("Token refresh error:", err);
    res.status(500).json({ message: "Server error during token refresh" });
  }
});

module.exports = router;
