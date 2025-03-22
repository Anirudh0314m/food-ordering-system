const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  formattedAddress: {
    type: String,
    required: true
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  additionalDetails: {
    flatNumber: String,
    buildingName: String,
    landmark: String
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);