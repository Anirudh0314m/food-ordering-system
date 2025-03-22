const Address = require('../models/Address.jsx');

const addressController = {
  // Get all addresses for the current user
  getAllAddresses: async (req, res) => {
    try {
      const addresses = await Address.find({ user: req.user._id });
      res.json(addresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get a specific address by ID
  getAddressById: async (req, res) => {
    try {
      const address = await Address.findOne({ 
        _id: req.params.id, 
        user: req.user._id 
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
      const { type, formattedAddress, coordinates, additionalDetails, isDefault } = req.body;
      
      // Validate required fields
      if (!formattedAddress) {
        return res.status(400).json({ message: 'Address is required' });
      }
      
      // Create new address
      const newAddress = new Address({
        user: req.user._id,
        type: type || 'home',
        formattedAddress,
        coordinates,
        additionalDetails,
        isDefault: isDefault || false
      });
      
      // If this is the default address, unset any other default
      if (isDefault) {
        await Address.updateMany(
          { user: req.user._id, isDefault: true },
          { $set: { isDefault: false } }
        );
      }
      
      await newAddress.save();
      res.status(201).json(newAddress);
    } catch (error) {
      console.error('Error creating address:', error);
      res.status(500).json({ message: 'Server error' });
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