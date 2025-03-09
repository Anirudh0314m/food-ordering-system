import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './RestaurantsByCategory.css';

const RestaurantsByCategory = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("Select Location");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  // Update the fetchMenuItems function to use the correct endpoint
  const fetchMenuItems = async (restaurantId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/menu-items/restaurant/${restaurantId}`);
      console.log('API Response:', response.data);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMenuItems([]);
      alert('Unable to load menu items. Please try again.');
    }
  };

  // Update handleRestaurantClick to show loading state
  const handleRestaurantClick = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setLoading(true);
    await fetchMenuItems(restaurant._id);
    setLoading(false);
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        console.log('Fetching restaurants for category:', category);
        const response = await axios.get('http://localhost:5000/api/restaurants');
        console.log('All restaurants:', response.data);
        
        const filtered = response.data.filter(restaurant => 
          restaurant.category && 
          restaurant.category.toLowerCase() === category.toLowerCase()
        );
        
        console.log('Filtered restaurants:', filtered);
        setRestaurants(filtered);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [category]);

  return (
    <div className="dashboard-container">
      <Navbar address={address} />
      <div className="category-page">
        <div className="category-header">
          <h1>{selectedRestaurant ? selectedRestaurant.name : `${category} Restaurants`}</h1>
          <button className="back-btn" onClick={() => selectedRestaurant ? setSelectedRestaurant(null) : navigate('/dashboard')}>
            <FaArrowLeft /> {selectedRestaurant ? 'Back to Restaurants' : 'Back'}
          </button>
        </div>
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : !selectedRestaurant ? (
          <div className="restaurants-grid">
            {restaurants.map(restaurant => (
              <div key={restaurant._id} className="restaurant-card" onClick={() => handleRestaurantClick(restaurant)}>
                <div className="rest-container">
                  <div className="rest-image">
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Restaurant';
                      }}
                    />
                  </div>
                  <div className="rest-info">
                    <div className="info-content">
                      <div className="left-content">
                        <h3>{restaurant.name}</h3>
                        <p className="address">📍 {restaurant.address}</p>
                      </div>
                      <div className="right-content">
                        <p className="cuisine">🍽️ {restaurant.cuisine}</p>
                        <p className="category">🏷️ {restaurant.category}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="category-menu-grid">
            {menuItems.map(item => (
              <div key={item._id} className="category-menu-card">
                <div className="category-menu-image">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x150?text=Food';
                    }} 
                  />
                </div>
                <div className="category-menu-info">
                  <h4>{item.name}</h4>
                  <p className="category-menu-description">{item.description}</p>
                  <div className="category-menu-footer">
                    <span className="price">₹{item.price}</span>
                    {item.isVeg && <span className="veg-badge">🌱</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantsByCategory;