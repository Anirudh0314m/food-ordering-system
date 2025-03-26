import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaMotorcycle, FaHome, FaClipboardList, FaWallet, FaUser, 
         FaMapMarkerAlt, FaSignOutAlt } from 'react-icons/fa';
import '../styles/DeliveryNavbar.css';

const DeliveryNavbar = ({ isOnline, toggleOnlineStatus, partnerName, currentLocation, handleLogout }) => {
  const location = useLocation();

  return (
    <nav className="delivery-navbar">
      <div className="navbar-brand">
        <FaMotorcycle size={24} />
        <h1>FastFood Delivery</h1>
      </div>
      
      <div className="status-toggle">
        <label className="switch">
          <input 
            type="checkbox" 
            checked={isOnline} 
            onChange={toggleOnlineStatus}
          />
          <span className="slider round"></span>
        </label>
        <span className={`status-text ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      
      <div className="nav-links">
        <NavLink 
          to="/delivery/dashboard" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <FaHome /> Home
        </NavLink>
        <NavLink 
          to="/delivery/orders" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <FaClipboardList /> Orders
        </NavLink>
        <NavLink 
          to="/delivery/earnings" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <FaWallet /> Earnings
        </NavLink>
        <NavLink 
          to="/delivery/account" 
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          <FaUser /> Account
        </NavLink>
      </div>
      
      {currentLocation && (
        <div className="current-location">
          <FaMapMarkerAlt />
          <span>{currentLocation}</span>
        </div>
      )}
      
      <div className="user-info">
        <div className="partner-avatar">
          <FaUser />
        </div>
        <div className="user-details">
          <span className="partner-name">{partnerName}</span>
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DeliveryNavbar;