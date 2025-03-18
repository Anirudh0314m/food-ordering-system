const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const StockHistory = require('../models/StockHistory');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

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
router.put('/item/:itemId', auth, admin, async (req, res) => {
  try {
    const { newQuantity, notes } = req.body;
    
    // Find the item
    const item = await MenuItem.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Determine change type
    let changeType = 'adjust';
    if (newQuantity > item.stockQuantity) {
      changeType = 'add';
    } else if (newQuantity < item.stockQuantity) {
      changeType = 'remove';
    }
    
    // Record history before updating
    const stockHistory = new StockHistory({
      menuItemId: item._id,
      restaurantId: item.restaurantId,
      previousQuantity: item.stockQuantity,
      newQuantity,
      changeType,
      changedBy: req.user.id,
      notes
    });
    
    await stockHistory.save();
    
    // Update availability based on stock
    const isAvailable = newQuantity > 0;
    
    // Update the item
    item.stockQuantity = newQuantity;
    item.isAvailable = isAvailable;
    await item.save();
    
    res.json(item);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Server error' });
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