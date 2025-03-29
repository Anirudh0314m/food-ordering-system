import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaMotorcycle, FaWallet, FaClipboardList, FaChartLine, 
         FaSignOutAlt, FaUser, FaSearch, FaEye } from 'react-icons/fa';
import '../styles/DeliveryOrders.css';

const DeliveryOrders = ({ handleLogout }) => {
  const navigate = useNavigate();
  const [partnerName, setPartnerName] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'delivery_partner') {
      navigate('/delivery/login');
      return;
    }
    
    // Load partner information
    const name = localStorage.getItem('partnerName') || 'Delivery Partner';
    setPartnerName(name);
    
    // Get partner ID
    const id = localStorage.getItem('partnerId');
    setPartnerId(id);
    
    // Load order history
    loadOrderHistory();
  }, [navigate]);
  
  const loadOrderHistory = () => {
    setLoading(true);
    
    try {
      // Get partner ID
      const id = localStorage.getItem('partnerId');
      if (!id) {
        setOrders([]);
        setLoading(false);
        return;
      }
      
      // Get all orders from localStorage (both admin and user)
      const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      const userOrders = JSON.parse(localStorage.getItem('foodAppOrders') || '[]');
      
      // Combine and filter orders delivered by this partner
      const allOrders = [...adminOrders, ...userOrders];
      const uniqueOrders = allOrders.reduce((unique, order) => {
        if (!unique.some(o => o._id === order._id) && 
            order.deliveryPartnerId === id) {
          unique.push(order);
        }
        return unique;
      }, []);
      
      setOrders(uniqueOrders);
    } catch (error) {
      console.error("Error loading order history:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const getFilteredOrders = () => {
    let filtered = [...orders];
    
    // Filter by tab
    if (activeTab === 'completed') {
      filtered = filtered.filter(order => order.status === 'delivered');
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter(order => order.status === 'cancelled');
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(term) ||
        order.restaurantName?.toLowerCase().includes(term) ||
        order.customer?.name?.toLowerCase().includes(term) ||
        order.address?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getDeliveryTime = (order) => {
    if (!order.statusHistory) return 'N/A';
    
    const startEvent = order.statusHistory.find(s => s.status === 'accepted' || s.status === 'out-for-delivery');
    const endEvent = order.statusHistory.find(s => s.status === 'delivered');
    
    if (!startEvent || !endEvent) return 'N/A';
    
    const startTime = new Date(startEvent.timestamp);
    const endTime = new Date(endEvent.timestamp);
    const diffMinutes = Math.floor((endTime - startTime) / (1000 * 60));
    
    return `${diffMinutes} min`;
  };
  
  const getOrderAmount = (order) => {
    return order.deliveryFee || 40;
  };
  
  const getOrderStatus = (status) => {
    switch (status) {
      case 'delivered': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status.replace(/-/g, ' ');
    }
  };
  
  const filteredOrders = getFilteredOrders();
  
  return (
    <div className="dashboard-container orders-dashboard">
      {/* Header/Navbar */}
      <header className="dashboard-header">
        <div className="logo">
          <FaMotorcycle />
          <h1>FastFood Delivery Partner</h1>
        </div>
        
        <nav className="dashboard-nav">
          <Link to="/delivery/dashboard" className="nav-item">
            <FaUser /> Home
          </Link>
          <Link to="/delivery/orders" className="nav-item active">
            <FaClipboardList /> Orders
          </Link>
          <Link to="/delivery/earnings" className="nav-item">
            <FaWallet /> Earnings
          </Link>
          <Link to="/delivery/account" className="nav-item">
            <FaChartLine /> Account
          </Link>
        </nav>
        
        <div className="user-menu">
          <span className="user-name">{partnerName}</span>
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <section className="orders-section">
          <h2>Order History</h2>
          
          <div className="orders-filter-bar">
            <div className="tabs">
              <button 
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Orders
              </button>
              <button 
                className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </button>
              <button 
                className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
                onClick={() => setActiveTab('cancelled')}
              >
                Cancelled
              </button>
            </div>
            
            <div className="search-bar">
              <input 
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="search-icon" />
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container">Loading order history...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="no-orders-message">
              <p>No orders found matching your filters.</p>
            </div>
          ) : (
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Restaurant</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Delivery Time</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className={`order-row ${order.status}`}>
                      <td>#{order._id.slice(-6)}</td>
                      <td>{order.restaurantName || 'Restaurant'}</td>
                      <td>{order.customer?.name || 'Customer'}</td>
                      <td>{formatDate(order.orderTime || order.timestamp || Date.now())}</td>
                      <td>{getDeliveryTime(order)}</td>
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {getOrderStatus(order.status)}
                        </span>
                      </td>
                      <td className="amount">₹{getOrderAmount(order)}</td>
                      <td>
                        <button 
                          className="view-btn" 
                          onClick={() => setSelectedOrder(order)}
                        >
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        
        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="order-details-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Order Details - #{selectedOrder._id.slice(-6)}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="order-info">
                <div className="order-meta">
                  <div className="info-group">
                    <h4>Restaurant</h4>
                    <p>{selectedOrder.restaurantName || 'Restaurant'}</p>
                    <p>{selectedOrder.restaurantAddress || 'Address'}</p>
                  </div>
                  
                  <div className="info-group">
                    <h4>Customer</h4>
                    <p>{selectedOrder.customer?.name || 'Customer'}</p>
                    <p>{selectedOrder.address || 'Address'}</p>
                  </div>
                  
                  <div className="info-group">
                    <h4>Order Time</h4>
                    <p>{formatDate(selectedOrder.orderTime || Date.now())}</p>
                    <p>{formatTime(selectedOrder.orderTime || Date.now())}</p>
                  </div>
                  
                  <div className="info-group">
                    <h4>Status</h4>
                    <p className={`status-badge ${selectedOrder.status}`}>
                      {getOrderStatus(selectedOrder.status)}
                    </p>
                    <p>Delivery Fee: ₹{selectedOrder.deliveryFee || 40}</p>
                  </div>
                </div>
                
                <div className="items-section">
                  <h4>Order Items</h4>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.items || []).map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>₹{item.price}</td>
                          <td>₹{item.quantity * item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3">Subtotal</td>
                        <td>₹{selectedOrder.subtotal || 0}</td>
                      </tr>
                      <tr>
                        <td colSpan="3">Delivery Fee</td>
                        <td>₹{selectedOrder.deliveryFee || 40}</td>
                      </tr>
                      <tr>
                        <td colSpan="3">Total</td>
                        <td>₹{selectedOrder.total || 0}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                  <div className="status-timeline">
                    <h4>Delivery Timeline</h4>
                    <ul className="timeline">
                      {selectedOrder.statusHistory.map((status, index) => (
                        <li key={index} className="timeline-item">
                          <div className="timeline-marker"></div>
                          <div className="timeline-content">
                            <h5>{getOrderStatus(status.status)}</h5>
                            <p>{status.time || formatTime(status.timestamp)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  className="close-modal-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DeliveryOrders;