const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem.jsx');
const StockHistory = require('../models/StockHistory.jsx');
const auth = require('../middleware/auth.jsx');
const admin = require('../middleware/adminAuthMiddleware.jsx');

// Get stock for a specific restaurant
router.get('/restaurant/:restaurantId', auth, async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ restaurantId: req.params.restaurantId });
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update stock for a specific item
router.put('/item/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { newQuantity, notes } = req.body;
    
    console.log(`[DEBUG] Stock update request for item ${itemId}`);
    console.log(`[DEBUG] User: ${JSON.stringify(req.user)}`);
    console.log(`[DEBUG] New quantity: ${newQuantity}, Notes: ${notes || 'None'}`);
    
    // Validate inputs
    if (newQuantity === undefined) {
      return res.status(400).json({ message: 'New quantity is required' });
    }
    
    // Find the item
    let item;
    try {
      console.log(`[DEBUG] Finding item with ID: ${itemId}`);
      item = await MenuItem.findById(itemId);
      
      if (!item) {
        console.log(`[DEBUG] Item not found: ${itemId}`);
        return res.status(404).json({ message: 'Item not found' });
      }
      
      console.log(`[DEBUG] Item found: ${item.name}`);
    } catch (findError) {
      console.error(`[ERROR] Error finding item:`, findError);
      return res.status(500).json({ 
        message: 'Error finding item', 
        error: findError.message 
      });
    }
    
    // Update the item
    try {
      console.log(`[DEBUG] Updating item stock from ${item.stockQuantity} to ${newQuantity}`);
      item.stockQuantity = newQuantity;
      item.isAvailable = newQuantity > 0;
      await item.save();
      console.log(`[DEBUG] Item stock updated successfully`);
    } catch (updateError) {
      console.error(`[ERROR] Error updating item:`, updateError);
      return res.status(500).json({ 
        message: 'Error updating item stock', 
        error: updateError.message 
      });
    }
    
    // Skip stock history for now - we'll add it back after basic update works
    
    res.json({ 
      message: 'Stock updated successfully',
      item: {
        _id: item._id,
        name: item.name,
        stockQuantity: item.stockQuantity,
        isAvailable: item.isAvailable
      }
    });
  } catch (error) {
    console.error('[ERROR] Unhandled error in stock update:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Add this simple test endpoint
router.put('/simple-update/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { newQuantity } = req.body;
    
    console.log(`[TEST] Simple update request for item ${itemId} to quantity ${newQuantity}`);
    console.log(`[TEST] User: ${JSON.stringify(req.user)}`);
    
    // Use updateOne instead of find + save to simplify
    const result = await MenuItem.updateOne(
      { _id: itemId },
      { 
        $set: { 
          stockQuantity: newQuantity,
          isAvailable: newQuantity > 0
        }
      }
    );
    
    console.log(`[TEST] Update result:`, result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (result.modifiedCount === 0) {
      return res.json({ message: 'No changes made to item' });
    }
    
    res.json({ 
      message: 'Item updated successfully',
      result
    });
  } catch (error) {
    console.error('[TEST] Error in simple update:', error);
    res.status(500).json({ 
      message: 'Error in simple update',
      error: error.message,
      stack: error.stack
    });
  }
});

// Get stock history for a specific item
router.get('/history/:itemId', auth, admin, async (req, res) => {
  try {
    const history = await StockHistory.find({ menuItemId: req.params.itemId })
      .sort({ createdAt: -1 })
      .populate('changedBy', 'name');
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stock dashboard statistics
router.get('/dashboard', auth, admin, async (req, res) => {
  try {
    // Get out of stock items
    const outOfStock = await MenuItem.find({ 
      stockQuantity: 0,
      isAvailable: false
    }).populate('restaurantId', 'name');
    
    // Get low stock items
    const lowStock = await MenuItem.find({
      $expr: { 
        $and: [
          { $gt: ['$stockQuantity', 0] },
          { $lte: ['$stockQuantity', '$lowStockThreshold'] }
        ]
      }
    }).populate('restaurantId', 'name');
    
    // Get healthy stock items count
    const healthyStockCount = await MenuItem.countDocuments({
      $expr: { $gt: ['$stockQuantity', '$lowStockThreshold'] }
    });
    
    // Total items count
    const totalItems = await MenuItem.countDocuments();
    
    res.json({
      outOfStock,
      lowStock,
      healthyStockCount,
      totalItems,
      outOfStockCount: outOfStock.length,
      lowStockCount: lowStock.length
    });
  } catch (error) {
    console.error('Error fetching stock dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

