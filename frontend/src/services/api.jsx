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
