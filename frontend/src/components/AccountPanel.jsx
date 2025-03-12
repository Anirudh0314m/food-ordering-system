// src/components/AccountPanel.js
import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaHeart, FaSave, FaLock } from 'react-icons/fa';
import './AccountPanel.css';

const AccountPanel = ({ isOpen, onClose }) => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    favoriteRestaurants: []
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isPhoneNumberSet, setIsPhoneNumberSet] = useState(false);
  
  useEffect(() => {
    // Load user data when panel opens
    if (isOpen) {
      // Get user data from localStorage - first try currentUser object
      const currentUserJson = localStorage.getItem('currentUser');
      let userData = {};
      
      if (currentUserJson) {
        // Use the structured user object if available
        const currentUser = JSON.parse(currentUserJson);
        userData = {
          name: currentUser.name || '',
          email: currentUser.email || '',
          phoneNumber: currentUser.phoneNumber || '',
          favoriteRestaurants: currentUser.favoriteRestaurants || []
        };
      } else {
        // Fallback to individual items
        userData = {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
          phoneNumber: localStorage.getItem('userPhone') || '',
          favoriteRestaurants: JSON.parse(localStorage.getItem('userFavorites') || '[]')
        };
      }
      
      setUser(userData);
      
      // Check if phone number is already set
      if (userData.phoneNumber && userData.phoneNumber.trim() !== '') {
        setIsPhoneNumberSet(true);
      } else {
        setIsPhoneNumberSet(false);
      }
    }
  }, [isOpen]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Don't allow changing phone number if it's already set
    if (name === 'phoneNumber' && isPhoneNumberSet) {
      return;
    }
    
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveUserInfo = () => {
    setLoading(true);
    
    try {
      // Validate phone number if it's being set for the first time
      if (!isPhoneNumberSet && user.phoneNumber) {
        const phoneRegex = /^[0-9]{10}$/; // Basic validation for 10-digit number
        
        if (!phoneRegex.test(user.phoneNumber.trim())) {
          setMessage('Please enter a valid 10-digit phone number.');
          setLoading(false);
          return;
        }
        
        // Set the flag to indicate phone number has been set
        setIsPhoneNumberSet(true);
      }
      
      // First update the currentUser object if it exists
      const currentUserJson = localStorage.getItem('currentUser');
      
      if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        const updatedUser = {
          ...currentUser,
          name: user.name,
          phoneNumber: user.phoneNumber,
          favoriteRestaurants: user.favoriteRestaurants
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      // Also update individual items for backward compatibility
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userPhone', user.phoneNumber);
      localStorage.setItem('userFavorites', JSON.stringify(user.favoriteRestaurants));
      
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving user info:', error);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      {isOpen && <div className="account-overlay" onClick={onClose} />}
      
      <div className={`account-panel ${isOpen ? 'open' : ''}`}>
        <div className="account-panel-header">
          <h3>Account Information</h3>
          <button className="close-panel" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="account-panel-content">
          {message && (
            <div className={`account-message ${message.includes('Error') || message.includes('Please enter') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
          
          <div className="account-form">
            <div className="account-form-group">
              <div className="account-input-icon">
                <FaUser />
              </div>
              <input 
                type="text"
                name="name"
                placeholder="Your Name"
                value={user.name || ''}
                disabled
                className="account-input disabled"
              />
              <small>Your account name</small>
            </div>
            
            <div className="account-form-group">
              <div className="account-input-icon">
                <FaEnvelope />
              </div>
              <input 
                type="email"
                name="email"
                placeholder="Email Address"
                value={user.email || ''}
                disabled
                className="account-input disabled"
              />
              <small>Your email address cannot be changed</small>
            </div>
            
            <div className="account-form-group">
              <div className="account-input-icon">
                {isPhoneNumberSet ? <FaLock className="locked-icon" /> : <FaPhone />}
              </div>
              <input 
                type="tel"
                name="phoneNumber"
                placeholder="Enter your 10-digit phone number"
                value={user.phoneNumber || ''}
                onChange={handleInputChange}
                className={`account-input ${isPhoneNumberSet ? 'disabled' : ''}`}
                disabled={isPhoneNumberSet}
                maxLength="10"
              />
              <small>
                {isPhoneNumberSet 
                  ? "Phone number is permanently saved and cannot be changed" 
                  : "Add your phone number for delivery notifications (10 digits)"}
              </small>
            </div>
            
            <div className="account-form-section">
              <h4>
                <FaHeart /> Favorite Restaurants
              </h4>
              {user.favoriteRestaurants && user.favoriteRestaurants.length > 0 ? (
                <div className="favorites-list">
                  {user.favoriteRestaurants.map((restaurant, index) => (
                    <div key={index} className="favorite-item">
                      <span>{typeof restaurant === 'object' ? restaurant.name : restaurant}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-favorites">No favorite restaurants yet.</p>
              )}
            </div>
            
            <div className="account-actions">
              <button 
                className="save-profile-btn" 
                onClick={saveUserInfo}
                disabled={loading}
              >
                {loading ? 'Saving...' : (
                  <>
                    <FaSave /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountPanel;