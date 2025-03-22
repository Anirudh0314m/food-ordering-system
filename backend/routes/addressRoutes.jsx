const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController.jsx');
const authMiddleware = require('../middleware/authMiddleware.jsx');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all addresses for the logged-in user
router.get('/', addressController.getAllAddresses);

// Get a specific address by ID
router.get('/:id', addressController.getAddressById);

// Create a new address
router.post('/', addressController.createAddress);

// Update an address
router.put('/:id', addressController.updateAddress);

// Delete an address
router.delete('/:id', addressController.deleteAddress);

// Set an address as default
router.patch('/:id/set-default', addressController.setDefaultAddress);

module.exports = router;