import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaList, FaMotorcycle, FaMoneyBillWave, FaUser, FaSignOutAlt, FaBell } from 'react-icons/fa';
import '../styles/DeliveryNavbar.css';

const DeliveryNavbar = () => {
  const navigate = useNavigate();
  const [partnerName, setPartnerName] = useState('Delivery Partner');
  
  useEffect(() => {
    // Load partner name from localStorage
    const name = localStorage.getItem('partnerName');
    if (name) {
      setPartnerName(name);
    }
  }, []);
  
  // Handle logout
  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('deliveryAuthToken');
    localStorage.removeItem('partnerName');
    
    // Navigate to login
    navigate('/delivery/login');
  };

  return (
    <header className="delivery-navbar">
      <div className="navbar-container">
        <div className="logo">
          <FaMotorcycle />
          <h1>Delivery Dashboard</h1>
        </div>
        
        <nav className="nav-links">
          <NavLink to="/delivery/dashboard" className={({ isActive }) => 
            isActive ? "nav-item active" : "nav-item"}>
            <FaHome />
            <span>Home</span>
          </NavLink>
          
          <NavLink to="/delivery/orders" className={({ isActive }) => 
            isActive ? "nav-item active" : "nav-item"}>
            <FaList />
            <span>Orders</span>
          </NavLink>
          
          <NavLink to="/delivery/earnings" className={({ isActive }) => 
            isActive ? "nav-item active" : "nav-item"}>
            <FaMoneyBillWave />
            <span>Earnings</span>
          </NavLink>
          
          <NavLink to="/delivery/account" className={({ isActive }) => 
            isActive ? "nav-item active" : "nav-item"}>
            <FaUser />
            <span>Account</span>
          </NavLink>
        </nav>
        
        <div className="user-actions">
          <button className="notification-btn">
            <FaBell />
            <span className="notification-badge">2</span>
          </button>
          
          <div className="user-name">
            {partnerName}
          </div>
          
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DeliveryNavbar;