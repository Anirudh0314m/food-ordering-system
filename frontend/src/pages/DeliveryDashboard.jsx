import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaMotorcycle, FaMapMarkerAlt, FaPhone, FaDirections, 
         FaClipboardList, FaStar, FaWallet } from 'react-icons/fa';
import DeliveryNavbar from '../components/DeliveryNavbar';
import '../styles/DeliveryDashboard.css';

const DeliveryDashboard = ({ handleLogout }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Stats
  const [todayOrders, setTodayOrders] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [rating, setRating] = useState(5.0);
  
  // Orders
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newOrders, setNewOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('deliveryPartnerToken') || localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'delivery_partner') {
      navigate('/delivery/login');
      return;
    }
    
    // Get partner name from localStorage
    const name = localStorage.getItem('partnerName');
    setPartnerName(name || 'Delivery Partner');
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For now just save coordinates, in a real app we would reverse geocode
          const coords = `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`;
          setCurrentLocation(coords);
          
          // In a real app, we would send this location to the backend
          // updatePartnerLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setCurrentLocation('Location unavailable');
        }
      );
    }
    
    // Load mock data for demo - in real app these would come from API
    loadMockData();
    
    // In a real app, we would fetch data from API
    // fetchDashboardData();
    
    setIsLoading(false);
  }, [navigate]);
  
  const loadMockData = () => {
    // Mock current order
    setCurrentOrder({
      id: 'ORD12345',
      restaurant: {
        name: 'Burger Palace',
        address: '123 Main St, City',
        image: '/img/burger-restaurant.jpg'
      },
      customer: {
        name: 'John Doe',
        address: '456 Oak Ave, City',
        phone: '+1234567890'
      },
      items: [
        { name: 'Cheeseburger', quantity: 2 },
        { name: 'Fries', quantity: 1 },
        { name: 'Soda', quantity: 2 }
      ],
      status: 'picked_up',
      amount: 450,
      deliveryFee: 50
    });
    
    // Mock new orders
    setNewOrders([
      {
        id: 'ORD67890',
        restaurant: {
          name: 'Pizza Corner',
          address: '789 Pine St, City'
        },
        distance: 2.3,
        deliveryFee: 60
      },
      {
        id: 'ORD54321',
        restaurant: {
          name: 'Taco Spot',
          address: '321 Elm St, City'
        },
        distance: 3.1,
        deliveryFee: 75
      }
    ]);
    
    // Mock recent orders
    setRecentOrders([
      {
        id: 'ORD11223',
        restaurant: 'Chinese Wok',
        time: '2 hours ago',
        amount: 350,
        earnings: 45
      },
      {
        id: 'ORD33445',
        restaurant: 'Subway',
        time: '4 hours ago',
        amount: 250,
        earnings: 35
      }
    ]);
    
    // Mock stats
    setTodayOrders(3);
    setTodayEarnings(130);
    setRating(4.8);
  };
  
  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    
    // In a real app, update status in the backend
    // updatePartnerStatus(!isOnline);
    
    console.log(`Partner is now ${!isOnline ? 'ONLINE' : 'OFFLINE'}`);
  };
  
  const updateOrderStatus = (orderId, status) => {
    // In a real app, update order status in the backend
    console.log(`Updating order ${orderId} to ${status}`);
    
    // For demo purposes, update current order status
    if (currentOrder && currentOrder.id === orderId) {
      setCurrentOrder({
        ...currentOrder,
        status
      });
      
      // If order is delivered, move it to recent orders
      if (status === 'delivered') {
        setRecentOrders([
          {
            id: currentOrder.id,
            restaurant: currentOrder.restaurant.name,
            time: 'Just now',
            amount: currentOrder.amount,
            earnings: currentOrder.deliveryFee
          },
          ...recentOrders
        ]);
        
        // Update stats
        setTodayOrders(todayOrders + 1);
        setTodayEarnings(todayEarnings + currentOrder.deliveryFee);
        
        // Clear current order
        setCurrentOrder(null);
      }
    }
  };
  
  const acceptOrder = (orderId) => {
    // Find the order in new orders
    const orderToAccept = newOrders.find(order => order.id === orderId);
    
    if (orderToAccept) {
      // Remove from new orders
      setNewOrders(newOrders.filter(order => order.id !== orderId));
      
      // In a real app, accept order in the backend
      console.log(`Accepting order ${orderId}`);
      
      // For demo, set as current order if we don't have one
      if (!currentOrder) {
        // Create a more complete order object based on the newOrder item
        setCurrentOrder({
          id: orderToAccept.id,
          restaurant: {
            name: orderToAccept.restaurant.name,
            address: orderToAccept.restaurant.address,
            image: '/img/restaurant-placeholder.jpg'
          },
          customer: {
            name: 'Customer Name',
            address: `${orderToAccept.distance} km away from restaurant`,
            phone: '+1234567890'
          },
          status: 'accepted',
          amount: orderToAccept.deliveryFee * 4, // Just for demo
          deliveryFee: orderToAccept.deliveryFee
        });
      }
    }
  };
  
  const rejectOrder = (orderId) => {
    // Remove from new orders
    setNewOrders(newOrders.filter(order => order.id !== orderId));
    
    // In a real app, reject order in the backend
    console.log(`Rejecting order ${orderId}`);
  };
  
  const openMap = () => {
    // In a real app, open maps app with directions
    console.log('Opening maps for directions');
    
    // For demo, just alert
    alert('This would open maps with directions to the destination');
  };
  
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="delivery-dashboard-container">
      <DeliveryNavbar 
        isOnline={isOnline}
        toggleOnlineStatus={toggleOnlineStatus}
        partnerName={partnerName}
        currentLocation={currentLocation}
        handleLogout={handleLogout}
      />
      
      <div className="delivery-dashboard">
        <div className="status-card">
          <h2>Current Status</h2>
          <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? 'Available for Orders' : 'You are Offline'}
          </div>
          <div className="stats-summary">
            <div className="stat">
              <span className="stat-value">{todayOrders}</span>
              <span className="stat-label">Today's Orders</span>
            </div>
            <div className="stat">
              <span className="stat-value">₹{todayEarnings}</span>
              <span className="stat-label">Today's Earnings</span>
            </div>
            <div className="stat">
              <span className="stat-value">{rating}</span>
              <span className="stat-label">Rating</span>
            </div>
          </div>
        </div>
        
        {currentOrder && (
          <div className="current-order-card">
            <h2>Current Order</h2>
            <div className="order-details">
              <div className="restaurant-info">
                <img src={currentOrder.restaurant.image || '/img/restaurant-placeholder.jpg'} alt={currentOrder.restaurant.name} />
                <div>
                  <h3>{currentOrder.restaurant.name}</h3>
                  <p>{currentOrder.restaurant.address}</p>
                </div>
              </div>
              
              <div className="order-items">
                <h4>Order Items:</h4>
                <ul>
                  {currentOrder.items && currentOrder.items.map((item, index) => (
                    <li key={index}>
                      {item.quantity}x {item.name}
                    </li>
                  ))}
                </ul>
                <p className="order-amount">
                  <strong>Order Total:</strong> ₹{currentOrder.amount}
                </p>
                <p className="delivery-fee">
                  <strong>Your Earnings:</strong> ₹{currentOrder.deliveryFee}
                </p>
              </div>
              
              <div className="customer-info">
                <h4>Deliver To:</h4>
                <h3>{currentOrder.customer.name}</h3>
                <p>{currentOrder.customer.address}</p>
                <a href={`tel:${currentOrder.customer.phone}`} className="contact-btn">
                  <FaPhone /> Call Customer
                </a>
              </div>
              
              <div className="order-actions">
                {currentOrder.status === 'accepted' && (
                  <button className="action-btn pickup" onClick={() => updateOrderStatus(currentOrder.id, 'picked_up')}>
                    Mark as Picked Up
                  </button>
                )}
                
                {currentOrder.status === 'picked_up' && (
                  <button className="action-btn deliver" onClick={() => updateOrderStatus(currentOrder.id, 'delivered')}>
                    Mark as Delivered
                  </button>
                )}
                
                <button className="action-btn map" onClick={() => openMap()}>
                  <FaDirections /> Navigate
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="dashboard-section">
          <h2>New Order Requests</h2>
          {newOrders.length === 0 ? (
            <p className="no-orders">No new orders available at the moment</p>
          ) : (
            <div className="orders-list">
              {newOrders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-header">
                    <h3>{order.restaurant.name}</h3>
                    <span className="distance">{order.distance} km away</span>
                  </div>
                  <p className="order-address">{order.restaurant.address}</p>
                  <p className="order-amount">₹{order.deliveryFee} delivery fee</p>
                  <div className="order-actions">
                    <button className="accept-btn" onClick={() => acceptOrder(order.id)}>
                      Accept
                    </button>
                    <button className="reject-btn" onClick={() => rejectOrder(order.id)}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="dashboard-section">
          <h2>Recent Deliveries</h2>
          {recentOrders.length === 0 ? (
            <p className="no-orders">No recent deliveries</p>
          ) : (
            <div className="recent-deliveries">
              {recentOrders.map((order, index) => (
                <div key={index} className="recent-order">
                  <div className="restaurant-name">{order.restaurant}</div>
                  <div className="order-time">{order.time}</div>
                  <div className="order-amount">₹{order.amount}</div>
                  <div className="earning-amount">+₹{order.earnings}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;