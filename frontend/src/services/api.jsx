import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"; // Base URL

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Login failed";
  }
};

export const registerUser = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Registration failed";
  }
};

// Add menu related API calls
export const getMenuByRestaurant = async (restaurantId) => {
  try {
    const response = await axios.get(`${API_URL}/menu/${restaurantId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch menu items";
  }
};

export const addMenuItem = async (menuData) => {
  try {
    const response = await axios.post(`${API_URL}/menu-items`, menuData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to add menu item";
  }
};

export const updateMenuItem = async (menuItemId, menuData) => {
  try {
    const response = await axios.put(`${API_URL}/menu-items/${menuItemId}`, menuData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update menu item";
  }
};

export const deleteMenuItem = async (menuItemId) => {
  try {
    const response = await axios.delete(`${API_URL}/menu-items/${menuItemId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to delete menu item";
  }
};

// Add these new methods to your api.jsx file

// Get stock dashboard statistics
export const getStockDashboard = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_URL}/stock/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching stock dashboard:", error);
    throw error.response?.data?.message || "Failed to fetch stock dashboard";
  }
};

// Get stock items for a restaurant
export const getStockByRestaurant = async (restaurantId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_URL}/stock/restaurant/${restaurantId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching stock items:", error);
    throw error.response?.data?.message || "Failed to fetch stock items";
  }
};

// Update stock quantity
export const updateStockQuantity = async (itemId, newQuantity, notes) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(
      `${API_URL}/stock/item/${itemId}`, 
      { newQuantity, notes },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating stock:", error);
    throw error.response?.data?.message || "Failed to update stock";
  }
};

// Get stock history for an item
export const getStockHistory = async (itemId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_URL}/stock/history/${itemId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching stock history:", error);
    throw error.response?.data?.message || "Failed to fetch stock history";
  }
};

// Add these address-related API functions to your api.jsx file

// Get all addresses for the current user
export const getAllAddresses = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(`${API_URL}/user/addresses`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw error.response?.data?.message || "Failed to fetch addresses";
  }
};

// Get a specific address by ID
export const getAddressById = async (addressId) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(`${API_URL}/user/addresses/${addressId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching address:", error);
    throw error.response?.data?.message || "Failed to fetch address";
  }
};

// Create a new address
export const createAddress = async (addressData) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.post(
      `${API_URL}/user/addresses`, 
      addressData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating address:", error);
    throw error.response?.data?.message || "Failed to create address";
  }
};

// Update an existing address
export const updateAddress = async (addressId, addressData) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.put(
      `${API_URL}/user/addresses/${addressId}`, 
      addressData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating address:", error);
    throw error.response?.data?.message || "Failed to update address";
  }
};

// Delete an address
export const deleteAddress = async (addressId) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.delete(`${API_URL}/user/addresses/${addressId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error.response?.data?.message || "Failed to delete address";
  }
};

// Set an address as default
export const setDefaultAddress = async (addressId) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.patch(
      `${API_URL}/user/addresses/${addressId}/set-default`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error setting default address:", error);
    throw error.response?.data?.message || "Failed to set default address";
  }
};
