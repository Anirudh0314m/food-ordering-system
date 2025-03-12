const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant.jsx');

// Get all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new restaurant
router.post('/', async (req, res) => {
  try {
    console.log('Received restaurant data:', req.body);
    
    const restaurant = new Restaurant({
      name: req.body.name,
      cuisine: req.body.cuisine,
      category: req.body.category,
      address: req.body.address,
      image: req.body.image
    });

    const savedRestaurant = await restaurant.save();
    console.log('Saved restaurant:', savedRestaurant);
    res.status(201).json(savedRestaurant);
  } catch (error) {
    console.error('Error saving restaurant:', error);
    res.status(400).json({ message: error.message });
  }
});

// Add menu item to restaurant
router.post('/:id/menu', async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = req.body;
    
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.menu.push(menuItem);
    await restaurant.save();
    
    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete restaurant
router.delete('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;