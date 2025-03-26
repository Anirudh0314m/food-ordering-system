import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaMotorcycle, FaMapMarkerAlt, FaPhoneAlt, FaUser, 
         FaWallet, FaClipboardList, FaChartLine, FaSignOutAlt } from 'react-icons/fa';
import '../styles/DeliveryDashboard.css';

const DeliveryDashboard = ({ handleLogout }) => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newOrders, setNewOrders] = useState([]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [totalRating, setTotalRating] = useState(4.8);
  
  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'delivery_partner') {
      navigate('/delivery/login');
      return;
    }
    
    // Load partner name
    const name = localStorage.getItem('partnerName') || 'Delivery Partner';
    setPartnerName(name);
    
    // Load online status
    const savedStatus = localStorage.getItem('isOnline') === 'true';
    setIsOnline(savedStatus);
    
    // Load dummy data
    loadDummyData();
  }, [navigate]);
  
  const loadDummyData = () => {
    // Mock current order
    setCurrentOrder({
      id: 'ORD12345',
      status: 'picked_up',
      restaurant: {
        name: 'Burger Palace',
        address: '123 Main St, Cityville',
        image: '/img/burger-restaurant.jpg',
        phone: '987-654-3210'
      },
      customer: {
        name: 'John Smith',
        address: '456 Elm St, Townsville',
        phone: '123-456-7890'
      },
      items: [
        { name: 'Double Cheeseburger', quantity: 1, price: 180 },
        { name: 'French Fries (L)', quantity: 1, price: 90 },
        { name: 'Chocolate Milkshake', quantity: 2, price: 120 }
      ],
      total: 510,
      deliveryFee: 50,
      paymentMethod: 'Cash on Delivery'
    });
    
    // Mock new orders
    setNewOrders([
      {
        id: 'ORD67890',
        restaurant: {
          name: 'Pizza Express',
          address: '789 Oak St, Cityville',
          distance: '2.5 km'
        },
        customer: {
          address: '101 Pine St, Townsville',
          distance: '3.2 km'
        },
        deliveryFee: 60
      },
      {
        id: 'ORD54321',
        restaurant: {
          name: 'Taco Haven',
          address: '246 Maple Ave, Cityville',
          distance: '1.8 km'
        },
        customer: {
          address: '357 Cedar Rd, Townsville',
          distance: '2.4 km'
        },
        deliveryFee: 45
      }
    ]);
    
    // Set dummy stats
    setTodayEarnings(350);
    setTodayOrders(5);
  };
  
  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    localStorage.setItem('isOnline', newStatus.toString());
    
    // In a real app, you'd update this with the backend
    console.log(`Status updated to: ${newStatus ? 'Online' : 'Offline'}`);
  };
  
  const acceptOrder = (orderId) => {
    console.log(`Accepted order: ${orderId}`);
    setNewOrders(newOrders.filter(order => order.id !== orderId));
    
    // In a real app, you'd call your API to accept the order
    alert(`Order ${orderId} accepted!`);
  };
  
  const rejectOrder = (orderId) => {
    console.log(`Rejected order: ${orderId}`);
    setNewOrders(newOrders.filter(order => order.id !== orderId));
  };
  
  const updateOrderStatus = (status) => {
    if (!currentOrder) return;
    
    console.log(`Updating order ${currentOrder.id} to ${status}`);
    
    // In a real app, you'd call your API to update the order status
    setCurrentOrder({
      ...currentOrder,
      status
    });
    
    // If delivered, clear current order and update stats
    if (status === 'delivered') {
      setTimeout(() => {
        setTodayEarnings(todayEarnings + currentOrder.deliveryFee);
        setTodayOrders(todayOrders + 1);
        setCurrentOrder(null);
        alert('Order marked as delivered!');
      }, 1000);
    }
  };

  return (
    <div className="dashboard-container delivery-dashboard">
      {/* Header/Navbar - styled like your customer dashboard */}
      <header className="dashboard-header">
        <div className="logo">
          <FaMotorcycle />
          <h1>FastFood Delivery Partner</h1>
        </div>
        
        {/* Status Toggle Button - Primary functional element for delivery partners */}
        <div className="status-toggle-container">
          <label className="status-toggle">
            <input 
              type="checkbox" 
              checked={isOnline}
              onChange={toggleOnlineStatus}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className={`status-text ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <nav className="dashboard-nav">
          <Link to="/delivery/dashboard" className="nav-item active">
            <FaUser /> Home
          </Link>
          <Link to="/delivery/orders" className="nav-item">
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
        {/* Top Stats Cards - similar to customer dashboard stats */}
        <section className="stats-section">
          <div className="stats-card earnings-card">
            <div className="stats-icon">
              <FaWallet />
            </div>
            <div className="stats-info">
              <h3>Today's Earnings</h3>
              <p className="stats-value">₹{todayEarnings}</p>
            </div>
          </div>
          
          <div className="stats-card orders-card">
            <div className="stats-icon">
              <FaClipboardList />
            </div>
            <div className="stats-info">
              <h3>Completed Orders</h3>
              <p className="stats-value">{todayOrders}</p>
            </div>
          </div>
          
          <div className="stats-card rating-card">
            <div className="stats-icon">
              <FaChartLine />
            </div>
            <div className="stats-info">
              <h3>Your Rating</h3>
              <p className="stats-value">{totalRating}/5.0</p>
            </div>
          </div>
        </section>
        
        {/* Current Active Order */}
        {currentOrder && (
          <section className="active-order-section">
            <h2>Current Delivery</h2>
            <div className="active-order-card">
              <div className="order-header">
                <h3>Order #{currentOrder.id.slice(-5)}</h3>
                <span className={`order-status ${currentOrder.status}`}>
                  {currentOrder.status === 'accepted' ? 'Accepted - Go to Restaurant' : 
                   currentOrder.status === 'picked_up' ? 'Picked Up - Delivering' : 
                   'Delivered'}
                </span>
              </div>
              
              <div className="order-details">
                <div className="location-details">
                  <div className="restaurant-details">
                    <h4>Pick Up From:</h4>
                    <div className="location-card">
                      <div className="location-icon restaurant">
                        <FaMapMarkerAlt />
                      </div>
                      <div className="location-info">
                        <h5>{currentOrder.restaurant.name}</h5>
                        <p>{currentOrder.restaurant.address}</p>
                        <a href={`tel:${currentOrder.restaurant.phone}`} className="contact-button">
                          <FaPhoneAlt /> Call Restaurant
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="customer-details">
                    <h4>Deliver To:</h4>
                    <div className="location-card">
                      <div className="location-icon customer">
                        <FaMapMarkerAlt />
                      </div>
                      <div className="location-info">
                        <h5>{currentOrder.customer.name}</h5>
                        <p>{currentOrder.customer.address}</p>
                        <a href={`tel:${currentOrder.customer.phone}`} className="contact-button">
                          <FaPhoneAlt /> Call Customer
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="order-summary">
                  <h4>Order Summary</h4>
                  <div className="order-items">
                    {currentOrder.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="item-quantity">{item.quantity}x</span>
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-total">
                    <div className="total-row">
                      <span>Order Total:</span>
                      <span>₹{currentOrder.total}</span>
                    </div>
                    <div className="total-row delivery-fee">
                      <span>Your Earning:</span>
                      <span>₹{currentOrder.deliveryFee}</span>
                    </div>
                    <div className="total-row payment-method">
                      <span>Payment:</span>
                      <span>{currentOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                
                <div className="order-actions">
                  {currentOrder.status === 'accepted' && (
                    <button 
                      onClick={() => updateOrderStatus('picked_up')} 
                      className="action-button pickup"
                    >
                      Mark as Picked Up
                    </button>
                  )}
                  
                  {currentOrder.status === 'picked_up' && (
                    <button 
                      onClick={() => updateOrderStatus('delivered')} 
                      className="action-button deliver"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  
                  <button className="action-button navigate">
                    Navigate
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* New Order Requests */}
        <section className="new-orders-section">
          <h2>New Delivery Requests</h2>
          
          {newOrders.length === 0 ? (
            <div className="no-orders-message">
              <p>No new delivery requests available at the moment.</p>
              {!isOnline && (
                <p>Go online to receive delivery requests!</p>
              )}
            </div>
          ) : (
            <div className="orders-grid">
              {newOrders.map(order => (
                <div key={order.id} className="order-request-card">
                  <div className="order-info">
                    <h3>{order.restaurant.name}</h3>
                    <p className="restaurant-distance">
                      <FaMapMarkerAlt /> {order.restaurant.distance} from you
                    </p>
                    <p className="restaurant-address">{order.restaurant.address}</p>
                    
                    <div className="delivery-details">
                      <p className="delivery-distance">
                        <FaMapMarkerAlt /> {order.customer.distance} total distance
                      </p>
                      <p className="delivery-fee">₹{order.deliveryFee} earning</p>
                    </div>
                  </div>
                  
                  <div className="request-actions">
                    <button 
                      onClick={() => acceptOrder(order.id)}
                      className="accept-button"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => rejectOrder(order.id)}
                      className="reject-button"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DeliveryDashboard;