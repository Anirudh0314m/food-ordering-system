const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem.jsx');

// Get all menu items by restaurant ID
router.get('/menu-items/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    console.log('Fetching menu items for restaurant:', restaurantId);
    const menuItems = await MenuItem.find({ restaurantId });
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add a new menu item
router.post('/menu-items', async (req, res) => {
  try {
    console.log('Received menu item data:', req.body);
    const menuItem = new MenuItem(req.body);
    const savedItem = await menuItem.save();
    console.log('Saved menu item:', savedItem);
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update menu item
router.put('/menu-items/:id', async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a menu item
router.delete('/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Attempting to delete menu item:', id);

    const deletedItem = await MenuItem.findByIdAndDelete(id);
    
    if (!deletedItem) {
      console.log('Menu item not found:', id);
      return res.status(404).json({ message: 'Menu item not found' });
    }

    console.log('Successfully deleted menu item:', id);
    res.json({ 
      message: 'Menu item deleted successfully',
      deletedItem 
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ 
      message: 'Failed to delete menu item',
      error: error.message 
    });
  }
});

module.exports = router;