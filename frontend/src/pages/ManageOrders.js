// (or wherever your admin order management component is located)

import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaMotorcycle, FaHourglassHalf, FaSearch } from 'react-icons/fa';
import './ManageOrders.css'; // Make sure to create this CSS file

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Load orders on component mount
  useEffect(() => {
    loadOrders();
    
    // Set up interval to refresh orders every 30 seconds
    const intervalId = setInterval(loadOrders, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Filter orders when tab or search term changes
  useEffect(() => {
    filterOrders();
  }, [orders, activeTab, searchTerm]);
  
  const loadOrders = () => {
    // Get orders from localStorage
    const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    setOrders(adminOrders);
    setIsLoading(false);
  };
  
  const filterOrders = () => {
    let filtered = [...orders];
    
    // Filter by tab
    switch(activeTab) {
      case 'pending':
        filtered = filtered.filter(order => order.adminStatus === 'pending');
        break;
      case 'accepted':
        filtered = filtered.filter(order => order.adminStatus === 'accepted' && order.status !== 'delivered');
        break;
      case 'completed':
        filtered = filtered.filter(order => order.status === 'delivered');
        break;
      case 'cancelled':
        filtered = filtered.filter(order => order.status === 'cancelled');
        break;
      default:
        break;
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(search) ||
        order.customer?.name?.toLowerCase().includes(search) ||
        order.customer?.phone?.includes(search) ||
        order.restaurantName?.toLowerCase().includes(search)
      );
    }
    
    setFilteredOrders(filtered);
  };
  
  // Update order status
  const updateOrderStatus = (orderId, newAdminStatus, newStatus) => {
    const updatedOrders = orders.map(order => {
      if (order._id === orderId) {
        const now = Date.now();
        const timeString = new Date(now).toLocaleTimeString([], {
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true
        });
        
        // Create updated order
        const updatedOrder = {
          ...order,
          adminStatus: newAdminStatus,
          status: newStatus || order.status,
        };
        
        // Add status history entry if status changed
        if (newStatus && newStatus !== order.status) {
          updatedOrder.statusHistory = [
            ...order.statusHistory,
            { status: newStatus, time: timeString, timestamp: now }
          ];
        }
        
        return updatedOrder;
      }
      return order;
    });
    
    // Update local storage - admin orders
    localStorage.setItem('adminOrders', JSON.stringify(updatedOrders));
    
    // Update the user-facing orders as well
    const userOrders = JSON.parse(localStorage.getItem('foodAppOrders') || '[]');
    const updatedUserOrders = userOrders.map(order => {
      if (order._id === orderId) {
        const updatedOrder = updatedOrders.find(o => o._id === orderId);
        return updatedOrder;
      }
      return order;
    });
    localStorage.setItem('foodAppOrders', JSON.stringify(updatedUserOrders));
    
    // Update state
    setOrders(updatedOrders);
  };
  
  // Accept an order
  const handleAcceptOrder = (orderId) => {
    updateOrderStatus(orderId, 'accepted', 'accepted');
  };
  
  // Reject an order
  const handleRejectOrder = (orderId) => {
    updateOrderStatus(orderId, 'rejected', 'cancelled');
  };
  
  // Start preparing an order
  const handleStartPreparing = (orderId) => {
    updateOrderStatus(orderId, 'preparing', 'preparing');
  };
  
  // Mark order as out for delivery
  const handleOutForDelivery = (orderId) => {
    updateOrderStatus(orderId, 'delivering', 'out-for-delivery');
  };
  
  // Mark order as delivered
  const handleDelivered = (orderId) => {
    updateOrderStatus(orderId, 'completed', 'delivered');
  };
  
  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };
  
  if (isLoading) {
    return <div className="orders-loading">Loading orders...</div>;
  }
  
  return (
    <div className="manage-orders-container">
      <div className="orders-header">
        <h1>Manage Orders</h1>
        <div className="orders-search">
          <FaSearch className="search-icon" />
          <input 
            type="text"
            placeholder="Search by order ID, customer, or restaurant"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="orders-tabs">
        <button 
          className={`orders-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <span className="orders-badge">{orders.filter(o => o.adminStatus === 'pending').length}</span>
          New Orders
        </button>
        <button 
          className={`orders-tab ${activeTab === 'accepted' ? 'active' : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          <span className="orders-badge">{orders.filter(o => o.adminStatus === 'accepted' && o.status !== 'delivered').length}</span>
          In Progress
        </button>
        <button 
          className={`orders-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
        <button 
          className={`orders-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled
        </button>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <p>No {activeTab} orders found</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <p className="order-time">{formatDate(order.orderTime)}</p>
                </div>
                <div className={`order-status status-${order.status}`}>
                  {order.status?.replace(/-/g, ' ')}
                </div>
              </div>
              
              <div className="order-restaurant">
                <strong>Restaurant:</strong> {order.restaurantName}
              </div>
              
              <div className="order-customer">
                <strong>Customer:</strong> {order.customer?.name || 'Anonymous'}
                {order.customer?.phone && ` | ${order.customer.phone}`}
              </div>
              
              <div className="order-items">
                <h4>Items:</h4>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.name} x {item.quantity} - ₹{(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="order-payment">
                <div><strong>Subtotal:</strong> ₹{order.subtotal.toFixed(2)}</div>
                {order.discount > 0 && (
                  <div><strong>Discount:</strong> -₹{order.discount.toFixed(2)}</div>
                )}
                <div><strong>Delivery:</strong> ₹{order.deliveryFee.toFixed(2)}</div>
                <div><strong>Tax:</strong> ₹{order.tax.toFixed(2)}</div>
                <div className="total"><strong>Total:</strong> ₹{order.total.toFixed(2)}</div>
                <div><strong>Payment:</strong> {order.paymentMethod}</div>
              </div>
              
              <div className="order-actions">
                {order.adminStatus === 'pending' && (
                  <>
                    <button className="accept-btn" onClick={() => handleAcceptOrder(order._id)}>
                      <FaCheck /> Accept
                    </button>
                    <button className="reject-btn" onClick={() => handleRejectOrder(order._id)}>
                      <FaTimes /> Reject
                    </button>
                  </>
                )}
                
                {order.adminStatus === 'accepted' && order.status === 'accepted' && (
                  <button className="preparing-btn" onClick={() => handleStartPreparing(order._id)}>
                    <FaHourglassHalf /> Start Preparing
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button className="delivery-btn" onClick={() => handleOutForDelivery(order._id)}>
                    <FaMotorcycle /> Out for Delivery
                  </button>
                )}
                
                {order.status === 'out-for-delivery' && (
                  <button className="delivered-btn" onClick={() => handleDelivered(order._id)}>
                    <FaCheck /> Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageOrders;