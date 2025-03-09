import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaUserCircle, FaSearch, FaShoppingCart, FaBars, FaMapMarkerAlt, FaStar, FaClock, FaUtensils, FaTimes, FaPlus } from "react-icons/fa";
import ReactMapGL, { Marker } from 'react-map-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import "./Dashboard.css";
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946
};

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYW5pcnVkaDAzMTRtIiwiYSI6ImNtNzR2NDFhMzBja20ycXNjZDdwc3VzcmwifQ.zJGmj5f_nuLyNY-WCfx6dA'; // Replace with your token

const geocoder = new MapboxGeocoder({
  accessToken: MAPBOX_TOKEN,
  mapboxgl: ReactMapGL,
  marker: false
});

const categories = [
  {
    id: 1,
    name: 'Pizza',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80'
  },
  {
    id: 2,
    name: 'Burger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80'
  },
  {
    id: 3,
    name: 'Biryani',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80'
  },
  {
    id: 4,
    name: 'Chinese',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80'
  },
  {
    id: 5,
    name: 'Pasta',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80'
  },
  {
    id: 6,
    name: 'Ice Cream',
    image: 'https://images.unsplash.com/photo-1629385701021-fcd568a743e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80'
  },
];

const Dashboard = ({ handleLogout }) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [address, setAddress] = useState("Select Location");
  const [location, setLocation] = useState(defaultCenter);
  const [viewport, setViewport] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    zoom: 14
  });
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeMenu, setActiveMenu] = useState({
    isOpen: false,
    restaurantId: null,
    restaurantName: '',
    menuItems: [],
    loading: false
  });
  const restaurantsSectionRef = useRef(null);
  const { cart, addToCart, decreaseQuantity, cartTotal } = useCart();
  const firstMatchRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    // Check if the navigation state has the scrollToRestaurants flag
    if (location?.state?.scrollToRestaurants) {
      // Find the restaurants section and scroll to it
      const restaurantsSection = document.getElementById('restaurants-section');
      if (restaurantsSection) {
        setTimeout(() => {
          restaurantsSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/restaurants');
      // Ensure we have a valid array of restaurants
      const restaurantData = Array.isArray(response.data) ? response.data : [];
      setRestaurants(restaurantData);
      setFilteredRestaurants(restaurantData);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setRestaurants([]);
      setFilteredRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place) => {
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setLocation({ lat, lng });
    setAddress(place.formatted_address);
  };

  const handleLocationSearch = useCallback(async (searchText) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        const placeName = data.features[0].place_name;
        
        setViewport({
          ...viewport,
          longitude,
          latitude,
          zoom: 14
        });
        setAddress(placeName);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  }, [viewport]);

  const getCurrentLocation = () => {
    setIsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Update viewport with current location
          setViewport({
            ...viewport,
            latitude,
            longitude,
            zoom: 14
          });

          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
            );
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
              setAddress(data.features[0].place_name);
            }
          } catch (error) {
            console.error('Error getting address:', error);
          }
          
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLoading(false);
    }
  };

  // Fixed handleCategoryClick function
  const handleCategoryClick = (category) => {
    if (selectedCategory && selectedCategory.id === category.id) {
      // If clicking the already selected category, reset filters
      setSelectedCategory(null);
      setFilteredRestaurants(restaurants);
    } else {
      // Otherwise filter by the selected category
      setSelectedCategory(category);
      // Make sure to properly handle case sensitivity and check for missing values
      const filtered = restaurants.filter(restaurant => 
        restaurant.category && 
        restaurant.category.toLowerCase() === category.name.toLowerCase()
      );
      setFilteredRestaurants(filtered.length > 0 ? filtered : []);
    }
    setTimeout(() => {
      if (restaurantsSectionRef.current) {
        restaurantsSectionRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100); // Small timeout to ensure state updates first
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query) {
      // If search is cleared, respect category filter
      if (selectedCategory) {
        const filtered = restaurants.filter(restaurant => 
          restaurant.category && 
          restaurant.category.toLowerCase() === selectedCategory.name.toLowerCase()
        );
        setFilteredRestaurants(filtered);
      } else {
        setFilteredRestaurants(restaurants);
      }
      return;
    }
    
    // Apply search filter (and respect category filter if set)
    let filtered = restaurants;
    
    if (selectedCategory) {
      filtered = filtered.filter(restaurant => 
        restaurant.category && 
        restaurant.category.toLowerCase() === selectedCategory.name.toLowerCase()
      );
    }
    
    filtered = filtered.filter(restaurant => 
      (restaurant.name && restaurant.name.toLowerCase().includes(query)) ||
      (restaurant.cuisine && restaurant.cuisine.toLowerCase().includes(query))
    );
    
    setFilteredRestaurants(filtered);
  };

  const handleSearchClick = () => {
    if (searchQuery.trim() === '') {
      // If search is empty, just scroll to restaurants section
      restaurantsSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      return;
    }
    
    // If we have matching restaurants, scroll to the first one
    if (filteredRestaurants.length > 0) {
      // First scroll to restaurants section
      restaurantsSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Then after a small delay, scroll to the first matching restaurant
      setTimeout(() => {
        // Use the firstMatchRef that we'll set on the first restaurant
        const firstRestaurantElement = document.getElementById(`restaurant-${filteredRestaurants[0]._id}`);
        if (firstRestaurantElement) {
          firstRestaurantElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Add a highlight effect to the restaurant card
          firstRestaurantElement.classList.add('highlight-restaurant');
          
          // Remove the highlight after 2 seconds
          setTimeout(() => {
            firstRestaurantElement.classList.remove('highlight-restaurant');
          }, 2000);
        }
      }, 500);
    } else {
      // Just scroll to restaurants section if no results
      restaurantsSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleRestaurantClick = async (restaurant) => {
    // If clicking the same restaurant that's already open, close the panel
    if (activeMenu.isOpen && activeMenu.restaurantId === restaurant._id) {
      setActiveMenu({
        isOpen: false,
        restaurantId: null,
        restaurantName: '',
        menuItems: [],
        loading: false
      });
      return;
    }
    
    // Otherwise, open the panel with the selected restaurant
    setActiveMenu({
      isOpen: true,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      menuItems: [],
      loading: true
    });
    
    // Fetch menu items
    try {
      const menuRes = await axios.get(`http://localhost:5000/api/menu-items/restaurant/${restaurant._id}`);
      if (Array.isArray(menuRes.data)) {
        setActiveMenu(prev => ({
          ...prev,
          menuItems: menuRes.data,
          loading: false
        }));
      } else {
        // Try alternative endpoint if the first one fails
        try {
          const altMenuRes = await axios.get(`http://localhost:5000/api/menu/restaurant/${restaurant._id}`);
          if (Array.isArray(altMenuRes.data)) {
            setActiveMenu(prev => ({
              ...prev,
              menuItems: altMenuRes.data,
              loading: false
            }));
          } else {
            throw new Error('No menu data found');
          }
        } catch (altErr) {
          console.error('Failed to load menu items:', altErr);
          // Set empty menu items or some sample data
          setActiveMenu(prev => ({
            ...prev,
            menuItems: [],
            loading: false
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
      setActiveMenu(prev => ({
        ...prev,
        loading: false
      }));
    }
  };
  
  // Close the menu panel
  const closeMenu = () => {
    setActiveMenu({
      isOpen: false,
      restaurantId: null,
      restaurantName: '',
      menuItems: [],
      loading: false
    });
  };
  
  return (
    <div className="dashboard-container">
      <Navbar 
        handleLogout={handleLogout} 
        address={address} 
        setIsMapOpen={setIsMapOpen} 
      />

      {/* Hero Section with updated search button */}
      <div className="hero-section">
        <h1>Discover Restaurants that deliver near you</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for food, restaurants..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
            onKeyDown={(e) => {
              // Also trigger search on Enter key
              if (e.key === 'Enter') {
                handleSearchClick();
              }
            }}
          />
          <button className="search-btn" onClick={handleSearchClick}>
            <FaSearch />
          </button>
        </div>
      </div>
      
      {/* Category Section */}
      <div className="dashboard-main">
        <h2 className="category-title">What are you interested in today?</h2>
        <div className="category-section">
          {categories.map(category => (
            <div 
              key={category.id} 
              className={`category-card ${selectedCategory?.id === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category)}
            >
              <img src={category.image} alt={category.name} />
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Restaurants Section - This replaces the "Popular Restaurants" section */}
      <div id="restaurants-section" className="restaurants-section" ref={restaurantsSectionRef}>
        <div className="section-header">
          <h2>{selectedCategory ? `${selectedCategory.name} Restaurants` : 'All Restaurants'}</h2>
          {selectedCategory && (
            <button 
              className="clear-filter" 
              onClick={() => {
                setSelectedCategory(null);
                setFilteredRestaurants(restaurants);
              }}
            >
              Clear Filter
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="loading">Loading restaurants...</div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="no-results">
            <h3>No restaurants found</h3>
            <p>{selectedCategory ? `No restaurants found in the ${selectedCategory.name} category.` : 'Try a different search term.'}</p>
          </div>
        ) : (
          <div className="restaurants-grid">
            {filteredRestaurants.map((restaurant, index) => (
              <div 
                key={restaurant._id || Math.random().toString()} 
                className="restaurant-card"
                id={`restaurant-${restaurant._id}`}
                onClick={() => handleRestaurantClick(restaurant)}
              >
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
                        <p className="address">📍 {restaurant.address || 'No address available'}</p>
                      </div>
                      <div className="right-content">
                        <p className="cuisine">🍽️ {restaurant.cuisine || 'Various'}</p>
                        <p className="category">🏷️ {restaurant.category || 'General'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Map Section */}
      {isMapOpen && (
        <div className="map-modal">
          <div className="map-modal-content">
            <button className="close-modal" onClick={() => setIsMapOpen(false)}>×</button>
            <h2>Select Your Location</h2>
            
            <button 
              className="get-location-btn" 
              onClick={getCurrentLocation}
              disabled={isLoading}
            >
              {isLoading ? 'Getting location...' : 'Use My Current Location'}
            </button>

            <div className="search-box-container">
              <input
                type="text"
                placeholder="Search your location..."
                className="location-input"
                onChange={(e) => {
                  if (e.target.value.length > 2) { // Only search if input is longer than 2 characters
                    handleLocationSearch(e.target.value);
                  }
                }}
              />
              <div className="search-suggestions">
                {/* Suggestions will appear here */}
              </div>
            </div>
            <ReactMapGL
              mapboxAccessToken={MAPBOX_TOKEN}
              initialViewState={viewport}
              style={{ width: '100%', height: '400px', borderRadius: '10px' }}
              mapStyle="mapbox://styles/mapbox/streets-v11"
              onMove={evt => setViewport(evt.viewState)}
            >
              <Marker 
                longitude={viewport.longitude} 
                latitude={viewport.latitude}
                anchor="bottom"
                draggable
                onDragEnd={async (evt) => {
                  const newLng = evt.lngLat.lng;
                  const newLat = evt.lngLat.lat;
                  
                  // Reverse geocoding to get address from coordinates
                  try {
                    const response = await fetch(
                      `https://api.mapbox.com/geocoding/v5/mapbox.places/${newLng},${newLat}.json?access_token=${MAPBOX_TOKEN}`
                    );
                    const data = await response.json();
                    
                    if (data.features && data.features.length > 0) {
                      setAddress(data.features[0].place_name);
                    }
                    
                    setViewport({
                      ...viewport,
                      longitude: newLng,
                      latitude: newLat
                    });
                  } catch (error) {
                    console.error('Error getting address:', error);
                  }
                }}
              >
                <FaMapMarkerAlt style={{ fontSize: '2rem', color: '#a82d2d' }} />
              </Marker>
            </ReactMapGL>
            <button 
              className="confirm-location-btn"
              onClick={() => {
                setIsMapOpen(false);
              }}
            >
              Confirm Location
            </button>
          </div>
        </div>
      )}

      {/* Promo Section */}
      <div className="promo-section">
        <p>What about privacy policy?</p>
        <p>This is simply dummy text of the printing and typesetting industry. Learn more about how we handle data privacy.</p>
        <a href="#">See more</a>
      </div>

      {/* Restaurant Menu Side Panel */}
      <div className={`restaurant-menu side-panel ${activeMenu.isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h3>{activeMenu.restaurantName}</h3>
          <button className="close-menu" onClick={closeMenu}>
            <FaTimes />
          </button>
        </div>
        
        <div className="menu-items">
          {activeMenu.loading ? (
            <div className="menu-loading">
              <div className="loading-spinner"></div>
              <p>Loading menu items...</p>
            </div>
          ) : activeMenu.menuItems.length === 0 ? (
            <div className="no-results">
              <h3>No menu items available</h3>
              <p>This restaurant hasn't added any items yet.</p>
            </div>
          ) : (
            activeMenu.menuItems.map(item => {
              const itemInCart = cart.find(cartItem => cartItem._id === item._id);
              const quantity = itemInCart ? itemInCart.quantity : 0;
              
              return (
                <div key={item._id} className="menu-item">
                  <div className="menu-item-price-container">
                    <div className="menu-item-image">
                      <img 
                        src={item.image || 'https://via.placeholder.com/120x100?text=Food'} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/120x100?text=Food';
                        }}
                      />
                    </div>
                    <span className="price">{item.price}</span>
                  </div>
                  
                  <div className="menu-item-details">
                    <h4>{item.name}</h4>
                    <span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`}>
                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                    <p className="menu-item-description">
                      {item.description || 'A delicious dish prepared with fresh ingredients.'}
                    </p>
                    <div className="menu-item-footer">
                      {quantity > 0 ? (
                        <div className="quantity-control">
                          <button 
                            className="qty-btn" 
                            onClick={(e) => {
                              e.stopPropagation();
                              decreaseQuantity(item);
                            }}
                          >
                            -
                          </button>
                          <span className="qty-count">{quantity}</span>
                          <button 
                            className="qty-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="add-to-cart" 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                        >
                          <FaPlus size={10} /> Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="cart-summary">
            <span className="cart-items-count">
              {cart.reduce((total, item) => total + item.quantity, 0)} items
            </span>
            <span className="cart-total-price">₹{cartTotal}</span>
            <button 
              className="view-cart-btn" 
              onClick={() => navigate('/cart')}
            >
              View Cart <FaShoppingCart />
            </button>
          </div>
        )}
      </div>
      {activeMenu.isOpen && (
        <div className="overlay" onClick={closeMenu}></div>
      )}
    </div>
  );
};

export default Dashboard;