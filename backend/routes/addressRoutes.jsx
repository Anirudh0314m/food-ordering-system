const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController.jsx');
const authMiddleware = require('../middleware/authMiddleware.jsx');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes
router.get('/', addressController.getAllAddresses);
router.post('/', addressController.createAddress);
router.get('/:id', addressController.getAddressById);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/set-default', addressController.setDefaultAddress);

module.exports = router;