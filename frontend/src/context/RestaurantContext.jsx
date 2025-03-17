import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create context
const RestaurantContext = createContext();

// Provider component
export const RestaurantProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Define sample data in case API isn't available
        const sampleCategories = [
          { _id: 'cat1', name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591' },
          { _id: 'cat2', name: 'Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' },
          { _id: 'cat3', name: 'Asian', image: 'https://images.unsplash.com/photo-1583032015879-e5022cb87c3b' },
          { _id: 'cat4', name: 'Italian', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5' },
          { _id: 'cat5', name: 'Mexican', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' }
        ];
        
        const sampleRestaurants = [
          { 
            _id: 'rest1', 
            name: 'Domino\'s Pizza', 
            cuisine: 'Italian', 
            rating: 4.2, 
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
            categoryIds: ['cat1', 'cat4']
          },
          { 
            _id: 'rest2', 
            name: 'McDonalds', 
            cuisine: 'Fast Food', 
            rating: 3.8, 
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
            categoryIds: ['cat2']
          },
          { 
            _id: 'rest3', 
            name: 'Pizza Hut', 
            cuisine: 'Italian', 
            rating: 4.0, 
            imageUrl: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212',
            categoryIds: ['cat1', 'cat4']
          },
          { 
            _id: 'rest4', 
            name: 'Taco Bell', 
            cuisine: 'Mexican', 
            rating: 3.7, 
            imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
            categoryIds: ['cat5']
          },
          { 
            _id: 'rest5', 
            name: 'Panda Express', 
            cuisine: 'Asian', 
            rating: 4.1, 
            imageUrl: 'https://images.unsplash.com/photo-1583032015879-e5022cb87c3b',
            categoryIds: ['cat3']
          }
        ];
        
        const sampleMenuItems = [
          { _id: 'item1', name: 'Margherita Pizza', price: 12.99, restaurantId: 'rest1', description: 'Classic pizza with tomato sauce, mozzarella, and basil' },
          { _id: 'item2', name: 'Pepperoni Pizza', price: 14.99, restaurantId: 'rest1', description: 'Pizza with tomato sauce, mozzarella, and pepperoni' },
          { _id: 'item3', name: 'Big Mac', price: 5.99, restaurantId: 'rest2', description: 'Two all-beef patties, special sauce, lettuce, cheese, pickles, onions on a sesame seed bun' },
          { _id: 'item4', name: 'McNuggets', price: 6.99, restaurantId: 'rest2', description: 'Crispy chicken nuggets with your choice of dipping sauce' },
          { _id: 'item5', name: 'Supreme Pizza', price: 16.99, restaurantId: 'rest3', description: 'Pizza loaded with pepperoni, sausage, bell peppers, onions, and olives' },
          { _id: 'item6', name: 'Crunchy Taco', price: 1.99, restaurantId: 'rest4', description: 'Seasoned beef, lettuce, and cheese in a crunchy corn shell' },
          { _id: 'item7', name: 'Orange Chicken', price: 9.99, restaurantId: 'rest5', description: 'Crispy chicken wok-tossed in a sweet and tangy orange sauce' }
        ];
        
        try {
          // First try the API
          const [restaurantsRes, categoriesRes, menuItemsRes] = await Promise.all([
            axios.get('http://localhost:5000/api/restaurants'),
            axios.get('http://localhost:5000/api/categories'),
            axios.get('http://localhost:5000/api/menu-items')
          ]);
          
          setRestaurants(restaurantsRes.data || []);
          setCategories(categoriesRes.data || []);
          setMenuItems(menuItemsRes.data || []);
          
        } catch (error) {
          console.error('Error fetching data from API:', error);
          console.log('Using sample data instead');
          
          // Use sample data if API fails
          setRestaurants(sampleRestaurants);
          setCategories(sampleCategories);
          setMenuItems(sampleMenuItems);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        
        // Ensure we have at least sample data
        setRestaurants([]);
        setCategories([]);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Context value
  const value = {
    restaurants,
    categories,
    menuItems,
    loading,
    error
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};

// Custom hook
export const useRestaurants = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurants must be used within a RestaurantProvider');
  }
  return context;
};

export default RestaurantContext;