import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaMotorcycle, FaMapMarkerAlt, FaPhoneAlt, FaUser, 
         FaWallet, FaClipboardList, FaChartLine, FaSignOutAlt } from 'react-icons/fa';
import '../styles/DeliveryDashboard.css';

const DeliveryDashboard = ({ handleLogout }) => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerId, setPartnerId] = useState('');
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
    
    // Load partner information
    const name = localStorage.getItem('partnerName') || 'Delivery Partner';
    setPartnerName(name);
    
    // Get or create partner ID
    let id = localStorage.getItem('partnerId');
    if (!id) {
      id = 'DP' + Date.now().toString().slice(-8);
      localStorage.setItem('partnerId', id);
    }
    setPartnerId(id);
    
    // Load online status
    const savedStatus = localStorage.getItem('isOnline') === 'true';
    setIsOnline(savedStatus);
    
    // Load current delivery if exists
    const savedCurrentOrder = localStorage.getItem('currentDeliveryOrder');
    if (savedCurrentOrder) {
      try {
        const parsedOrder = JSON.parse(savedCurrentOrder);
        setCurrentOrder(parsedOrder);
      } catch (error) {
        console.error("Error loading current order:", error);
      }
    }
    
    // Load dashboard data
    if (savedStatus) {
      fetchAvailableOrders();
    }
    
    // Load earnings data
    const savedEarnings = localStorage.getItem('todayEarnings');
    const savedOrders = localStorage.getItem('todayOrders');
    
    if (savedEarnings) {
      setTodayEarnings(parseFloat(savedEarnings));
    }
    
    if (savedOrders) {
      setTodayOrders(parseInt(savedOrders));
    }
    
    // Poll for new orders if online
    const intervalId = setInterval(() => {
      if (localStorage.getItem('isOnline') === 'true') {
        fetchAvailableOrders();
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [navigate]);
  
  useEffect(() => {
    if (isOnline) {
      fetchAvailableOrders();
    }
  }, [isOnline]);
  
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
    
    // Fetch available orders when going online
    if (newStatus) {
      fetchAvailableOrders();
    } else {
      setNewOrders([]);
    }
  };
  
  const acceptOrder = (orderId) => {
    // Find the order in available orders
    const orderToAccept = newOrders.find(order => order.id === orderId);
    if (!orderToAccept) return;
    
    try {
      console.log(`Accepting order ${orderId}`);
      
      // Remove from available orders
      setNewOrders(newOrders.filter(order => order.id !== orderId));
      
      // Update order in admin orders
      const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      const updatedAdminOrders = adminOrders.map(order => {
        if (order._id === orderId) {
          const now = Date.now();
          return {
            ...order,
            deliveryPartnerId: partnerId,
            deliveryPartnerName: partnerName,
            deliveryStatus: 'accepted',
            deliveryAcceptedAt: now
          };
        }
        return order;
      });
      localStorage.setItem('adminOrders', JSON.stringify(updatedAdminOrders));
      
      // Update customer orders
      const userOrders = JSON.parse(localStorage.getItem('foodAppOrders') || '[]');
      const updatedUserOrders = userOrders.map(order => {
        if (order._id === orderId) {
          const now = Date.now();
          return {
            ...order,
            deliveryPartnerId: partnerId,
            deliveryPartnerName: partnerName,
            deliveryStatus: 'accepted',
            deliveryAcceptedAt: now
          };
        }
        return order;
      });
      localStorage.setItem('foodAppOrders', JSON.stringify(updatedUserOrders));
      
      // Create detailed order object for delivery partner
      const adminOrder = adminOrders.find(order => order._id === orderId);
      if (adminOrder) {
        const detailedOrder = {
          id: orderId,
          status: 'accepted',
          restaurant: {
            name: adminOrder.restaurantName || orderToAccept.restaurant.name,
            address: adminOrder.restaurantAddress || orderToAccept.restaurant.address,
            phone: adminOrder.restaurantPhone || '123-456-7890',
            distance: orderToAccept.restaurant.distance
          },
          customer: {
            name: adminOrder.customer?.name || 'Customer',
            address: formatAddress(adminOrder.address) || orderToAccept.customer.address,
            phone: adminOrder.customer?.phone || '987-654-3210',
            distance: orderToAccept.customer.distance
          },
          items: adminOrder.items || [],
          amount: adminOrder.total || orderToAccept.amount,
          deliveryFee: adminOrder.deliveryFee || orderToAccept.deliveryFee,
          paymentMethod: adminOrder.paymentMethod || 'Cash on Delivery'
        };
        
        // Set as current order
        setCurrentOrder(detailedOrder);
        localStorage.setItem('currentDeliveryOrder', JSON.stringify(detailedOrder));
      }
      
      // Create notification for admin
      const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
      notifications.unshift({
        id: 'notif_' + Date.now(),
        type: 'delivery_accepted',
        message: `${partnerName} has accepted order #${orderId.slice(-6)}`,
        orderId: orderId,
        timestamp: Date.now(),
        read: false
      });
      localStorage.setItem('adminNotifications', JSON.stringify(notifications));
      
      // Show success message
      alert(`Order accepted successfully!`);
      
    } catch (error) {
      console.error("Error accepting order:", error);
      alert("Failed to accept order. Please try again.");
    }
  };
  
  const rejectOrder = (orderId) => {
    console.log(`Rejected order: ${orderId}`);
    setNewOrders(newOrders.filter(order => order.id !== orderId));
  };
  
  const updateOrderStatus = (status) => {
    if (!currentOrder) return;
    
    try {
      console.log(`Updating order ${currentOrder.id} to ${status}`);
      
      // Update order status in local state
      const updatedOrder = { ...currentOrder, status };
      setCurrentOrder(updatedOrder);
      localStorage.setItem('currentDeliveryOrder', JSON.stringify(updatedOrder));
      
      // Update admin and user orders in localStorage
      const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      const userOrders = JSON.parse(localStorage.getItem('foodAppOrders') || '[]');
      
      let adminStatus, orderStatus;
      
      if (status === 'picked_up') {
        adminStatus = 'delivering';
        orderStatus = 'out-for-delivery';
      } 
      else if (status === 'delivered') {
        adminStatus = 'completed';
        orderStatus = 'delivered';
      }
      
      if (adminStatus && orderStatus) {
        // Update admin orders
        const updatedAdminOrders = adminOrders.map(order => {
          if (order._id === currentOrder.id) {
            const now = Date.now();
            const timeString = new Date(now).toLocaleTimeString([], {
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true
            });
            
            // Create updated order with status history
            const statusHistory = order.statusHistory || [];
            return {
              ...order,
              adminStatus,
              status: orderStatus,
              deliveryStatus: status,
              statusHistory: [
                ...statusHistory,
                { status: orderStatus, time: timeString, timestamp: now }
              ]
            };
          }
          return order;
        });
        
        localStorage.setItem('adminOrders', JSON.stringify(updatedAdminOrders));
        
        // Update user orders
        const updatedUserOrders = userOrders.map(order => {
          if (order._id === currentOrder.id) {
            const now = Date.now();
            const timeString = new Date(now).toLocaleTimeString([], {
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true
            });
            
            // Create updated order with status history
            const statusHistory = order.statusHistory || [];
            return {
              ...order,
              status: orderStatus,
              deliveryStatus: status,
              statusHistory: [
                ...statusHistory,
                { status: orderStatus, time: timeString, timestamp: now }
              ]
            };
          }
          return order;
        });
        
        localStorage.setItem('foodAppOrders', JSON.stringify(updatedUserOrders));
        
        // Create notification for admin
        const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        notifications.unshift({
          id: 'notif_' + Date.now(),
          type: 'delivery_status',
          message: `${partnerName} has ${status === 'picked_up' ? 'picked up' : 'delivered'} order #${currentOrder.id.slice(-6)}`,
          orderId: currentOrder.id,
          timestamp: Date.now(),
          read: false
        });
        localStorage.setItem('adminNotifications', JSON.stringify(notifications));
      }
      
      // If delivered, update earnings and clear current order
      if (status === 'delivered') {
        handleOrderCompleted();
      }
    } catch (error) {
      console.error(`Error updating order status to ${status}:`, error);
      alert(`Failed to update order status. Please try again.`);
    }
  };

  const handleOrderCompleted = () => {
    try {
      // Get current values from localStorage first, defaulting to 0 if not present
      const currentEarnings = parseFloat(localStorage.getItem('todayEarnings') || '0');
      const currentOrderCount = parseInt(localStorage.getItem('todayOrders') || '0');
      
      // Calculate new values
      const newEarnings = currentEarnings + (currentOrder.deliveryFee || 0);
      const newOrderCount = currentOrderCount + 1;
      
      // Update state
      setTodayEarnings(newEarnings);
      setTodayOrders(newOrderCount);
      
      // Update localStorage
      localStorage.setItem('todayEarnings', newEarnings.toString());
      localStorage.setItem('todayOrders', newOrderCount.toString());
      
      // Create a history record
      const earningsHistory = JSON.parse(localStorage.getItem('deliveryEarningsHistory') || '[]');
      earningsHistory.push({
        id: 'earn_' + Date.now(),
        orderId: currentOrder.id,
        amount: currentOrder.deliveryFee || 0,
        timestamp: Date.now()
      });
      localStorage.setItem('deliveryEarningsHistory', JSON.stringify(earningsHistory));
      
      // Clear current order after delay
      setTimeout(() => {
        setCurrentOrder(null);
        localStorage.removeItem('currentDeliveryOrder');
        
        // Show success alert
        alert("Order delivered successfully! Earnings updated.");
      }, 2000);
    } catch (error) {
      console.error("Error updating earnings:", error);
    }
  };

  const fetchAvailableOrders = () => {
    if (!isOnline) return;
    
    try {
      console.log("Fetching available orders for delivery...");
      
      // Get orders from localStorage
      const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      console.log("All admin orders found:", adminOrders.length);
      
      // Log every order's readiness status for debugging
      adminOrders.forEach(order => {
        console.log(`Order ${order._id}:`, {
          status: order.status,
          adminStatus: order.adminStatus,
          isReadyForDelivery: order.isReadyForDelivery,
          hasDeliveryPartner: !!order.deliveryPartnerId
        });
      });
      
      // Filter orders that are ready for pickup
      const available = adminOrders.filter(order => {
        const isEligible = 
          order.status === 'preparing' && 
          order.isReadyForDelivery === true &&
          !order.deliveryPartnerId;
          
        console.log(`Order ${order._id} eligible for delivery: ${isEligible}`);
        return isEligible;
      });
      
      console.log(`Found ${available.length} orders available for delivery`);
      
      // Map to display format
      const displayOrders = available.map(order => ({
        id: order._id,
        restaurant: {
          name: order.restaurantName || 'Restaurant',
          address: order.restaurantAddress || formatAddress(order.address) || 'Restaurant Address',
          distance: calculateDistance() // Random distance for demo
        },
        customer: {
          name: order.customer?.name || 'Customer',
          address: formatAddress(order.address) || 'Customer Address',
          distance: calculateDistance() // Random distance for demo
        },
        amount: order.total || 0,
        deliveryFee: order.deliveryFee || 40
      }));
      
      setNewOrders(displayOrders);
    } catch (error) {
      console.error("Error fetching available orders:", error);
      setNewOrders([]);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Address unavailable';
    
    if (typeof address === 'string') return address;
    
    if (address.street) {
      return `${address.street}, ${address.city}`;
    }
    
    return 'Address unavailable';
  };

  const calculateDistance = () => {
    // Random distance for demo purposes
    return ((Math.random() * 4) + 0.5).toFixed(1) + ' km';
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