import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaMotorcycle, FaClipboardList, FaChartLine, FaUser, FaSignOutAlt } from 'react-icons/fa';
import '../styles/NavbarDelivery.css';

const NavbarDelivery = ({ partnerName, handleLogout }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Define navigation items
  const navItems = [
    {
      path: '/delivery',
      icon: <FaMotorcycle />,
      label: 'Dashboard',
    },
    {
      path: '/delivery/orders',
      icon: <FaClipboardList />,
      label: 'Orders',
    },
    {
      path: '/delivery/earnings',
      icon: <FaChartLine />,
      label: 'Earnings',
    },
    {
      path: '/delivery/account',
      icon: <FaUser />,
      label: 'Account',
    },
  ];

  return (
    <header className="delivery-navbar">
      <div className="navbar-logo">
        <FaMotorcycle className="logo-icon" />
        <h1>Delivery</h1>
      </div>
      
      <nav className="navbar-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${currentPath === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="navbar-user">
        <span className="user-name">{partnerName || 'Partner'}</span>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default NavbarDelivery;