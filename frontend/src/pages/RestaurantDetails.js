import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaShoppingCart } from 'react-icons/fa';
import axios from 'axios';


const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [categories, setCategories] = useState(['all']);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get restaurant details
        const restaurantRes = await axios.get(`http://localhost:5000/api/restaurants/${id}`);
        setRestaurant(restaurantRes.data);
        
        // Get menu items
        try {
          const menuRes = await axios.get(`http://localhost:5000/api/menu-items/restaurant/${id}`);
          if (Array.isArray(menuRes.data)) {
            setMenuItems(menuRes.data);
            
            // Extract categories
            const uniqueCategories = [...new Set(menuRes.data
              .map(item => item.category)
              .filter(Boolean))];
            
            setCategories(['all', ...uniqueCategories]);
          }
        } catch (error) {
          console.error('Error fetching menu items:', error);
          // Add fallback data if needed
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const addToCart = (item, restaurantInfo) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    
    if (existingItem) {
      const updatedCart = cart.map(cartItem => 
        cartItem._id === item._id 
          ? {...cartItem, quantity: cartItem.quantity + 1}
          : cartItem
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, {...item, quantity: 1, restaurant: restaurantInfo}]);
    }
    
    setCartTotal(prevTotal => prevTotal + parseFloat(item.price));
  };

  const handleAddToCart = (item) => {
    const restaurantInfo = {
      id: restaurant._id,
      name: restaurant.name,
      image: restaurant.image
    };
    
    addToCart(item, restaurantInfo);
    
    // Update your existing notification code
    setSnackbarMessage(`${item.name} added to cart`);
    setSnackbarOpen(true);
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="rd-loading">
        <div className="rd-loading-spinner"></div>
        <p>Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="rd-container">
      <div className="rd-header">
        <button className="rd-back-button" onClick={goBack}>
          <FaArrowLeft />
        </button>
        <h1 className="rd-title">
          {restaurant?.name || 'Restaurant Menu'}
        </h1>
      </div>
      
      {/* Rest of the component will go here */}
    </div>
  );
};

export default RestaurantDetails;