import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStore, FaCheckCircle, FaUtensils, FaMotorcycle, FaHome, FaPhoneAlt, FaCheck, FaMapMarkerAlt, FaSearch, FaAngleDown, FaAngleUp } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import './OrdersPage.css';

const OrdersPage = ({ handleLogout }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewOrder, setIsNewOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [expandedOrderIds, setExpandedOrderIds] = useState([]);
  
  const navigate = useNavigate();
  
  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Get orders from localStorage (or API in a real app)
        const savedOrders = localStorage.getItem('foodAppOrders');
        let userOrders = [];
        
        if (savedOrders) {
          userOrders = JSON.parse(savedOrders);
        } else {
          // If no orders in localStorage, use mock data for demo
          const mockOrders = [
            {
              _id: 'ORD123456',
              restaurantName: 'Spice Garden',
              restaurantId: 'rest123',
              items: [
                { name: 'Butter Chicken', quantity: 1, price: 280 },
                { name: 'Garlic Naan', quantity: 2, price: 40 },
                { name: 'Jeera Rice', quantity: 1, price: 120 }
              ],
              subtotal: 480,
              deliveryFee: 30,
              tax: 24,
              total: 534,
              status: 'order-received',
              statusHistory: [
                { status: 'order-received', time: '12:30 PM', timestamp: Date.now() - 1800000 }
              ],
              orderTime: Date.now() - 1800000,
              estimatedDelivery: Date.now() + 3600000,
              paymentMethod: 'Cash on Delivery'
            }
          ];
          
          userOrders = mockOrders;
          localStorage.setItem('foodAppOrders', JSON.stringify(mockOrders));
        }
        
        setOrders(userOrders);
        
        // Check if there's a new order parameter in URL
        const params = new URLSearchParams(window.location.search);
        const newOrderId = params.get('new');
        
        if (newOrderId) {
          const newOrder = userOrders.find(order => order._id === newOrderId);
          if (newOrder) {
            setSelectedOrder(newOrder);
            window.history.replaceState({}, document.title, '/orders');
          } else {
            setSelectedOrder(userOrders[0]);
          }
        } else {
          setSelectedOrder(userOrders[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newOrderId = params.get('new');
    
    if (newOrderId) {
      setIsNewOrder(true);
      setTimeout(() => {
        setIsNewOrder(false);
      }, 3000);
    }
  }, []);
  
  useEffect(() => {
    loadOrders();
    
    const intervalId = setInterval(() => {
      loadOrders();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const loadOrders = () => {
    setLoading(true);
    
    try {
      const savedOrders = JSON.parse(localStorage.getItem('foodAppOrders') || '[]');
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userId = currentUser.id || localStorage.getItem('userId');
      
      const userOrders = savedOrders.filter(order => order.customer?.id === userId);
      
      setOrders(userOrders);
      
      const searchParams = new URLSearchParams(window.location.search);
      const orderId = searchParams.get('id') || searchParams.get('new');
      
      if (orderId) {
        const selectedOrder = userOrders.find(order => order._id === orderId);
        if (selectedOrder) {
          setSelectedOrder(selectedOrder);
        }
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
    
    setLoading(false);
  };
  
  // Format time (12-hour format)
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'order-received': return 'Order Received';
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Preparing Food';
      case 'out-for-delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  // Add a function to toggle order summary expansion
  const toggleOrderSummary = (orderId) => {
    setExpandedOrderIds(prev => 
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Add this component to show a countdown timer
  const DeliveryCountdown = ({ estimatedDelivery, status }) => {
    const [timeRemaining, setTimeRemaining] = useState('');
    
    useEffect(() => {
      if (['delivered', 'cancelled'].includes(status)) {
        return;
      }
      
      const updateCountdown = () => {
        const now = new Date();
        const deliveryTime = new Date(estimatedDelivery);
        const diff = deliveryTime - now;
        
        if (diff <= 0) {
          setTimeRemaining('Arriving any moment now');
          return;
        }
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        if (minutes > 60) {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          setTimeRemaining(`${hours}h ${mins}m remaining`);
        } else {
          setTimeRemaining(`${minutes}m ${seconds}s remaining`);
        }
      };
      
      updateCountdown();
      const countdownInterval = setInterval(updateCountdown, 1000);
      return () => clearInterval(countdownInterval);
    }, [estimatedDelivery, status]);
    
    if (!estimatedDelivery || ['delivered', 'cancelled'].includes(status)) {
      return null;
    }
    
    return (
      <div className="delivery-countdown">
        <div className="countdown-time">{timeRemaining}</div>
        <div className="estimated-arrival">
          Estimated arrival: {new Date(estimatedDelivery).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    );
  };

  // Order status timeline component
  const OrderStatusTimeline = ({ order }) => {
    const allStatuses = [
      { 
        id: 'order-received', 
        label: 'Order Received', 
        icon: <FaStore />,
        description: 'Your order has been received by the restaurant'
      },
      { 
        id: 'confirmed', 
        label: 'Order Confirmed', 
        icon: <FaCheckCircle />,
        description: 'Restaurant has confirmed your order'
      },
      { 
        id: 'preparing', 
        label: 'Preparing', 
        icon: <FaUtensils />,
        description: 'The chef is preparing your delicious food'
      },
      { 
        id: 'out-for-delivery', 
        label: 'Out for Delivery', 
        icon: <FaMotorcycle />,
        description: 'Your food is on the way to you'
      },
      { 
        id: 'delivered', 
        label: 'Delivered', 
        icon: <FaCheckCircle />,
        description: 'Your order has been delivered. Enjoy!'
      }
    ];
    
    // Get the current status index
    const currentStatusIndex = allStatuses.findIndex(status => status.id === order.status);
    
    // Get status history from the order
    const getStatusTime = (statusId) => {
      if (!order.statusHistory) return '';
      const statusEntry = order.statusHistory.find(h => h.status === statusId);
      return statusEntry ? formatTime(statusEntry.timestamp) : '';
    };
    
    return (
      <div className="enhanced-order-timeline">
        {allStatuses.map((status, index) => {
          // Determine if this status is completed, active, or pending
          const isCompleted = index <= currentStatusIndex;
          const isActive = index === currentStatusIndex;
          const isPending = index > currentStatusIndex;
          
          // Display only relevant statuses
          const shouldDisplay = isCompleted || isActive || index === currentStatusIndex + 1;
          if (!shouldDisplay) return null;
          
          return (
            <div 
              key={status.id}
              className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}
            >
              <div className="timeline-icon">
                {status.icon}
                {isActive && <div className="pulse-ring"></div>}
              </div>
              
              {index < allStatuses.length - 1 && (
                <div className={`timeline-line ${isCompleted ? 'completed' : ''}`}></div>
              )}
              
              <div className="timeline-content">
                <h4>{status.label}</h4>
                <p>{status.description}</p>
                <div className="timeline-time">
                  {isCompleted || isActive ? getStatusTime(status.id) : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Order actions component
  const OrderActions = ({ order, onCancel, onReorder }) => {
    const isCancellable = order.status === 'order-received' || order.status === 'confirmed';
    
    return (
      <div className="order-actions-container">
        {isCancellable && (
          <button 
            className="cancel-order-btn" 
            onClick={() => onCancel(order._id)}
          >
            Cancel Order
          </button>
        )}
        
        <button 
          className="reorder-btn" 
          onClick={() => onReorder(order)}
        >
          Order Again
        </button>
        
        <button className="support-btn">
          Get Help
        </button>
      </div>
    );
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const updatedOrders = orders.map(order => {
        if (order._id === orderId) {
          return {
            ...order,
            status: 'cancelled',
            statusHistory: [
              ...order.statusHistory,
              { status: 'cancelled', time: formatTime(Date.now()), timestamp: Date.now() }
            ]
          };
        }
        return order;
      });
      
      localStorage.setItem('foodAppOrders', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updatedOrders.find(o => o._id === orderId));
      }
    }
  };
  
  const handleReorder = (order) => {
    navigate('/cart', { state: { reorderItems: order.items, restaurantId: order.restaurantId } });
  };

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = !searchQuery || 
      order.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    let matchesStatus = true;
    if (statusFilter) {
      if (statusFilter === 'active') {
        matchesStatus = !['delivered', 'cancelled'].includes(order.status);
      } else {
        matchesStatus = order.status === statusFilter;
      }
    }
    
    // Time filter
    let matchesTime = true;
    if (timeFilter) {
      const orderDate = new Date(order.orderTime);
      const now = new Date();
      
      if (timeFilter === 'today') {
        matchesTime = orderDate.toDateString() === now.toDateString();
      } else if (timeFilter === 'week') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        matchesTime = orderDate >= weekAgo;
      } else if (timeFilter === 'month') {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        matchesTime = orderDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesStatus && matchesTime;
  });

  if (loading) {
    return (
      <>
        <Navbar handleLogout={handleLogout} />
        <div className="orders-loading">
          <div className="orders-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Navbar handleLogout={handleLogout} />
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <h1>My Orders</h1>
            <button className="orders-home-btn" onClick={() => navigate('/dashboard')}>
              Back to Home
            </button>
          </div>
          
          <div className="orders-layout">
            {/* Orders List Sidebar */}
            <div className="orders-sidebar">
              <h2>Order History</h2>

              <div className="orders-filter">
                <div className="search-container">
                  <input 
                    type="text" 
                    placeholder="Search orders..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="order-search-input" 
                  />
                  <FaSearch className="search-icon" />
                </div>
                
                <div className="filter-options">
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="status-filter"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active Orders</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  <select 
                    value={timeFilter} 
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="time-filter"
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>

              <div className="orders-list">
                {filteredOrders.map(order => (
                  <div 
                    key={order._id} 
                    className={`order-list-item ${selectedOrder?._id === order._id ? 'selected' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="order-list-restaurant">{order.restaurantName}</div>
                    <div className="order-list-details">
                      <span className="order-list-id">#{order._id}</span>
                      <span className="order-list-date">
                        {formatDate(order.orderTime)}
                      </span>
                    </div>
                    <div className={`order-list-status status-${order.status}`}>
                      {getStatusText(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Selected Order Details */}
            {selectedOrder && (
              <div className="order-details">
                <div className="order-details-header">
                  <h2>{selectedOrder.restaurantName}</h2>
                  <div className="order-meta">
                    <span className="order-id">Order #{selectedOrder._id}</span>
                    <span className="order-date">
                      Placed on {formatDate(selectedOrder.orderTime)}
                    </span>
                  </div>
                </div>
                
                {/* Enhanced Status Timeline - Keep this one */}
                <OrderStatusTimeline order={selectedOrder} />

                {/* Delivery Countdown */}
                <DeliveryCountdown 
                  estimatedDelivery={selectedOrder.estimatedDelivery} 
                  status={selectedOrder.status} 
                />
                
                {/* Order details with toggle button */}
                <button 
                  className="toggle-summary-btn" 
                  onClick={() => toggleOrderSummary(selectedOrder._id)}
                >
                  {expandedOrderIds.includes(selectedOrder._id) ? (
                    <>Order Summary <FaAngleUp className="toggle-icon" /></>
                  ) : (
                    <>Order Summary <FaAngleDown className="toggle-icon" /></>
                  )}
                </button>
                
                {/* Collapsible order items */}
                {expandedOrderIds.includes(selectedOrder._id) && (
                  <div className="order-items-section">
                    <div className="order-items-list">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <div className="order-item-info">
                            <span className="order-item-name">{item.name}</span>
                            <span className="order-item-qty">×{item.quantity}</span>
                          </div>
                          <span className="order-item-price">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-summary">
                      <div className="order-summary-row">
                        <span>Subtotal</span>
                        <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="order-summary-row">
                        <span>Delivery Fee</span>
                        <span>₹{selectedOrder.deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="order-summary-row">
                        <span>Tax</span>
                        <span>₹{selectedOrder.tax.toFixed(2)}</span>
                      </div>
                      <div className="order-summary-row total">
                        <span>Total</span>
                        <span>₹{selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="order-payment">
                      <span className="payment-label">Payment Method</span>
                      <span className="payment-value">{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                )}

                {isNewOrder && (
                  <div className="new-order-animation">
                    <div className="success-checkmark">
                      <div className="check-icon">
                        <span className="icon-line line-tip"></span>
                        <span className="icon-line line-long"></span>
                      </div>
                    </div>
                    <p>Order Placed Successfully!</p>
                  </div>
                )}

                {/* Order Actions */}
                <OrderActions 
                  order={selectedOrder} 
                  onCancel={handleCancelOrder} 
                  onReorder={handleReorder} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersPage;