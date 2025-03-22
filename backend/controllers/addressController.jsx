const Address = require('../models/Address.jsx');
const mongoose = require('mongoose');

const addressController = {
  // Get all addresses for the current user
  getAllAddresses: async (req, res) => {
    try {
      console.log("Fetching addresses for user:", req.user);
      
      // Extract user ID from token the same way as in createAddress
      const userId = req.user?.userId || req.user?.id || req.user?._id;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID not found in token" });
      }
      
      // Create ObjectId from userId
      const userObjectId = new mongoose.Types.ObjectId(userId);
      console.log("Looking for addresses with user ID:", userObjectId);
      
      // Find addresses for this user
      const addresses = await Address.find({ user: userObjectId });
      console.log(`Found ${addresses.length} addresses`);
      
      res.json(addresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get a specific address by ID
  getAddressById: async (req, res) => {
    try {
      // Extract user ID from token
      const userId = req.user?.userId || req.user?.id || req.user?._id;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID not found in token" });
      }
      
      // Create ObjectId
      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      const address = await Address.findOne({ 
        _id: req.params.id, 
        user: userObjectId
      });
      
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }
      
      res.json(address);
    } catch (error) {
      console.error('Error fetching address:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Create a new address
  createAddress: async (req, res) => {
    try {
      console.log("Received address data:", req.body);
      
      // Extract user ID from token
      const userId = req.user?.userId || req.user?.id || req.user?._id;
      console.log("User ID from token:", userId);
      
      // Use user ID from token if available, otherwise from request body
      const userIdToUse = userId || req.body.user;
      
      if (!userIdToUse) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Create new address document
      const newAddress = new Address({
        type: req.body.type,
        formattedAddress: req.body.formattedAddress,
        coordinates: req.body.coordinates,
        additionalDetails: req.body.additionalDetails || {},
        isDefault: req.body.isDefault || false,
        // FIX: Use 'new' with the ObjectId constructor
        user: new mongoose.Types.ObjectId(userIdToUse)
      });
      
      // Save to database
      const savedAddress = await newAddress.save();
      console.log("Address saved successfully:", savedAddress._id);
      
      // Return the saved address
      res.status(201).json(savedAddress);
    } catch (error) {
      console.error("Error creating address:", error);
      
      // Better error handling
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          details: error.message 
        });
      }
      
      res.status(500).json({ 
        message: 'Server error',
        details: error.message 
      });
    }
  },

  // Update an address
  updateAddress: async (req, res) => {
    try {
      const { type, formattedAddress, coordinates, additionalDetails, isDefault } = req.body;
      
      // Find address
      let address = await Address.findOne({ 
        _id: req.params.id, 
        user: req.user._id 
      });
      
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }
      
      // If setting as default, unset any other default first
      if (isDefault && !address.isDefault) {
        await Address.updateMany(
          { user: req.user._id, isDefault: true },
          { $set: { isDefault: false } }
        );
      }
      
      // Update fields
      address.type = type || address.type;
      address.formattedAddress = formattedAddress || address.formattedAddress;
      address.coordinates = coordinates || address.coordinates;
      address.additionalDetails = additionalDetails || address.additionalDetails;
      address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;
      
      await address.save();
      res.json(address);
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete an address
  deleteAddress: async (req, res) => {
    try {
      const address = await Address.findOne({ 
        _id: req.params.id, 
        user: req.user._id 
      });
      
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }
      
      await address.remove();
      res.json({ message: 'Address deleted successfully' });
    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Set an address as default
  setDefaultAddress: async (req, res) => {
    try {
      // First, unset any current default
      await Address.updateMany(
        { user: req.user._id, isDefault: true },
        { $set: { isDefault: false } }
      );
      
      // Set the new default
      const address = await Address.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { $set: { isDefault: true } },
        { new: true }
      );
      
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }
      
      res.json(address);
    } catch (error) {
      console.error('Error setting default address:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = addressController;