const express = require('express');
const router = express.Router();
const deliveryPartnerAuthController = require('../controllers/deliveryPartnerAuthController.jsx');
const authMiddleware = require('../middleware/authMiddleware.jsx');

// Auth routes - no authentication required
router.post('/register', deliveryPartnerAuthController.register);
router.post('/login', deliveryPartnerAuthController.login);

// Protected routes - require authentication
router.get(
  '/profile', 
  authMiddleware.protect, 
  authMiddleware.restrictTo('delivery_partner'), 
  deliveryPartnerAuthController.getProfile
);

router.patch(
  '/update-status', 
  authMiddleware.protect, 
  authMiddleware.restrictTo('delivery_partner'), 
  deliveryPartnerAuthController.updateOnlineStatus
);

router.patch(
  '/update-location', 
  authMiddleware.protect, 
  authMiddleware.restrictTo('delivery_partner'), 
  deliveryPartnerAuthController.updateLocation
);

module.exports = router;