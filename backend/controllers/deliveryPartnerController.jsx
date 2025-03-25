const DeliveryPartner = require('../models/DeliveryPartner.jsx');
const jwt = require('jsonwebtoken');

// Register delivery partner
exports.registerPartner = async (req, res) => {
  try {
    console.log('Received registration data:', req.body);
    const { name, email, password, phone, vehicleType } = req.body;
    
    // Check if email already exists
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
    
    // Generate token - IMPORTANT: Note we're using the field name "token" to match frontend
    const token = jwt.sign(
      { id: partner._id, role: 'delivery_partner' },
      process.env.JWT_SECRET || 'your-delivery-partner-secret',
      { expiresIn: '30d' }
    );
    
    // Return exactly what frontend expects
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login delivery partner
exports.loginPartner = async (req, res) => {
  try {
    console.log('Received login data:', req.body);
    const { email, password } = req.body;
    
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
    
    // Generate token - matching frontend expectations
    const token = jwt.sign(
      { id: partner._id, role: 'delivery_partner' },
      process.env.JWT_SECRET || 'your-delivery-partner-secret',
      { expiresIn: '30d' }
    );
    
    // Return exactly what frontend expects
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};