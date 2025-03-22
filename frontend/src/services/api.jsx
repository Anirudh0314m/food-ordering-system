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
    // Get token with fallback
    let token = localStorage.getItem('authToken');
    if (!token) {
      token = localStorage.getItem('foodAppToken');
      if (token) {
        localStorage.setItem('authToken', token);
      }
    }
    
    if (!token) {
      console.log('No auth token found, skipping address fetch');
      return [];
    }
    
    console.log('Fetching addresses with token:', token.substring(0, 15) + '...');
    
    const response = await axios.get('http://localhost:5000/api/user/addresses', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Address fetch response:', response.data);
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error("API returned non-array response:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching addresses:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    return [];
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

// Update the createAddress function to include user ID

export const createAddress = async (addressData) => {
  try {
    // Get token with fallback
    let token = localStorage.getItem('authToken');
    if (!token) {
      token = localStorage.getItem('foodAppToken');
      if (token) {
        localStorage.setItem('authToken', token);
      }
    }
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Debug: Log all localStorage items
    console.log("--- DEBUG: ALL LOCALSTORAGE ITEMS ---");
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`${key}: ${localStorage.getItem(key)}`);
    }
    
    // Get the user ID from localStorage
    const userId = localStorage.getItem('userId');
    console.log("User ID from localStorage:", userId);
    
    if (!userId) {
      throw new Error('User ID not found');
    }
    
    // Add the user ID to the address data
    const completeAddressData = {
      ...addressData,
      user: userId  // This is the missing required field
    };
    
    console.log("FULL address data with user:", JSON.stringify(completeAddressData, null, 2));
    
    const response = await axios.post(
      `${API_URL}/user/addresses`, 
      completeAddressData,
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
    
    // Better error reporting
    if (error.response && error.response.data) {
      console.error("Server error details:", error.response.data);
    }
    
    throw error.response?.data?.message || error.message || "Failed to create address";
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
