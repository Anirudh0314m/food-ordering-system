// src/context/CartContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [userId, setUserId] = useState(null);
  
  // Load user ID on mount
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUserId(user.id || localStorage.getItem('userId'));
    } else {
      const userId = localStorage.getItem('userId');
      if (userId) setUserId(userId);
    }
  }, []);
  
  // Load cart when user ID changes
  useEffect(() => {
    if (userId) {
      loadCart(userId);
    }
  }, [userId]);
  
  // Calculate cart total whenever cart changes
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCartTotal(total);
  }, [cart]);
  
  const loadCart = (userId) => {
    // Try to get user-specific cart first
    const carts = JSON.parse(localStorage.getItem('userCarts')) || {};
    
    if (carts[userId]) {
      setCart(carts[userId].items);
    } else {
      // Fallback to foodAppCart for backward compatibility
      const legacyCart = localStorage.getItem('foodAppCart');
      if (legacyCart) {
        try {
          const parsedCart = JSON.parse(legacyCart);
          setCart(parsedCart);
          // Migrate the legacy cart to user-specific cart
          saveCart(userId, parsedCart);
        } catch (error) {
          console.error('Error parsing cart data:', error);
          setCart([]);
        }
      }
    }
  };
  
  const saveCart = (userId, cartItems) => {
    if (!userId) return;
    
    const carts = JSON.parse(localStorage.getItem('userCarts')) || {};
    carts[userId] = {
      items: cartItems,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('userCarts', JSON.stringify(carts));
    
    // Also update foodAppCart for backward compatibility
    localStorage.setItem('foodAppCart', JSON.stringify(cartItems));
  };
  
  // Ensure the addToCart function correctly preserves restaurant info
  const addToCart = (item, restaurantInfo) => {
    if (!userId) return;
    
    // Add restaurant info if provided
    const itemWithRestaurant = {
      ...item,
      restaurantId: restaurantInfo?.id || item.restaurantId,
      restaurantName: restaurantInfo?.name || item.restaurantName
    };
    
    // Check if we're adding from a different restaurant
    if (cart.length > 0 && itemWithRestaurant.restaurantId && 
        cart[0].restaurantId && 
        cart[0].restaurantId !== itemWithRestaurant.restaurantId) {
      if (window.confirm("Your cart contains items from a different restaurant. Would you like to clear your cart and add this item?")) {
        const newCart = [{...itemWithRestaurant, quantity: 1}];
        setCart(newCart);
        saveCart(userId, newCart);
      }
      return;
    }
    
    // Check if item already exists
    const existingItem = cart.find(i => i._id === itemWithRestaurant._id);
    let updatedCart;
    
    if (existingItem) {
      // Update quantity
      updatedCart = cart.map(cartItem => {
        if (cartItem._id === itemWithRestaurant._id) {
          return { ...cartItem, quantity: cartItem.quantity + 1 };
        }
        return cartItem;
      });
    } else {
      // Add new item with quantity 1
      updatedCart = [...cart, { ...itemWithRestaurant, quantity: 1 }];
    }
    
    setCart(updatedCart);
    saveCart(userId, updatedCart);
  };
  
  const decreaseQuantity = (itemId) => {
    if (!userId) return;
    
    const existingItem = cart.find(item => item._id === itemId);
    
    if (!existingItem) return;
    
    let updatedCart;
    
    if (existingItem.quantity > 1) {
      updatedCart = cart.map(item => {
        if (item._id === itemId) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
    } else {
      updatedCart = cart.filter(item => item._id !== itemId);
    }
    
    setCart(updatedCart);
    saveCart(userId, updatedCart);
  };
  
  const removeFromCart = (itemId) => {
    if (!userId) return;
    
    const updatedCart = cart.filter(item => item._id !== itemId);
    setCart(updatedCart);
    saveCart(userId, updatedCart);
  };
  
  const clearCart = () => {
    if (!userId) return;
    
    setCart([]);
    saveCart(userId, []);
  };
  
  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };
  
  return (
    <CartContext.Provider value={{
      cart,
      cartTotal,
      addToCart,
      decreaseQuantity,
      removeFromCart,
      clearCart,
      getCartItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export default CartProvider;