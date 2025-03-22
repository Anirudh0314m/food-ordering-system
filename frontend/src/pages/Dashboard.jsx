import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaUserCircle, FaSearch, FaShoppingCart, FaBars, FaMapMarkerAlt, FaStar, FaClock, FaUtensils, FaTimes, FaPlus, FaLocationArrow, FaHome, FaBriefcase } from "react-icons/fa";
import ReactMapGL, { Marker } from 'react-map-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import "./Dashboard.css";
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import AddressPanel from '../components/AddressPanel';
import { getAllAddresses, createAddress } from '../services/api';

const defaultCenter = {
  lat: 12.81454481993114,
  lng: 80.03748836839667
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [address, setAddress] = useState("Select Location");
  const [location, setLocation] = useState(defaultCenter);
  const [viewport, setViewport] = useState({
    latitude: 12.81454481993114, 
    longitude: 80.03748836839667,
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
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const locationTimeoutRef = useRef(null);
  const [locationError, setLocationError] = useState('');
  const [saveAddressMode, setSaveAddressMode] = useState(false);
  const [addressLabel, setAddressLabel] = useState('home');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isAddressPanelOpen, setIsAddressPanelOpen] = useState(false);
  const [activeLocationTab, setActiveLocationTab] = useState('search');
  const [addressLoading, setAddressLoading] = useState(false);

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

  useEffect(() => {
    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchSavedAddresses = async () => {
      try {
        setAddressLoading(true); // Make sure this state exists
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await axios.get('http://localhost:5000/api/user/addresses', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data && Array.isArray(response.data)) {
            console.log('Fetched addresses:', response.data.length);
            setSavedAddresses(response.data);
          }
        } else {
          console.log('No auth token found, skipping address fetch');
          setSavedAddresses([]);
        }
      } catch (error) {
        console.error('Error fetching saved addresses:', error);
        setSavedAddresses([]);
      } finally {
        setAddressLoading(false);
      }
    };

    fetchSavedAddresses();
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token);
    };
    
    checkAuth();
  }, []);

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
    if (!searchText || searchText.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    
    setSearchingLocation(true);
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json?access_token=${MAPBOX_TOKEN}&types=address,place,locality,neighborhood&limit=5`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Store the suggestions for display
        setLocationSuggestions(data.features.map(feature => ({
          id: feature.id,
          placeName: feature.place_name,
          coordinates: feature.center,
          text: feature.text
        })));
      } else {
        setLocationSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setLocationSuggestions([]);
    } finally {
      setSearchingLocation(false);
    }
  }, [MAPBOX_TOKEN]);

  const handleSuggestionSelect = (suggestion) => {
    const [longitude, latitude] = suggestion.coordinates;
    
    setViewport({
      ...viewport,
      longitude,
      latitude,
      zoom: 14
    });
    
    setAddress(suggestion.placeName);
    setLocationSuggestions([]); // Clear suggestions after selection
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }
    
    // Clear any existing location timeout
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }
    
    // Set a timeout to prevent hanging if geolocation takes too long
    locationTimeoutRef.current = setTimeout(() => {
      setLocationError("Location request timed out. Please try again or search manually.");
      setIsLoading(false);
    }, 15000); // 15-second timeout
    
    const geoOptions = {
      enableHighAccuracy: true,  // Request the most accurate position available
      timeout: 10000,            // 10-second timeout for getting position
      maximumAge: 0              // Always get a fresh position, don't use cached
    };
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Clear the timeout since we got a position
        if (locationTimeoutRef.current) {
          clearTimeout(locationTimeoutRef.current);
        }
        
        const { latitude, longitude } = position.coords;
        console.log("Raw coordinates:", latitude, longitude);
        
        // Update map view
        setViewport({
          ...viewport,
          latitude,
          longitude,
          zoom: 16 // Higher zoom for better precision
        });
        
        // Get address from coordinates using Mapbox
        try {
          const response = await axios.get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
            {
              params: {
                access_token: MAPBOX_TOKEN,
                types: 'address', // Prioritize street addresses
                limit: 1
              }
            }
          );
          
          if (response.data.features && response.data.features.length > 0) {
            console.log("Found address:", response.data.features[0].place_name);
            const placeName = response.data.features[0].place_name;
            
            // Update address states
            setAddress(placeName);
          } else {
            console.warn("No address found for coordinates");
            setLocationError("Couldn't find an address for your location. The map shows your position.");
          }
        } catch (error) {
          console.error("Error getting address:", error);
          setLocationError("Found your location but couldn't get the address. The map shows your position.");
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        // Clear the timeout since we got an error
        if (locationTimeoutRef.current) {
          clearTimeout(locationTimeoutRef.current);
        }
        
        console.error("Geolocation error:", error);
        let errorMessage;
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services in your browser.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Try searching manually.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = "An unknown error occurred getting your location.";
        }
        
        setLocationError(errorMessage);
        setIsLoading(false);
      },
      geoOptions
    );
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

  // Update your saveAddress function in Dashboard.jsx
const saveAddress = async () => {
  try {
    setIsLoading(true);
    
    // Make sure we have proper coordinates
    if (!viewport || !viewport.latitude || !viewport.longitude) {
      alert('Could not determine location coordinates');
      setIsLoading(false);
      return;
    }
    
    // Ensure we have an address string
    if (!address || address === "Select Location") {
      alert('Please select a valid location first');
      setIsLoading(false);
      return;
    }
    
    console.log('Preparing to save address with:');
    console.log('- Type:', addressLabel);
    console.log('- Address:', address);
    console.log('- Coordinates:', viewport.latitude, viewport.longitude);
    
    // Format address data for API
    const addressData = {
      type: addressLabel,
      formattedAddress: address,
      coordinates: {
        latitude: viewport.latitude,
        longitude: viewport.longitude
      },
      additionalDetails: {
        flatNumber: "",
        buildingName: "",
        landmark: ""
      },
      isDefault: false
    };
    
    // Use the API function instead of direct axios call
    const newAddress = await createAddress(addressData);
    console.log('Address saved successfully:', newAddress);
    
    // Update local state with the new address
    setSavedAddresses(prev => [...prev, newAddress]);
    
    // Show success message
    alert('Address saved successfully!');
    
    // Refresh addresses
    fetchSavedAddresses();
    
    // Close the map modal
    setIsMapOpen(false);
  } catch (error) {
    console.error('Error saving address:', error);
    
    if (error.message === 'Authentication required') {
      const confirm = window.confirm('You need to be logged in to save addresses. Would you like to log in now?');
      if (confirm) {
        navigate('/login', { 
          state: { 
            returnTo: '/dashboard',
            message: 'Please log in to save your address'
          } 
        });
      }
    } else {
      alert('Failed to save address: ' + error);
    }
  } finally {
    setIsLoading(false);
    setSaveAddressMode(false);
  }
};

const fetchSavedAddresses = async () => {
  try {
    setAddressLoading(true);
    
    // Use the API function instead of direct axios call
    const addresses = await getAllAddresses();
    console.log('Fetched addresses:', addresses.length);
    setSavedAddresses(addresses);
  } catch (error) {
    if (error.message === 'Authentication required') {
      console.log('User not logged in, skipping address fetch');
      setSavedAddresses([]);
    } else {
      console.error('Error fetching saved addresses:', error);
      setSavedAddresses([]);
    }
  } finally {
    setAddressLoading(false);
  }
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
            
            <div className="location-tabs">
              <button 
                className={`location-tab ${activeLocationTab === 'search' ? 'active' : ''}`}
                onClick={() => setActiveLocationTab('search')}
              >
                <FaSearch /> Search Location
              </button>
              <button 
                className={`location-tab ${activeLocationTab === 'current' ? 'active' : ''}`}
                onClick={() => setActiveLocationTab('current')}
              >
                <FaLocationArrow /> Current Location
              </button>
              {savedAddresses.length > 0 && (
                <button 
                  className={`location-tab ${activeLocationTab === 'saved' ? 'active' : ''}`}
                  onClick={() => setActiveLocationTab('saved')}
                >
                  <FaMapMarkerAlt /> Saved Addresses
                </button>
              )}
            </div>
            
            {/* Conditionally render content based on active tab */}
            {activeLocationTab === 'search' && (
              <div className="search-box-container">
                <div className="location-search-wrapper">
                  <FaSearch className="location-search-icon" />
                  <input
                    type="text"
                    placeholder="Search your location..."
                    className="location-input"
                    onChange={(e) => {
                      handleLocationSearch(e.target.value);
                    }}
                  />
                  {searchingLocation && <div className="location-spinner"></div>}
                </div>
                
                {locationSuggestions.length > 0 && (
                  <div className="location-suggestions">
                    {locationSuggestions.map(suggestion => (
                      <div 
                        key={suggestion.id} 
                        className="location-suggestion-item"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <FaMapMarkerAlt className="suggestion-icon" />
                        <div className="suggestion-text">
                          <div className="suggestion-primary">{suggestion.text}</div>
                          <div className="suggestion-secondary">{suggestion.placeName}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeLocationTab === 'current' && (
              <button 
                className="get-location-btn" 
                onClick={getCurrentLocation}
                disabled={isLoading}
              >
                <FaLocationArrow className={isLoading ? "rotating" : ""} />
                {isLoading ? 'Getting location...' : 'Use My Current Location'}
              </button>
            )}
            
            {activeLocationTab === 'saved' && (
              <div className="saved-addresses-list">
                {addressLoading ? (
                  <div className="address-loading">Loading saved addresses...</div>
                ) : savedAddresses.length === 0 ? (
                  <div className="no-addresses">No saved addresses found</div>
                ) : (
                  savedAddresses.map(addr => (
                    <div 
                      key={addr._id} 
                      className="saved-address-item"
                      onClick={() => {
                        // Set map to this address location
                        setViewport({
                          ...viewport,
                          latitude: addr.coordinates.latitude,
                          longitude: addr.coordinates.longitude,
                          zoom: 15
                        });
                        setAddress(addr.formattedAddress);
                      }}
                    >
                      <div className="address-icon">
                        {addr.type === 'home' ? <FaHome /> : 
                        addr.type === 'work' ? <FaBriefcase /> : <FaMapMarkerAlt />}
                      </div>
                      <div className="address-details">
                        <div className="address-type">
                          {addr.type.charAt(0).toUpperCase() + addr.type.slice(1)}
                          {addr.isDefault && <span className="default-badge">Default</span>}
                        </div>
                        <div className="address-text">{addr.formattedAddress}</div>
                        {addr.additionalDetails?.flatNumber && (
                          <div className="address-additional">
                            {addr.additionalDetails.flatNumber}
                            {addr.additionalDetails.buildingName && `, ${addr.additionalDetails.buildingName}`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
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
            <div className="location-actions">
              {/* Add this after the map */}
              <div className="delivery-info">
                <h3>Delivery Options</h3>
                
                {address !== "Select Location" && (
                  <div className="delivery-details">
                    <div className="delivery-estimate">
                      <p><strong>Estimated Delivery Time:</strong></p>
                      <p className="estimate-time">25-35 min</p>
                      <p className="estimate-note">
                        Times are estimated and depend on restaurant availability and traffic
                      </p>
                    </div>
                    
                    <div className="delivery-fee">
                      <p><strong>Delivery Fee:</strong></p>
                      <p className="fee-amount">₹40</p>
                      <p className="fee-note">Free delivery on orders above ₹499</p>
                    </div>
                  </div>
                )}
              </div>
              
              {address !== "Select Location" && (
                <div className="save-address-option">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={saveAddressMode} 
                      onChange={() => setSaveAddressMode(!saveAddressMode)} 
                    />
                    Save this address for future orders
                  </label>
                  
                  {saveAddressMode && (
                    <>
                      <div className="address-label-selector">
                        <button 
                          className={`address-label ${addressLabel === 'home' ? 'selected' : ''}`}
                          onClick={() => setAddressLabel('home')}
                        >
                          <FaHome /> Home
                        </button>
                        <button 
                          className={`address-label ${addressLabel === 'work' ? 'selected' : ''}`}
                          onClick={() => setAddressLabel('work')}
                        >
                          <FaBriefcase /> Work
                        </button>
                        <button 
                          className={`address-label ${addressLabel === 'other' ? 'selected' : ''}`}
                          onClick={() => setAddressLabel('other')}
                        >
                          <FaMapMarkerAlt /> Other
                        </button>
                      </div>
                      
                      <p className="manage-addresses-text">
                        <button 
                          className="view-all-addresses-btn" 
                          onClick={(e) => {
                            e.preventDefault();
                            setIsAddressPanelOpen(true);
                          }}
                        >
                          View all saved addresses
                        </button>
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Update the confirm location button */}
            <button 
              className="confirm-location-btn"
              onClick={() => {
                if (saveAddressMode) {
                  console.log('Saving address...');
                  saveAddress();
                } else {
                  console.log('Just confirming location without saving...');
                  setIsMapOpen(false);
                }
              }}
              disabled={address === "Select Location"}
            >
              {saveAddressMode ? 'Save & Confirm Location' : 'Confirm Location'}
            </button>
          </div>
        </div>
      )}

      

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
      <AddressPanel 
        isOpen={isAddressPanelOpen} 
        onClose={() => setIsAddressPanelOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;