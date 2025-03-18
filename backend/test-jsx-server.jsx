require('@babel/register')({
    presets: ['@babel/preset-env', '@babel/preset-react'],
    extensions: ['.jsx', '.js']
  });
  
  const mongoose = require('mongoose');
  require('dotenv').config();
  
  // Connect to MongoDB
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/food-delivery')
    .then(() => console.log('MongoDB connected for test script'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
  
  // Define schema
  const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    isVeg: { type: Boolean, default: false },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    stockQuantity: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true }
  });
  
  const MenuItem = mongoose.model('MenuItem', menuItemSchema);
  
  // Create a test item
  async function createTestItem() {
    try {
      // Create a dummy restaurant ID if needed
      const restaurantId = mongoose.Types.ObjectId();
      
      // Create a test item
      const testItem = new MenuItem({
        name: 'Test Pizza',
        description: 'A test pizza for stock management',
        price: 199,
        image: 'https://example.com/test-pizza.jpg',
        category: 'Pizza',
        isVeg: true,
        restaurantId: restaurantId,
        stockQuantity: 5,
        isAvailable: true
      });
      
      await testItem.save();
      console.log('Test item created:', testItem);
      console.log('Use this ID for testing:', testItem._id);
    } catch (error) {
      console.error('Error creating test item:', error);
    } finally {
      mongoose.connection.close();
    }
  }
  
  createTestItem();