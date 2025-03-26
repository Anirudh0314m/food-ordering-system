const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const deliveryPartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'bicycle', 'car'],
    default: 'bike'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
deliveryPartnerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
deliveryPartnerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
deliveryPartnerSchema.methods.generateToken = function() {
  return jwt.sign(
    { id: this._id, role: 'delivery_partner' },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: '30d' }
  );
};

const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);

module.exports = DeliveryPartner;