import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaList, FaUsers, FaSignOutAlt, FaTrash, FaPlus, FaEdit, FaArrowLeft, FaStore, FaCheckCircle, FaMotorcycle, FaHome, FaSearch, FaCheck, FaTimes, FaHourglassHalf, FaUserEdit,FaBoxOpen ,FaWarehouse,FaSync} from 'react-icons/fa';
import { categories } from '../constants/categories';
import './AdminDashboard.css';
import { addMenuItem, updateMenuItem, deleteMenuItem } from '../services/api';

const AdminDashboard = ({ handleLogout }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('users'); // Add 'orders' as option
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    cuisine: '',
    category: '',
    address: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    isVeg: false
  });

  const [viewSelectedRestaurant, setViewSelectedRestaurant] = useState(null);
  const [addMenuSelectedRestaurant, setAddMenuSelectedRestaurant] = useState(null);
  const [manageMenuSelectedRestaurant, setManageMenuSelectedRestaurant] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [menuFilter, setMenuFilter] = useState('All');

  const cuisineTypes = [
    'Italian',
    'Indian',
    'Chinese',
    'Mexican',
    'Japanese',
    'Thai'
  ];

  const [editingItem, setEditingItem] = useState(null);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // Add 'users' as another option
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeOrderTab, setActiveOrderTab] = useState('pending');
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');


  // Add these state variables after your existing state declarations
const [stockItems, setStockItems] = useState([]);
const [stockHistory, setStockHistory] = useState([]);
const [stockManagementRestaurant, setStockManagementRestaurant] = useState(null);
const [selectedMenuItem, setSelectedMenuItem] = useState(null);
const [stockQuantity, setStockQuantity] = useState(0);
const [stockNote, setStockNote] = useState('');
const [stockFilter, setStockFilter] = useState('all');
const [stockDashboard, setStockDashboard] = useState({
  outOfStockCount: 0,
  lowStockCount: 0,
  healthyStockCount: 0,
  totalItems: 0
});
const [stockDashboardLoading, setStockDashboardLoading] = useState(false);
  useEffect(() => {
    fetchRestaurants();
    loadUsers(); // Use loadUsers instead of fetchUsers
  }, []);
 
  useEffect(() => {
    // Reset all selected restaurant states when changing sections
    setViewSelectedRestaurant(null);
    setAddMenuSelectedRestaurant(null);
    setManageMenuSelectedRestaurant(null);
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'orders') {
      fetchOrders();
    }
  }, [activeSection]);

  useEffect(() => {
    loadOrders();
    
    // Set up interval to refresh orders every 30 seconds
    const intervalId = setInterval(loadOrders, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Filter orders when tab or search term changes
  useEffect(() => {
    filterOrders();
  }, [orders, activeOrderTab, searchTerm]);

  // Modify your existing useEffect to load users when the tab changes
  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

// Add this useEffect hook with your other hooks
useEffect(() => {
  if (activeSection === 'stockManagement' && !stockManagementRestaurant) {
    fetchStockDashboard();
  }
}, [activeSection, stockManagementRestaurant]);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate all required fields
      if (!newRestaurant.name || !newRestaurant.cuisine || 
          !newRestaurant.category || !newRestaurant.address || 
          !newRestaurant.image) {
        throw new Error('All fields are required');
      }

      console.log('Sending restaurant data:', newRestaurant);
      
      const response = await axios.post(
        'http://localhost:5000/api/restaurants', 
        newRestaurant,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Server response:', response.data);
      
      setNewRestaurant({
        name: '',
        cuisine: '',
        category: '',
        address: '',
        image: ''
      });
      
      await fetchRestaurants();
      alert('Restaurant added successfully!');
    } catch (error) {
      console.error('Error adding restaurant:', error);
      alert(`Failed to add restaurant: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await axios.delete(`http://localhost:5000/api/restaurants/${id}`);
        fetchRestaurants(); // Refresh the list
        alert('Restaurant deleted successfully');
      } catch (error) {
        console.error('Error deleting restaurant:', error);
        alert('Failed to delete restaurant');
      }
    }
  };

  const fetchMenuItems = async (restaurantId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/menu-items/restaurant/${restaurantId}`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleAddMenuItem = async (restaurantId) => {
    try {
      const newItem = {
        ...menuForm,
        restaurantId: restaurantId
      };
  
      const response = await axios.post('http://localhost:5000/api/menu-items', newItem);
      
      setMenuItems([...menuItems, response.data]);
      setMenuForm({
        name: '',
        description: '',
        price: '',
        image: '',
        category: '',
        isVeg: false
      });
      
      alert('Menu item added successfully!');
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert(error.response?.data?.message || 'Failed to add menu item');
    }
  };

  const handleUpdateMenuItem = async (e) => {
    e.preventDefault();
    try {
      const updatedItem = await updateMenuItem(editingItem._id, menuForm);
      setMenuItems(menuItems.map(item => 
        item._id === editingItem._id ? updatedItem : item
      ));
      setEditingItem(null);
      setMenuForm({
        name: '',
        description: '',
        price: '',
        image: '',
        category: '',
        isVeg: false
      });
      alert('Menu item updated successfully!');
    } catch (error) {
      console.error('Error updating menu item:', error);
      alert('Failed to update menu item');
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteMenuItem(itemId);
        setMenuItems(menuItems.filter(item => item._id !== itemId));
        alert('Menu item deleted successfully!');
      } catch (error) {
        console.error('Error deleting menu item:', error);
        alert('Failed to delete menu item');
      }
    }
  };

  const onLogoutClick = () => {
    // Call the handleLogout function passed from App.js
    handleLogout();
    // No need for additional navigation code here since handleLogout handles it
  };

  const getFilteredRestaurants = () => {
    if (activeFilter === 'All') return restaurants;
    return restaurants.filter(restaurant => restaurant.category === activeFilter);
  };

  const getFilteredMenuItems = () => {
    if (menuFilter === 'All') return menuItems;
    if (menuFilter === 'Veg') return menuItems.filter(item => item.isVeg);
    return menuItems.filter(item => item.category === menuFilter);
  };

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    fetchMenuItems(restaurant._id);
  };

  const categoryOptions = ['Starters', 'Main Course', 'Desserts', 'Beverages', 'Specials'];

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      // For demo, get from localStorage 
      const savedOrders = localStorage.getItem('foodAppOrders');
      let allOrders = [];
      
      if (savedOrders) {
        allOrders = JSON.parse(savedOrders);
      } else {
        // Mock data if no orders exist
        allOrders = [
          {
            _id: 'ORD123456',
            restaurantName: 'Spice Garden',
            restaurantId: 'rest123',
            customerName: 'Rahul Sharma',
            customerPhone: '9876543210',
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
            address: {
              street: '123 Main Street',
              city: 'New Delhi',
              state: 'Delhi',
              zipCode: '110001'
            },
            paymentMethod: 'Cash on Delivery'
          }
        ];
        localStorage.setItem('foodAppOrders', JSON.stringify(allOrders));
      }
      
      setOrders(allOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    // Get the current orders from localStorage
    const allOrders = JSON.parse(localStorage.getItem('foodAppOrders') || '[]');
    
    // Find the order to update
    const updatedOrders = allOrders.map(order => {
      if (order._id === orderId) {
        // For delivered status, add delivery completion time
        const statusHistory = [
          ...order.statusHistory || [],
          { 
            status: newStatus, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
          }
        ];
        
        // Special handling for delivered status
        let updatedOrder = {
          ...order,
          status: newStatus,
          statusHistory
        };
        
        // If order is delivered, mark delivery time
        if (newStatus === 'delivered') {
          updatedOrder.deliveryTime = Date.now();
          
          // You might want to calculate delivery metrics
          const orderTime = new Date(order.orderTime);
          const deliveryTime = new Date();
          const deliveryDuration = (deliveryTime - orderTime) / (1000 * 60); // in minutes
          
          updatedOrder.metrics = {
            ...order.metrics || {},
            deliveryDuration,
            deliveredOn: deliveryTime.toISOString()
          };
        }
        
        return updatedOrder;
      }
      return order;
    });
    
    // Save the updated orders back to localStorage
    localStorage.setItem('foodAppOrders', JSON.stringify(updatedOrders));
    
    // Update the orders in state
    setOrders(updatedOrders);
    
    // Show success message
    setMessage(`Order #${orderId} status updated to ${getStatusDisplayName(newStatus)}`);
    setShowMessage(true);
    
    // Hide message after a few seconds
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };
  
  // Helper function to get display name for status
  const getStatusDisplayName = (status) => {
    switch(status) {
      case 'order-received': return 'Order Received';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'out-for-delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'order-received': return 'Order Received';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'out-for-delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'order-received': return <FaStore />;
      case 'confirmed': return <FaCheckCircle />;
      case 'preparing': return <FaUtensils />;
      case 'out-for-delivery': return <FaMotorcycle />;
      case 'delivered': return <FaHome />;
      default: return <FaStore />;
    }
  };

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'order-received':
        return [{ status: 'confirmed', label: 'Confirm Order' }];
      case 'confirmed':
        return [{ status: 'preparing', label: 'Start Preparation' }];
      case 'preparing':
        return [{ status: 'out-for-delivery', label: 'Send for Delivery' }];
      case 'out-for-delivery':
        return [{ status: 'delivered', label: 'Mark as Delivered' }];
      default:
        return [];
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayedOrders = orders.filter(order => {
    // Filter by tab - improved filtering logic
    switch (activeTab) {
      case 'new':
        // Show only new/pending orders
        return order.status === 'order-received' || order.adminStatus === 'pending';
        
      case 'processing':
        // Show orders that are accepted or being prepared
        return (order.status === 'accepted' || order.status === 'preparing') && 
               order.adminStatus !== 'rejected';
        
      case 'delivery':
        // Show orders that are out for delivery
        return order.status === 'out-for-delivery';
        
      case 'completed':
        // Show delivered orders
        return order.status === 'delivered';
        
      case 'cancelled':
        // Show cancelled/rejected orders
        return order.status === 'cancelled' || order.adminStatus === 'rejected';
        
      default:
        return true;
    }
  }).filter(order => {
    // Your existing search filter
    if (searchTerm.trim() === '') return true;
    // Rest of search filter logic...
  });

  const countByStatus = {
    new: orders.filter(order => order.status === 'order-received').length,
    processing: orders.filter(order => order.status === 'confirmed' || order.status === 'preparing').length,
    delivery: orders.filter(order => order.status === 'out-for-delivery').length,
    completed: orders.filter(order => order.status === 'delivered').length,
    all: orders.length
  };

  const loadOrders = () => {
    // Get orders from localStorage
    const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    setOrders(adminOrders);
    setIsOrdersLoading(false);
  };
  
  const filterOrders = () => {
    let filtered = [...orders];
    
    // Filter by tab
    switch(activeOrderTab) {
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
  const updateAdminOrderStatus = (orderId, newAdminStatus, newStatus) => {
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
          // Initialize statusHistory array if it doesn't exist
          const statusHistory = order.statusHistory || [];
          updatedOrder.statusHistory = [
            ...statusHistory,
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
    
    // Show success notification
    setNotification(`Order #${orderId.slice(-6)} ${newStatus.replace(/-/g, ' ')}`);
    setTimeout(() => setNotification(''), 3000);
  };

  // Define handler functions for each status change
  const handleAcceptOrder = (orderId) => {
    updateAdminOrderStatus(orderId, 'accepted', 'accepted');
  };

  const handleRejectOrder = (orderId) => {
    updateAdminOrderStatus(orderId, 'rejected', 'cancelled');
  };

  const handleStartPreparing = (orderId) => {
    updateAdminOrderStatus(orderId, 'preparing', 'preparing');
  };

  const handleOutForDelivery = (orderId) => {
    updateAdminOrderStatus(orderId, 'delivering', 'out-for-delivery');
  };

  const handleDelivered = (orderId) => {
    updateAdminOrderStatus(orderId, 'completed', 'delivered');
  };
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  // Add these variables to calculate counts for badges
  const newOrdersCount = orders.filter(order => 
    order.status === 'order-received' || order.adminStatus === 'pending'
  ).length;

  const processingOrdersCount = orders.filter(order => 
    (order.status === 'accepted' || order.status === 'preparing') && 
    order.adminStatus !== 'rejected'
  ).length;

  const deliveryOrdersCount = orders.filter(order => 
    order.status === 'out-for-delivery'
  ).length;

  // Replace your current loadUsers function with this enhanced version
  const loadUsers = () => {
    setIsUsersLoading(true);
    try {
      // Try multiple sources to collect all users
      let allUsers = [];
      
      // 1. Check the primary 'users' key
      const usersFromStorage = JSON.parse(localStorage.getItem('users') || '[]');
      if (usersFromStorage.length > 0) {
        allUsers = [...usersFromStorage];
      }
      
      // 2. Check for 'registeredUsers' if you use that key anywhere
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      if (registeredUsers.length > 0) {
        registeredUsers.forEach(user => {
          if (!allUsers.some(u => (u.id === user.id) || (u.email === user.email))) {
            allUsers.push(user);
          }
        });
      }
      
      // 3. Check for individual users in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('user_') || key === 'currentUser')) {
          try {
            const userData = JSON.parse(localStorage.getItem(key));
            if (userData && userData.email && 
                !allUsers.some(u => (u.id === userData.id) || (u.email === userData.email))) {
              allUsers.push(userData);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
      
      // 4. Look for any user data in userAccounts key (sometimes used for authentication)
      const userAccounts = JSON.parse(localStorage.getItem('userAccounts') || '[]');
      if (userAccounts.length > 0) {
        userAccounts.forEach(user => {
          if (!allUsers.some(u => (u.id === user.id) || (u.email === user.email))) {
            allUsers.push(user);
          }
        });
      }
      
      // 5. Check if there's a record of past logins or auth data
      const authData = localStorage.getItem('authData');
      if (authData) {
        try {
          const parsedAuthData = JSON.parse(authData);
          if (parsedAuthData.user && !allUsers.some(u => u.email === parsedAuthData.user.email)) {
            allUsers.push(parsedAuthData.user);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
      
      // Save the consolidated user list back to localStorage
      if (allUsers.length > 0) {
        localStorage.setItem('users', JSON.stringify(allUsers));
      }
      
      // Update state with all found users
      setUsers(allUsers);
      
    } catch (error) {
      console.error('Error loading users:', error);
    }
    
    setIsUsersLoading(false);
  };

  // Add a function to delete a user
  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // Remove from state
        const updatedUsers = users.filter(user => (user.id || user._id) !== userId);
        setUsers(updatedUsers);
        
        // Update in localStorage
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Show success message
        setMessage('User deleted successfully');
        setShowMessage(true);
        
        setTimeout(() => {
          setShowMessage(false);
        }, 3000);
      } catch (error) {
        console.error('Error deleting user:', error);
        setMessage('Error deleting user');
        setShowMessage(true);
        
        setTimeout(() => {
          setShowMessage(false);
        }, 3000);
      }
    }
  };

  // Add these functions before the return statement
const fetchStockDashboard = async () => {
  try {
    setStockDashboardLoading(true);
    // Calculate from existing menu items
    const allItems = [];
    
    // Get items for all restaurants
    for (const restaurant of restaurants) {
      try {
        const response = await axios.get(`http://localhost:5000/api/menu-items/restaurant/${restaurant._id}`);
        if (Array.isArray(response.data)) {
          allItems.push(...response.data);
        }
      } catch (err) {
        console.log(`Couldn't load items for ${restaurant.name}`);
      }
    }
    
    // Calculate statistics
    const outOfStock = allItems.filter(item => item.stockQuantity === 0).length;
    const lowStock = allItems.filter(item => 
      item.stockQuantity > 0 && 
      item.stockQuantity <= (item.lowStockThreshold || 5)
    ).length;
    const healthy = allItems.filter(item => 
      item.stockQuantity > (item.lowStockThreshold || 5)
    ).length;
    
    setStockDashboard({
      outOfStockCount: outOfStock,
      lowStockCount: lowStock,
      healthyStockCount: healthy,
      totalItems: allItems.length
    });
  } catch (error) {
    console.error("Failed to calculate stock dashboard:", error);
    // Set default values on error
    setStockDashboard({
      outOfStockCount: 0,
      lowStockCount: 0,
      healthyStockCount: 0,
      totalItems: 0
    });
  } finally {
    setStockDashboardLoading(false);
  }
};

const fetchStockItems = async (restaurantId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/menu-items/restaurant/${restaurantId}`);
    if (Array.isArray(response.data)) {
      setStockItems(response.data);
    } else {
      setStockItems([]);
    }
  } catch (error) {
    console.error("Error fetching stock items:", error);
    setStockItems([]);
    alert('Failed to load stock information. Please try again.');
  }
};

const fetchStockHistory = async (itemId) => {
  try {
    // If you have a stock history API endpoint, use it here
    // For now, we'll just set an empty array
    setStockHistory([]);
  } catch (error) {
    console.error("Error fetching stock history:", error);
    setStockHistory([]);
  }
};

const updateStockQuantity = async (itemId) => {
  try {
    const token = localStorage.getItem('authToken');
    
    // Update the stock quantity
    await axios.put(
      `http://localhost:5000/api/stock/item/${itemId}`,
      { 
        newQuantity: stockQuantity,
        notes: stockNote 
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Update local state
    setStockItems(stockItems.map(item => {
      if (item._id === itemId) {
        return {
          ...item,
          stockQuantity: stockQuantity,
          isAvailable: stockQuantity > 0
        };
      }
      return item;
    }));
    
    // Reset form
    setStockNote('');
    setSelectedMenuItem(null);
    
    // Success message
    alert('Stock updated successfully!');
    
    // Update dashboard data
    fetchStockDashboard();
  } catch (error) {
    console.error("Error updating stock:", error);
    alert(`Failed to update stock: ${error.response?.data?.message || error.message}`);
  }
};

const getFilteredStockItems = () => {
  if (stockFilter === 'all') return stockItems;
  if (stockFilter === 'outOfStock') return stockItems.filter(item => item.stockQuantity === 0);
  if (stockFilter === 'lowStock') return stockItems.filter(item => 
    item.stockQuantity > 0 && item.stockQuantity <= (item.lowStockThreshold || 5)
  );
  if (stockFilter === 'healthy') return stockItems.filter(item => 
    item.stockQuantity > (item.lowStockThreshold || 5)
  );
  return stockItems;
};

const handleStockManagementRestaurantSelect = (restaurant) => {
  setStockManagementRestaurant(restaurant);
  fetchStockItems(restaurant._id);
};

const handleBackToStockDashboard = () => {
  setStockManagementRestaurant(null);
  setSelectedMenuItem(null);
  fetchStockDashboard(); // Refresh dashboard data
};

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h1>Admin Panel</h1>
        <div className="admin-nav">
          <button 
            className={`nav-btn ${activeSection === 'add' ? 'active' : ''}`}
            onClick={() => setActiveSection('add')}
          >
            <FaUtensils /> Add Restaurant
          </button>
          <button 
            className={`nav-btn ${activeSection === 'view' ? 'active' : ''}`}
            onClick={() => setActiveSection('view')}
          >
            <FaList /> View Restaurants
          </button>
          <button 
            className={`nav-btn ${activeSection === 'addMenu' ? 'active' : ''}`}
            onClick={() => setActiveSection('addMenu')}
          >
            <FaPlus /> Add Menu
          </button>
          <button 
            className={`nav-btn ${activeSection === 'manageMenu' ? 'active' : ''}`}
            onClick={() => setActiveSection('manageMenu')}
          >
            <FaUtensils /> Manage Menu
          </button>
          <button 
            className={`nav-btn ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <FaUsers /> Users
          </button>
          <button 
            className={`nav-btn ${activeSection === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveSection('orders')}
          >
            <FaList /> Orders
          </button>
          <button 
            className={`nav-btn ${activeSection === 'stockManagement' ? 'active' : ''}`}
            onClick={() => setActiveSection('stockManagement')}
          >
            <FaBoxOpen /> Stock Management
          </button>
          <button 
            className="nav-btn logout-btn"
            onClick={onLogoutClick}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="admin-main">
        {activeSection === 'add' && (
          <section className="add-restaurant">
            <h2>Add New Restaurant</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-field">
                <input
                  type="text"
                  placeholder="Restaurant Name"
                  value={newRestaurant.name}
                  onChange={(e) => setNewRestaurant({...newRestaurant, name: e.target.value})}
                  required
                />
              </div>

              <div className="input-field">
                <select
                  value={newRestaurant.cuisine}
                  onChange={(e) => setNewRestaurant({...newRestaurant, cuisine: e.target.value})}
                  required
                >
                  <option value="">Select Cuisine Type</option>
                  {cuisineTypes.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>

              <div className="input-field">
                <select
                  value={newRestaurant.category}
                  onChange={(e) => setNewRestaurant({...newRestaurant, category: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-field">
                <input
                  type="text"
                  placeholder="Address"
                  value={newRestaurant.address}
                  onChange={(e) => setNewRestaurant({...newRestaurant, address: e.target.value})}
                  required
                />
              </div>

              <div className="input-field">
                <input
                  type="url"
                  placeholder="Image URL"
                  value={newRestaurant.image}
                  onChange={(e) => setNewRestaurant({...newRestaurant, image: e.target.value})}
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Adding...' : 'Add Restaurant'}
              </button>
            </form>
          </section>
        )}

        {activeSection === 'view' && (
          <section className="view-restaurants">
            <h2>All Restaurants</h2>
            <div className="restaurants-grid">
              {restaurants.map(restaurant => (
                <div key={restaurant._id} className="restaurant-card">
                  <div className="rest-container">
                    <div className="rest-image">
                      <img 
                        src={restaurant.image} 
                        alt={restaurant.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x200?text=Restaurant';
                        }}
                      />
                    </div>
                    <div className="rest-info">
                      <div className="info-content">
                        <div className="left-content">
                          <h3>{restaurant.name}</h3>
                          <p className="address">📍 {restaurant.address}</p>
                        </div>
                        <div className="right-content">
                          <p className="cuisine">🍽️ {restaurant.cuisine}</p>
                          <p className="category">🏷️ {restaurant.category}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(restaurant._id)}
                  >
                    <FaTrash /> Delete Restaurant
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'users' && (
          <section className="users-section">
            <h2>Registered Users</h2>
            <div className="users-count">
              Total Users: <span>{users.length}</span>
            </div>

            {isUsersLoading ? (
              <div className="loading-spinner">Loading users...</div>
            ) : users.length > 0 ? (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Password</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id || user._id}>
                        <td>{user.id || user._id}</td>
                        <td>{user.name || "N/A"}</td>
                        <td>{user.email}</td>
                        <td>{user.password}</td>
                        <td>
                          <button 
                            className="delete-user-btn"
                            onClick={() => handleDeleteUser(user.id || user._id)}
                          >
                            <FaTrash /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-users">No users found</div>
            )}
          </section>
        )}

        {activeSection === 'addMenu' && (
          <section className="menu-management">
            {!addMenuSelectedRestaurant ? (
              <div className="restaurant-select-grid">
                {restaurants.map(restaurant => (
                  <div 
                    key={restaurant._id} 
                    className="restaurant-card"
                    onClick={() => setAddMenuSelectedRestaurant(restaurant)}
                  >
                    <div className="rest-container">
                      <div className="rest-image">
                        <img 
                          src={restaurant.image} 
                          alt={restaurant.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x200?text=Restaurant';
                          }}
                        />
                      </div>
                      <div className="rest-info">
                        <div className="info-content">
                          <div className="left-content">
                            <h3>{restaurant.name}</h3>
                            <p className="address">📍 {restaurant.address}</p>
                          </div>
                          <div className="right-content">
                            <p className="cuisine">🍽️ {restaurant.cuisine}</p>
                            <p className="category">🏷️ {restaurant.category}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="menu-management">
                <div className="menu-form-container">
                  <div className="form-header">
                    <h3>Add New Menu Item</h3>
                    <button 
                      className="back-to-rest-btn"
                      onClick={() => setAddMenuSelectedRestaurant(null)}
                    >
                      <FaArrowLeft /> Back to Restaurants
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleAddMenuItem(addMenuSelectedRestaurant._id);
                  }}>
                    <div className="input-field">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={menuForm.name}
                        onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                        required
                      />
                    </div>

                    <div className="input-field">
                      <textarea
                        placeholder="Description"
                        value={menuForm.description}
                        onChange={(e) => setMenuForm({...menuForm, description: e.target.value})}
                        required
                      />
                    </div>

                    <div className="input-field">
                      <input
                        type="number"
                        placeholder="Price in ₹"
                        value={menuForm.price}
                        onChange={(e) => setMenuForm({...menuForm, price: e.target.value})}
                        required
                      />
                    </div>

                    <div className="input-field">
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={menuForm.image}
                        onChange={(e) => setMenuForm({...menuForm, image: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="input-field">
                      <select
                        value={menuForm.category}
                        onChange={(e) => setMenuForm({...menuForm, category: e.target.value})}
                        required
                      >
                        <option value="">Select Category</option>
                        {categoryOptions.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="input-field checkbox-field">
                      <label className="veg-label">
                        <input
                          type="checkbox"
                          checked={menuForm.isVeg}
                          onChange={(e) => setMenuForm({...menuForm, isVeg: e.target.checked})}
                        />
                        <span>Vegetarian</span>
                      </label>
                    </div>

                    <button type="submit" className="submit-btn">Add Menu Item</button>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {activeSection === 'manageMenu' && (
          <section className="menu-management">
            {!manageMenuSelectedRestaurant && (
              <div className="category-filters">
                <button 
                  className={`filter-btn ${activeFilter === 'All' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('All')}
                >
                  All Restaurants
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`filter-btn ${activeFilter === category.name ? 'active' : ''}`}
                    onClick={() => setActiveFilter(category.name)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
            {!manageMenuSelectedRestaurant ? (
              <div className="restaurant-select-grid">
                {getFilteredRestaurants().map(restaurant => (
                  <div 
                    key={restaurant._id} 
                    className="restaurant-card"
                    onClick={() => {
                      setManageMenuSelectedRestaurant(restaurant);
                      fetchMenuItems(restaurant._id);
                    }}
                  >
                    <div className="rest-container">
                      <div className="rest-image">
                        <img 
                          src={restaurant.image} 
                          alt={restaurant.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x200?text=Restaurant';
                          }}
                        />
                      </div>
                      <div className="rest-info">
                        <div className="info-content">
                          <div className="left-content">
                            <h3>{restaurant.name}</h3>
                            <p className="address">📍 {restaurant.address}</p>
                          </div>
                          <div className="right-content">
                            <p className="cuisine">🍽️ {restaurant.cuisine}</p>
                            <p className="category">🏷️ {restaurant.category}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="menu-items-container">
                <div className="header-title">
                  <h2>Menu Items for {manageMenuSelectedRestaurant.name}</h2>
                  <button 
                    className="back-to-rest-btn"
                    onClick={() => setManageMenuSelectedRestaurant(null)}
                  >
                    ← Back to Restaurants
                  </button>
                </div>
                <div className="menu-category-filters">
                  <button 
                    className={`menu-filter-btn ${menuFilter === 'All' ? 'active' : ''}`}
                    onClick={() => setMenuFilter('All')}
                  >
                    All Items
                  </button>
                  <button 
                    className={`menu-filter-btn ${menuFilter === 'Veg' ? 'active' : ''}`}
                    onClick={() => setMenuFilter('Veg')}
                  >
                    Vegetarian
                  </button>
                  <button 
                    className={`menu-filter-btn ${menuFilter === 'Starters' ? 'active' : ''}`}
                    onClick={() => setMenuFilter('Starters')}
                  >
                    Starters
                  </button>
                  <button 
                    className={`menu-filter-btn ${menuFilter === 'Main Course' ? 'active' : ''}`}
                    onClick={() => setMenuFilter('Main Course')}
                  >
                    Main Course
                  </button>
                  <button 
                    className={`menu-filter-btn ${menuFilter === 'Desserts' ? 'active' : ''}`}
                    onClick={() => setMenuFilter('Desserts')}
                  >
                    Desserts
                  </button>
                  <button 
                    className={`menu-filter-btn ${menuFilter === 'Beverages' ? 'active' : ''}`}
                    onClick={() => setMenuFilter('Beverages')}
                  >
                    Beverages
                  </button>
                </div>
                <div className="menu-grid">
                  {getFilteredMenuItems().map(item => (
                    <div key={item._id} className="menu-item-card">
                      <img src={item.image} alt={item.name} />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>{item.description}</p>
                        <p className="price">₹{item.price}</p>
                        <p className="category">{item.category}</p>
                        {item.isVeg && <span className="veg-badge">Veg</span>}
                      </div>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteMenuItem(item._id)}
                      >
                        <FaTrash /> Delete Item
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {activeSection === 'orders' && (
          <section className="orders-section">
            <h2>Order Management</h2>
            <div className="orders-header">
              <div className="order-tabs">
                <button 
                  className={`order-tab ${activeTab === 'new' ? 'active' : ''}`}
                  onClick={() => setActiveTab('new')}
                >
                  New Orders
                  {newOrdersCount > 0 && <span className="order-badge">{newOrdersCount}</span>}
                </button>
                
                <button 
                  className={`order-tab ${activeTab === 'processing' ? 'active' : ''}`}
                  onClick={() => setActiveTab('processing')}
                >
                  Processing
                  {processingOrdersCount > 0 && <span className="order-badge">{processingOrdersCount}</span>}
                </button>
                
                <button 
                  className={`order-tab ${activeTab === 'delivery' ? 'active' : ''}`}
                  onClick={() => setActiveTab('delivery')}
                >
                  Out for Delivery
                  {deliveryOrdersCount > 0 && <span className="order-badge">{deliveryOrdersCount}</span>}
                </button>
                
                <button 
                  className={`order-tab ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('completed')}
                >
                  Completed
                </button>
                
                <button 
                  className={`order-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setActiveTab('cancelled')}
                >
                  Cancelled
                </button>
              </div>
              <div className="search-bar">
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch />
              </div>
            </div>
            {loadingOrders ? (
              <div className="loading">Loading orders...</div>
            ) : (
              // Update your order card rendering to ensure customer details are displayed
              <div className="orders-list">
                {displayedOrders.map(order => (
                  <div 
                    key={order._id} 
                    className="order-card" 
                    data-status={order.status}
                  >
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
                      <strong>Restaurant:</strong> {order.restaurantName || "Restaurant"}
                    </div>
                    
                    <div className="order-customer">
                      <strong>Customer:</strong> {order.customer?.name || 'Anonymous'}
                      {order.customer?.phone && <div className="customer-phone">{order.customer.phone}</div>}
                    </div>
                    
                    <div className="order-items-preview">
                      <strong>Items:</strong> {order.items.length}
                      <span className="order-total">₹{order.total?.toFixed(2)}</span>
                    </div>
                    
                    <div className="order-actions">
                      {/* New orders - show Accept/Reject */}
                      {(order.status === 'order-received' || order.adminStatus === 'pending') && (
                        <>
                          <button className="action-btn accept" onClick={() => handleAcceptOrder(order._id)}>
                            <FaCheck /> Accept
                          </button>
                          <button className="action-btn reject" onClick={() => handleRejectOrder(order._id)}>
                            <FaTimes /> Reject
                          </button>
                        </>
                      )}
                      
                      {/* Accepted orders - show Start Preparing */}
                      {order.status === 'accepted' && (
                        <button className="action-btn prepare" onClick={() => handleStartPreparing(order._id)}>
                          <FaHourglassHalf /> Start Preparing
                        </button>
                      )}
                      
                      {/* Preparing orders - show Out for Delivery */}
                      {order.status === 'preparing' && (
                        <button className="action-btn deliver" onClick={() => handleOutForDelivery(order._id)}>
                          <FaMotorcycle /> Out for Delivery
                        </button>
                      )}
                      
                      {/* Out for delivery - show Mark as Delivered */}
                      {order.status === 'out-for-delivery' && (
                        <button className="action-btn complete" onClick={() => handleDelivered(order._id)}>
                          <FaCheck /> Mark as Delivered
                        </button>
                      )}
                      
                      {/* For delivered or cancelled orders, show status indicator */}
                      {(order.status === 'delivered' || order.status === 'cancelled') && (
                        <div className="order-status-indicator">
                          {order.status === 'delivered' ? 'Completed' : 'Cancelled'}
                        </div>
                      )}
                    </div>
                    <div className="order-status-actions">
                      <button 
                        className="status-btn received-btn" 
                        onClick={() => updateOrderStatus(order._id, 'order-received')}
                      >
                        Order Received
                      </button>
                      
                      <button 
                        className="status-btn confirmed-btn" 
                        onClick={() => updateOrderStatus(order._id, 'confirmed')}
                      >
                        Confirm
                      </button>
                      
                      <button 
                        className="status-btn preparing-btn" 
                        onClick={() => updateOrderStatus(order._id, 'preparing')}
                      >
                        Preparing
                      </button>
                      
                      <button 
                        className="status-btn out-for-delivery-btn" 
                        onClick={() => updateOrderStatus(order._id, 'out-for-delivery')}
                      >
                        Out for Delivery
                      </button>
                      
                      {/* Add the Delivered button */}
                      <button 
                        className="status-btn delivered-btn" 
                        onClick={() => updateOrderStatus(order._id, 'delivered')}
                      >
                        Delivered
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedOrder && (
              <div className="order-details-panel">
                <h3>Order Details</h3>
                <div className="order-info">
                  <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                  <p><strong>Restaurant:</strong> {selectedOrder.restaurantName}</p>
                  <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                  <p><strong>Address:</strong> {selectedOrder.address.street}, {selectedOrder.address.city}, {selectedOrder.address.state}, {selectedOrder.address.zipCode}</p>
                  <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                  <p><strong>Order Time:</strong> {formatDateTime(selectedOrder.orderTime)}</p>
                  <p><strong>Status:</strong> {getStatusText(selectedOrder.status)}</p>
                </div>
                <div className="order-items">
                  <h4>Items</h4>
                  <ul>
                    {selectedOrder.items.map((item, index) => (
                      <li key={index}>
                        {item.name} x {item.quantity} - ₹{item.price * item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-summary">
                  <p><strong>Subtotal:</strong> ₹{selectedOrder.subtotal}</p>
                  <p><strong>Delivery Fee:</strong> ₹{selectedOrder.deliveryFee}</p>
                  <p><strong>Tax:</strong> ₹{selectedOrder.tax}</p>
                  <p><strong>Total:</strong> ₹{selectedOrder.total}</p>
                </div>
                <div className="order-status-history">
                  <h4>Status History</h4>
                  <ul>
                    {selectedOrder.statusHistory.map((status, index) => (
                      <li key={index}>
                        {getStatusIcon(status.status)} {getStatusText(status.status)} - {status.time}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-actions">
                  <h4>Update Status</h4>
                  {getNextStatusOptions(selectedOrder.status).map(option => (
                    <button 
                      key={option.status} 
                      className="status-btn"
                      onClick={() => updateOrderStatus(selectedOrder._id, option.status)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {notification && (
              <div className="notification">
                {notification}
              </div>
            )}
          </section>
        )}

        {/* Add this section to your main content area, before the final closing div */}
{activeSection === 'stockManagement' && (
  <section className="stock-management-section">
    <h2>Stock Management</h2>
    {!stockManagementRestaurant ? (
      <>
        <div className="stock-dashboard-header">
          <h3>Stock Overview</h3>
          <button 
            className="refresh-btn"
            onClick={fetchStockDashboard}
            disabled={stockDashboardLoading}
          >
            <FaSync className={stockDashboardLoading ? 'spinning' : ''} /> 
            {stockDashboardLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        
        <div className="stock-dashboard">
          {stockDashboardLoading ? (
            <div className="loading-spinner">Loading stock data...</div>
          ) : (
            <>
              <div className="stock-stat-card">
                <div className="stock-stat-icon out">
                  <FaTimes />
                </div>
                <div className="stock-stat-details">
                  <h3>Out of Stock</h3>
                  <p className="stock-stat-value">{stockDashboard.outOfStockCount}</p>
                  <p className="stock-stat-desc">Items need attention</p>
                </div>
              </div>
              
              <div className="stock-stat-card">
                <div className="stock-stat-icon low">
                  <FaHourglassHalf />
                </div>
                <div className="stock-stat-details">
                  <h3>Low Stock</h3>
                  <p className="stock-stat-value">{stockDashboard.lowStockCount}</p>
                  <p className="stock-stat-desc">Items running low</p>
                </div>
              </div>
              
              <div className="stock-stat-card">
                <div className="stock-stat-icon healthy">
                  <FaCheck />
                </div>
                <div className="stock-stat-details">
                  <h3>Healthy Stock</h3>
                  <p className="stock-stat-value">{stockDashboard.healthyStockCount}</p>
                  <p className="stock-stat-desc">Items with good stock</p>
                </div>
              </div>
              
              <div className="stock-stat-card">
                <div className="stock-stat-icon total">
                  <FaWarehouse />
                </div>
                <div className="stock-stat-details">
                  <h3>Total Items</h3>
                  <p className="stock-stat-value">{stockDashboard.totalItems}</p>
                  <p className="stock-stat-desc">In inventory</p>
                </div>
              </div>
            </>
          )}
        </div>
        
        <h3>Select Restaurant to Manage Stock</h3>
        <div className="restaurant-select-grid">
          {restaurants.map(restaurant => (
            <div 
              key={restaurant._id} 
              className="restaurant-card"
              onClick={() => handleStockManagementRestaurantSelect(restaurant)}
            >
              <div className="rest-container">
                <div className="rest-image">
                  <img 
                    src={restaurant.image} 
                    alt={restaurant.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x200?text=Restaurant';
                    }}
                  />
                </div>
                <div className="rest-info">
                  <div className="info-content">
                    <div className="left-content">
                      <h3>{restaurant.name}</h3>
                      <p className="address">📍 {restaurant.address}</p>
                    </div>
                    <div className="right-content">
                      <p className="cuisine">🍽️ {restaurant.cuisine}</p>
                      <p className="category">🏷️ {restaurant.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    ) : (
      <div className="stock-management-container">
        <div className="stock-header">
          <h3>Manage Stock for {stockManagementRestaurant.name}</h3>
          <button 
            className="back-to-rest-btn"
            onClick={handleBackToStockDashboard}
          >
            <FaArrowLeft /> Back to Restaurants
          </button>
        </div>
        
        <div className="stock-filters">
          <button
            className={`filter-btn ${stockFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStockFilter('all')}
          >
            All Items
          </button>
          <button
            className={`filter-btn ${stockFilter === 'outOfStock' ? 'active' : ''}`}
            onClick={() => setStockFilter('outOfStock')}
          >
            Out of Stock
          </button>
          <button
            className={`filter-btn ${stockFilter === 'lowStock' ? 'active' : ''}`}
            onClick={() => setStockFilter('lowStock')}
          >
            Low Stock
          </button>
          <button
            className={`filter-btn ${stockFilter === 'healthy' ? 'active' : ''}`}
            onClick={() => setStockFilter('healthy')}
          >
            Healthy Stock
          </button>
        </div>
        
        <div className="stock-items-container">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredStockItems().map(item => (
                <tr key={item._id}>
                  <td>
                    <div className="item-info">
                      <img src={item.image} alt={item.name} className="item-thumbnail" />
                      <div>
                        <div className="item-name">{item.name}</div>
                        <div className="item-price">₹{item.price}</div>
                      </div>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.stockQuantity || 0}</td>
                  <td>
                    <span className={`stock-status ${
                      item.stockQuantity === 0 ? 'out-of-stock' :
                      item.stockQuantity <= (item.lowStockThreshold || 5) ? 'low-stock' :
                      'in-stock'
                    }`}>
                      {item.stockQuantity === 0 ? 'Out of Stock' :
                       item.stockQuantity <= (item.lowStockThreshold || 5) ? 'Low Stock' :
                       'In Stock'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="update-stock-btn"
                      onClick={() => {
                        setSelectedMenuItem(item);
                        setStockQuantity(item.stockQuantity || 0);
                      }}
                    >
                      Update Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {selectedMenuItem && (
          <div className="stock-update-modal">
            <div className="modal-content">
              <h3>Update Stock: {selectedMenuItem.name}</h3>
              <div className="form-group">
                <label>Current Stock: {selectedMenuItem.stockQuantity || 0}</label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Notes (optional):</label>
                <textarea
                  value={stockNote}
                  onChange={(e) => setStockNote(e.target.value)}
                  placeholder="Reason for stock update"
                ></textarea>
              </div>
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setSelectedMenuItem(null);
                    setStockNote('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="save-btn"
                  onClick={() => updateStockQuantity(selectedMenuItem._id)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
  </section>
)}
      </div>
    </div>
  );
};

export default AdminDashboard;