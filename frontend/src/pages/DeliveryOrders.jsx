import React, { useState, useEffect } from 'react';
import { FaClipboardList, FaCheck, FaMapMarkerAlt, FaUser, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import DeliveryNavbar from '../components/DeliveryNavbar';
import '../styles/DeliveryOrders.css';

const DeliveryOrders = ({ handleLogout }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [filter, setFilter] = useState('active');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get partner info from localStorage
    const name = localStorage.getItem('partnerName');
    setPartnerName(name || 'Delivery Partner');
    
    // Check online status from localStorage or set default
    const status = localStorage.getItem('isOnline') === 'true';
    setIsOnline(status);
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`;
          setCurrentLocation(coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          setCurrentLocation('Location unavailable');
        }
      );
    }
    
    // Load mock orders data
    loadMockOrders();
    
    setIsLoading(false);
  }, []);
  
  const loadMockOrders = () => {
    const mockOrders = [
      {
        id: 'ORD12345',
        status: 'active',
        restaurant: {
          name: 'Burger Palace',
          address: '123 Main St, City'
        },
        customer: {
          name: 'John Doe',
          address: '456 Oak Ave, City'
        },
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
        amount: 450,
        deliveryFee: 50
      },
      {
        id: 'ORD67890',
        status: 'completed',
        restaurant: {
          name: 'Pizza Corner',
          address: '789 Pine St, City'
        },
        customer: {
          name: 'Alice Smith',
          address: '101 Elm St, City'
        },
        createdAt: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
        amount: 650,
        deliveryFee: 75
      },
      {
        id: 'ORD54321',
        status: 'completed',
        restaurant: {
          name: 'Taco Spot',
          address: '321 Maple Ave, City'
        },
        customer: {
          name: 'Bob Johnson',
          address: '555 Cedar Rd, City'
        },
        createdAt: new Date(Date.now() - 240 * 60000).toISOString(), // 4 hours ago
        amount: 350,
        deliveryFee: 45
      }
    ];
    
    setOrders(mockOrders);
  };
  
  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    localStorage.setItem('isOnline', newStatus.toString());
  };
  
  const updateOrderStatus = (orderId, status) => {
    setOrders(
      orders.map(order => 
        order.id === orderId 
          ? { ...order, status } 
          : order
      )
    );
  };
  
  const formatOrderTime = (dateString) => {
    const orderDate = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now - orderDate) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} mins ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };
  
  // Filter orders based on the selected filter
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return order.status === 'active';
    if (filter === 'completed') return order.status === 'completed';
    return true;
  });

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="delivery-orders-container">
      <DeliveryNavbar 
        isOnline={isOnline}
        toggleOnlineStatus={toggleOnlineStatus}
        partnerName={partnerName}
        currentLocation={currentLocation}
        handleLogout={handleLogout}
      />
      
      <div className="orders-container">
        <div className="orders-header">
          <h1>Your Orders</h1>
          <div className="filter-tabs">
            <button 
              className={filter === 'active' ? 'active' : ''} 
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button 
              className={filter === 'completed' ? 'active' : ''} 
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              All
            </button>
          </div>
        </div>
        
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <FaClipboardList size={48} />
              <p>No {filter} orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className={`order-card ${order.status}`}>
                <div className="order-header">
                  <span className="order-id">Order #{order.id.slice(-6)}</span>
                  <span className={`order-status ${order.status}`}>
                    {order.status === 'active' ? 'Active' : 'Completed'}
                  </span>
                </div>
                
                <div className="order-details">
                  <div className="restaurant">
                    <h3>{order.restaurant.name}</h3>
                    <p>{order.restaurant.address}</p>
                  </div>
                  
                  <div className="delivery-details">
                    <div className="customer-info">
                      <FaUser />
                      <span>{order.customer.name}</span>
                    </div>
                    <div className="address">
                      <FaMapMarkerAlt />
                      <span>{order.customer.address}</span>
                    </div>
                    <div className="time">
                      <FaClock />
                      <span>{formatOrderTime(order.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="order-summary">
                    <div className="amount">
                      <span className="label">Order Total:</span>
                      <span className="value">₹{order.amount.toFixed(2)}</span>
                    </div>
                    <div className="earning">
                      <span className="label">Your Earning:</span>
                      <span className="value">₹{order.deliveryFee.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {order.status === 'active' && (
                    <div className="action-buttons">
                      <button 
                        className="btn deliver" 
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                      >
                        <FaCheck /> Mark as Delivered
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrders;