const express = require('express');
const router = express.Router();
const DeliveryPartner = require('../models/DeliveryPartner.jsx');
const authMiddleware = require('../middleware/authMiddleware.jsx');

// Test route - accessible without authentication
router.get('/test', (req, res) => {
  res.json({ message: 'Delivery partner routes are working!' });
});

// Register delivery partner
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { name, email, password, phone, vehicleType } = req.body;
    
    // Check if partner already exists
    const existingPartner = await DeliveryPartner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Create new partner
    const partner = new DeliveryPartner({
      name,
      email,
      password,
      phone,
      vehicleType: vehicleType || 'bike'
    });
    
    await partner.save();
    
    // Generate token
    const token = partner.generateToken();
    
    res.status(201).json({
      message: 'Registration successful',
      partner: {
        _id: partner._id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        vehicleType: partner.vehicleType
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login delivery partner
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Find partner
    const partner = await DeliveryPartner.findOne({ email });
    if (!partner) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check password
    const isMatch = await partner.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate token
    const token = partner.generateToken();
    
    res.status(200).json({
      message: 'Login successful',
      partner: {
        _id: partner._id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        vehicleType: partner.vehicleType,
        isOnline: partner.isOnline
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get delivery partner profile - protected route
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.user.id).select('-password');
    
    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }
    
    res.status(200).json({ partner });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// Update delivery partner status - protected route
router.patch('/status', authMiddleware, async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({ message: 'isOnline must be a boolean value' });
    }
    
    const partner = await DeliveryPartner.findByIdAndUpdate(
      req.user.id,
      { isOnline },
      { new: true }
    );
    
    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }
    
    res.status(200).json({
      message: `Status updated to ${isOnline ? 'online' : 'offline'}`,
      isOnline: partner.isOnline
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
});

module.exports = router;