import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaUserCircle, FaShoppingCart, FaBars, FaMapMarkerAlt, FaUser, FaCreditCard, FaSignOutAlt, FaShoppingBag, FaHome } from "react-icons/fa";
import AccountPanel from './AccountPanel'; 
import AddressPanel from './AddressPanel';
import './Navbar.css';
import { useCart } from '../context/CartContext';

const Navbar = ({ address, setIsMapOpen, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location/route
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAccountPanelOpen, setIsAccountPanelOpen] = useState(false);
  const [isAddressPanelOpen, setIsAddressPanelOpen] = useState(false);
  const [userName, setUserName] = useState('');
  
  // Add this hook to get cart count
  const { getCartItemCount } = useCart();
  const itemCount = getCartItemCount();
  
  // Create ref for dropdown menu
  const dropdownRef = useRef(null);
  const profileIconRef = useRef(null);

  // Define the functions for handling panel opening
  const handleAccountInfoClick = () => {
    setIsProfileOpen(false);
    setIsAccountPanelOpen(true);
  };

  const handleAddressesClick = () => {
    setIsProfileOpen(false);
    setIsAddressPanelOpen(true);
  };

  // Handle restaurant navigation from any page
  const handleRestaurantsClick = (e) => {
    e.preventDefault();
    
    if (location.pathname === '/dashboard') {
      // On dashboard page - just scroll to restaurants section
      document.getElementById('restaurants-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // On other pages - navigate to dashboard and set flag to scroll
      navigate('/dashboard', { state: { scrollToRestaurants: true } });
    }
  };
  
  // Get user name when component mounts
  useEffect(() => {
    // Get user name from localStorage
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      setUserName(currentUser.name);
    } else {
      const name = localStorage.getItem('userName');
      if (name) {
        setUserName(name);
      }
    }
  }, []);
  
  // Toggle profile dropdown
  const toggleProfileDropdown = (e) => {
    if (e) e.stopPropagation(); // Stop propagation if event exists
    setIsProfileOpen(!isProfileOpen);
  };

  // Handle click outside to close dropdown - improved version
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only run this logic if dropdown is open
      if (isProfileOpen) {
        // Check if click is outside both the dropdown and the profile icon
        if (
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          profileIconRef.current && 
          !profileIconRef.current.contains(event.target)
        ) {
          setIsProfileOpen(false);
        }
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          
          <span className="logo" onClick={() => navigate('/dashboard')}>QuickBite</span>
          <div className="address-container">
            <FaMapMarkerAlt className="location-icon" />
            <span className="address-text">{address}</span>
            <button className="change-address-btn" onClick={() => setIsMapOpen(true)}>
              Change
            </button>
          </div>
          <div className="nav-links">
            {/* Home link */}
            <Link to="/dashboard" className="nav-link">
              <FaHome className="nav-icon" /> Home
            </Link>
            
            {/* Restaurants link */}
            <a href="#" onClick={handleRestaurantsClick} className="nav-link">
              Restaurants
            </a>
          </div>
        </div>

        <div className="navbar-right">
          <div className="cart-icon-container">
            <FaShoppingCart className="cart-icon" onClick={() => navigate('/cart')} />
            {itemCount > 0 && (
              <span className="cart-badge">{itemCount}</span>
            )}
          </div>
          
          <button className="confirm-order" onClick={() => navigate('/cart')}>Confirm Order</button>
          
          {userName && (
            <div className="welcome-message">
              Welcome, {userName}
            </div>
          )}
          
          <div className="profile-container">
            <div 
              ref={profileIconRef}
              className="profile-icon-wrapper"
              onClick={toggleProfileDropdown}
            >
              <FaUserCircle className="profile-icon" />
            </div>
            
            <div 
              ref={dropdownRef}
              className={`profile-dropdown ${isProfileOpen ? 'show' : ''}`}
            >
              <a href="#" onClick={handleAccountInfoClick}>
                <FaUser className="dropdown-icon" /> Account Info
              </a>
              <a href="#" onClick={() => { setIsProfileOpen(false); }}>
                <FaCreditCard className="dropdown-icon" /> Payment Methods
              </a>
              <a href="#" onClick={handleAddressesClick}>
                <FaMapMarkerAlt className="dropdown-icon" /> Addresses
              </a>
              <Link to="/orders" className="dropdown-link-nav" onClick={() => setIsProfileOpen(false)}>
                <FaShoppingBag className="dropdown-icon" /> View All Orders
              </Link>
              <a href="#" className="logout" onClick={handleLogout}>
                <FaSignOutAlt className="dropdown-icon" /> Logout
              </a>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Account Panel */}
      <AccountPanel 
        isOpen={isAccountPanelOpen} 
        onClose={() => setIsAccountPanelOpen(false)} 
      />
      
      {/* Address Panel */}
      <AddressPanel 
        isOpen={isAddressPanelOpen}
        onClose={() => setIsAddressPanelOpen(false)}
      />
    </>
  );
};

export default Navbar;