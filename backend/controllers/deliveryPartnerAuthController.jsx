const DeliveryPartner = require('../models/DeliveryPartner.jsx');

// Register a new delivery partner
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, vehicleType } = req.body;
    
    // Check if email already exists
    const existingPartner = await DeliveryPartner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Create new delivery partner
    const newPartner = new DeliveryPartner({
      name,
      email,
      password,
      phone,
      vehicleType
    });
    
    await newPartner.save();
    
    // Generate token
    const token = newPartner.generateAuthToken();
    
    // Return success without sensitive info
    res.status(201).json({
      message: 'Registration successful! Your account is pending verification.',
      partner: {
        _id: newPartner._id,
        name: newPartner.name,
        email: newPartner.email,
        phone: newPartner.phone,
        vehicleType: newPartner.vehicleType,
        accountStatus: newPartner.accountStatus
      },
      token
    });
  } catch (error) {
    console.error('Delivery partner registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This email is already registered' });
    }
    
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// Login delivery partner
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find partner by email
    const partner = await DeliveryPartner.findOne({ email });
    if (!partner) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if account is suspended
    if (partner.accountStatus === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
    }
    
    // Verify password
    const isPasswordValid = await partner.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate token
    const token = partner.generateAuthToken();
    
    // Return success
    res.status(200).json({
      message: 'Login successful',
      partner: {
        _id: partner._id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        vehicleType: partner.vehicleType,
        isOnline: partner.isOnline,
        accountStatus: partner.accountStatus,
        averageRating: partner.averageRating,
        totalDeliveries: partner.totalDeliveries
      },
      token
    });
  } catch (error) {
    console.error('Delivery partner login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// Get delivery partner profile
exports.getProfile = async (req, res) => {
  try {
    const partnerId = req.user.id;
    
    const partner = await DeliveryPartner.findById(partnerId).select('-password');
    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }
    
    res.status(200).json({ partner });
  } catch (error) {
    console.error('Error fetching delivery partner profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update online status
exports.updateOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const partnerId = req.user.id;
    
    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({ message: 'isOnline must be a boolean value' });
    }
    
    const partner = await DeliveryPartner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }
    
    // If partner has an active order, they cannot go offline
    if (!isOnline && partner.activeOrder) {
      return res.status(400).json({ 
        message: 'You cannot go offline while having an active delivery'
      });
    }
    
    partner.isOnline = isOnline;
    await partner.save();
    
    res.status(200).json({ 
      message: `Status updated to ${isOnline ? 'online' : 'offline'}`,
      isOnline
    });
  } catch (error) {
    console.error('Error updating online status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update location
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const partnerId = req.user.id;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    await DeliveryPartner.findByIdAndUpdate(partnerId, {
      currentLocation: {
        type: 'Point',
        coordinates: [longitude, latitude] // GeoJSON format: [longitude, latitude]
      }
    });
    
    res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};