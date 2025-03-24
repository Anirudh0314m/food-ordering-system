import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMotorcycle, FaUserAlt, FaSignOutAlt, FaMapMarkerAlt, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import '../styles/DeliveryDashboard.css';

const DeliveryDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [activeOrders, setActiveOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('deliveryPartnerToken');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'delivery_partner') {
      navigate('/delivery/login');
      return;
    }
    
    // Get partner name from localStorage
    const name = localStorage.getItem('partnerName');
    setPartnerName(name || 'Delivery Partner');
    
    // TODO: Fetch active orders from API
    // For now, using mock data
    setActiveOrders([]);
    setIsLoading(false);
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('deliveryPartnerToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('partnerId');
    localStorage.removeItem('partnerName');
    localStorage.removeItem('isAuthenticated');
    
    navigate('/delivery/login');
  };
  
  const toggleAvailability = () => {
    setIsOnline(!isOnline);
    
    // TODO: Update availability status with API
    console.log(`Partner is now ${!isOnline ? 'ONLINE' : 'OFFLINE'}`);
  };
  
  return (
    <div className="delivery-dashboard-container">
      <header className="delivery-dashboard-header">
        <div className="delivery-logo">
          <FaMotorcycle className="delivery-logo-icon" />
          <h1>Delivery Dashboard</h1>
        </div>
        
        <div className="delivery-partner-info">
          <div className="partner-avatar">
            <FaUserAlt />
          </div>
          <span className="partner-name">{partnerName}</span>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
          </button>
        </div>
      </header>
      
      <div className="availability-toggle-section">
        <div className="availability-card">
          <div className="availability-header">
            <h2>Your Availability</h2>
            <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
          
          <p className="availability-message">
            {isOnline 
              ? 'You are currently online and available to receive delivery requests.' 
              : 'You are currently offline. Go online to start receiving delivery requests.'}
          </p>
          
          <button 
            className={`toggle-availability-btn ${isOnline ? 'online' : 'offline'}`}
            onClick={toggleAvailability}
          >
            {isOnline ? (
              <>
                <FaToggleOn className="toggle-icon" /> Go Offline
              </>
            ) : (
              <>
                <FaToggleOff className="toggle-icon" /> Go Online
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="dashboard-main-content">
        <div className="orders-section">
          <h2>Active Orders</h2>
          
          {isLoading ? (
            <div className="loading-orders">
              <div className="loading-spinner"></div>
              <p>Loading orders...</p>
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="no-orders">
              <FaMapMarkerAlt className="no-orders-icon" />
              <h3>No Active Orders</h3>
              <p>
                {isOnline 
                  ? 'You don\'t have any active orders at the moment. New orders will appear here.' 
                  : 'You need to go online to receive delivery requests.'}
              </p>
            </div>
          ) : (
            <div className="orders-list">
              {/* Order items will be mapped here */}
            </div>
          )}
        </div>
        
        <div className="earnings-summary">
          <h2>Today's Summary</h2>
          <div className="earnings-cards">
            <div className="earnings-card">
              <div className="earnings-value">₹0</div>
              <div className="earnings-label">Earnings</div>
            </div>
            
            <div className="earnings-card">
              <div className="earnings-value">0</div>
              <div className="earnings-label">Deliveries</div>
            </div>
            
            <div className="earnings-card">
              <div className="earnings-value">0 km</div>
              <div className="earnings-label">Distance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;