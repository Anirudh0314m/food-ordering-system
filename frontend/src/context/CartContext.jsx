import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Context
const CartContext = createContext();

// Provider Component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('foodAppCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        calculateTotal(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('foodAppCart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // Add item to cart
  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem._id === item._id);
      
      if (existingItem) {
        const updatedCart = prevCart.map(cartItem => 
          cartItem._id === item._id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
        calculateTotal(updatedCart);
        return updatedCart;
      } else {
        const updatedCart = [...prevCart, { ...item, quantity: 1 }];
        calculateTotal(updatedCart);
        return updatedCart;
      }
    });
  };

  // Decrease quantity or remove item from cart
  const decreaseQuantity = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem._id === item._id);
      
      if (existingItem && existingItem.quantity === 1) {
        const updatedCart = prevCart.filter(cartItem => cartItem._id !== item._id);
        calculateTotal(updatedCart);
        return updatedCart;
      } else if (existingItem) {
        const updatedCart = prevCart.map(cartItem => 
          cartItem._id === item._id 
            ? { ...cartItem, quantity: cartItem.quantity - 1 } 
            : cartItem
        );
        calculateTotal(updatedCart);
        return updatedCart;
      }
      
      return prevCart;
    });
  };

  // Update quantity for a specific item
  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => 
        item._id === itemId ? { ...item, quantity } : item
      );
      calculateTotal(updatedCart);
      return updatedCart;
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => item._id !== itemId);
      calculateTotal(updatedCart);
      return updatedCart;
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setCartTotal(0);
  };

  // Calculate total price
  const calculateTotal = (cartItems) => {
    const total = cartItems.reduce((sum, item) => 
      sum + (parseFloat(item.price) * item.quantity), 0
    );
    setCartTotal(total);
  };

  // Get total number of items in cart
  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartItems: cart, // Alias for backward compatibility
      cartTotal,
      addToCart,
      decreaseQuantity,
      updateQuantity,
      removeFromCart,
      clearCart,
      getCartItemCount // Add this method
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;