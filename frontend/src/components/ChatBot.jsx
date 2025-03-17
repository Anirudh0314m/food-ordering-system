import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUtensils } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useRestaurants } from '../context/RestaurantContext';
import { useCart } from '../context/CartContext';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "👋 Hi! I can help you find restaurants, order food, and more!", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Use the context directly instead of making separate API calls
  const { restaurants, menuItems, categories } = useRestaurants();
  const { cart, addToCart } = useCart();
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  
  // Check if data is loaded
  const isDataLoaded = () => {
    return restaurants && restaurants.length > 0;
  };
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Helper to add bot messages
  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { text, sender: 'bot' }]);
  };
  
  // Log data for debugging
  useEffect(() => {
    console.log('ChatBot - Restaurants from context:', restaurants);
    console.log('ChatBot - Categories from context:', categories);
    console.log('ChatBot - Menu items from context:', menuItems);
  }, [restaurants, categories, menuItems]);
  
  // Add this effect to show loading status to the user
  useEffect(() => {
    if (!isDataLoaded() && messages.length === 1) {
      setTimeout(() => {
        addBotMessage("I'm connecting to our restaurant database. You can already ask me questions!");
      }, 1000);
    }
  }, [restaurants]);
  
  // Find restaurant by name or category
  const findRestaurantsByCategory = (categoryName) => {
    if (!categories || !restaurants) return [];
    
    // Find the category by name
    const category = categories.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    
    if (!category) return [];
    
    // Filter restaurants by category ID
    return restaurants.filter(restaurant => 
      restaurant.categoryIds && restaurant.categoryIds.includes(category._id)
    );
  };
  
  // Find restaurant by name
  const findRestaurant = (name) => {
    if (!restaurants) return null;
    
    const nameLower = name.toLowerCase();
    return restaurants.find(restaurant => 
      restaurant.name.toLowerCase().includes(nameLower)
    );
  };
  
  // Find menu item by name and restaurant
  const findMenuItem = (itemName, restaurantId) => {
    if (!menuItems) return null;
    
    const nameLower = itemName.toLowerCase();
    return menuItems.find(item => 
      item.restaurantId === restaurantId && 
      item.name.toLowerCase().includes(nameLower)
    );
  };
  
  // Get restaurant recommendations with better fallback
  const getRestaurantRecommendations = (category = '') => {
    if (!isDataLoaded()) {
      // Provide something useful even when data isn't loaded
      if (category && category.toLowerCase() === 'pizza') {
        return "While I'm still loading data, I can tell you that pizza restaurants like Domino's Pizza and Pizza Hut are popular choices. Would you like me to refresh the restaurant list?";
      }
      return "I'm still loading restaurant information. Please try again in a moment, or ask me about specific cuisines like 'pizza' or 'burgers'.";
    }
    
    let filteredRestaurants = restaurants;
    
    // If category is specified, filter by category
    if (category) {
      // Try to match with our category system first
      filteredRestaurants = findRestaurantsByCategory(category);
      
      // If no restaurants found by category, try matching by cuisine
      if (filteredRestaurants.length === 0) {
        filteredRestaurants = restaurants.filter(restaurant => 
          restaurant.cuisine && restaurant.cuisine.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      if (filteredRestaurants.length === 0) {
        return `Sorry, we don't have any ${category} restaurants right now.`;
      }
    }
    
    // Sort by rating and get top restaurants
    const topRestaurants = filteredRestaurants
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
    
    const restaurantList = topRestaurants
      .map((r, i) => `${i+1}. ${r.name} (${r.rating}⭐)`)
      .join('\n');
    
    const message = category
      ? `Here are our top ${category} restaurants:\n${restaurantList}\n\nWould you like to see the menu of any of these?`
      : `Here are our top rated restaurants:\n${restaurantList}\n\nWould you like to browse any specific cuisine?`;
    
    return message;
  };
  
  // Get available categories
  const getAvailableCategories = () => {
    if (!categories || categories.length === 0) {
      return "I'm still loading category information. Please try again in a moment.";
    }
    
    const categoryList = categories
      .map(cat => cat.name)
      .join(', ');
    
    return `We have restaurants in these categories: ${categoryList}. Which would you like to explore?`;
  };
  
  // Handle menu requests
  const handleMenuRequest = (restaurantName) => {
    const restaurant = findRestaurant(restaurantName);
    
    if (!restaurant) {
      return `Sorry, I couldn't find a restaurant called "${restaurantName}". Would you like to see our top restaurants?`;
    }
    
    // Filter menu items by restaurant
    const restaurantMenuItems = menuItems
      ? menuItems.filter(item => item.restaurantId === restaurant._id).slice(0, 5)
      : [];
    
    if (restaurantMenuItems.length === 0) {
      // Offer to navigate to restaurant page
      return `${restaurant.name} is in our system, but I don't have their menu items loaded. Would you like to visit their page to see the full menu?`;
    }
    
    const menuList = restaurantMenuItems
      .map(item => `• ${item.name}: $${item.price.toFixed(2)}`)
      .join('\n');
    
    return `Here are some popular items from ${restaurant.name}:\n${menuList}\n\nWould you like me to add any of these to your cart?`;
  };
  
  // Handle adding items to cart
  const handleAddToCart = (itemName, restaurantName) => {
    if (!isDataLoaded()) {
      return "I'm still loading menu information. Please try again in a moment.";
    }
    
    const restaurant = findRestaurant(restaurantName);
    if (!restaurant) {
      return `Sorry, I couldn't find a restaurant called "${restaurantName}".`;
    }
    
    const menuItem = findMenuItem(itemName, restaurant._id);
    if (!menuItem) {
      return `Sorry, I couldn't find "${itemName}" on ${restaurant.name}'s menu.`;
    }
    
    // Add to cart with restaurant info
    try {
      addToCart({
        ...menuItem,
        quantity: 1,
        restaurantName: restaurant.name
      });
      
      return `I've added ${menuItem.name} from ${restaurant.name} to your cart. Would you like anything else?`;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return "Sorry, I couldn't add that item to your cart. Please try again.";
    }
  };
  
  // View cart
  const handleViewCart = () => {
    if (!cart || cart.length === 0) {
      return "Your cart is empty. Would you like to see our restaurants?";
    }
    
    const cartItems = cart.map(item => 
      `• ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return `Your cart contains:\n${cartItems}\n\nTotal: $${total.toFixed(2)}\n\nReady to checkout?`;
  };
  
  // Go to restaurant
  const handleGoToRestaurant = (restaurantName) => {
    const restaurant = findRestaurant(restaurantName);
    
    if (!restaurant) {
      return `Sorry, I couldn't find a restaurant called "${restaurantName}".`;
    }
    
    setTimeout(() => navigate(`/restaurants/${restaurant._id}`), 1000);
    return `Taking you to ${restaurant.name}'s page...`;
  };
  
  // Process messages
  const processMessage = (message) => {
    const messageLower = message.toLowerCase();
    
    // Greetings
    if (/^(hi|hello|hey|greetings)$/i.test(messageLower)) {
      return "Hi there! I can help you find restaurants, browse menus, and add items to your cart. What would you like to do?";
    }
    
    // Show available categories
    if (messageLower.includes('category') || messageLower.includes('categories')) {
      return getAvailableCategories();
    }
    
    // Show restaurants (general or by category)
    if (messageLower.includes('show restaurant') || 
        messageLower.includes('list restaurant') || 
        messageLower.includes('find restaurant')) {
      
      // Check for categories we have in our system
      if (categories) {
        for (const category of categories) {
          if (messageLower.includes(category.name.toLowerCase())) {
            return getRestaurantRecommendations(category.name);
          }
        }
      }
      
      // Check for cuisine types
      const cuisines = ['italian', 'indian', 'chinese', 'pizza', 'burger', 'mexican', 'thai', 'japanese'];
      const mentionedCuisine = cuisines.find(cuisine => messageLower.includes(cuisine));
      
      if (mentionedCuisine) {
        return getRestaurantRecommendations(mentionedCuisine);
      }
      
      // No specific category/cuisine mentioned
      return getRestaurantRecommendations();
    }
    
    // Show menu
    if (messageLower.includes('show menu') || 
        messageLower.includes('see menu') || 
        messageLower.includes('what do they have')) {
      
      // Try to extract restaurant name from all available restaurants
      if (restaurants) {
        for (const restaurant of restaurants) {
          if (messageLower.includes(restaurant.name.toLowerCase())) {
            return handleMenuRequest(restaurant.name);
          }
        }
      }
      
      return "Which restaurant's menu would you like to see?";
    }
    
    // Add to cart
    if ((messageLower.includes('add') || messageLower.includes('order')) && 
        messageLower.includes('from')) {
      const parts = messageLower.split('from');
      if (parts.length === 2) {
        const itemName = parts[0].replace('add', '').replace('order', '').trim();
        const restaurantName = parts[1].trim();
        return handleAddToCart(itemName, restaurantName);
      }
    }
    
    // View cart
    if (messageLower.includes('cart') || 
        messageLower.includes('my order') || 
        messageLower.includes('what did i order')) {
      return handleViewCart();
    }
    
    // Go to restaurant page
    if ((messageLower.includes('go to') || messageLower.includes('take me to')) && 
        !messageLower.includes('cart') && !messageLower.includes('checkout') && 
        !messageLower.includes('home') && !messageLower.includes('dashboard')) {
      
      // Try to extract restaurant name
      if (restaurants) {
        for (const restaurant of restaurants) {
          if (messageLower.includes(restaurant.name.toLowerCase())) {
            return handleGoToRestaurant(restaurant.name);
          }
        }
      }
    }
    
    // Navigation requests
    if (messageLower.includes('go to') || messageLower.includes('take me to')) {
      if (messageLower.includes('cart') || messageLower.includes('checkout')) {
        setTimeout(() => navigate('/cart'), 1000);
        return "Taking you to your cart...";
      }
      if (messageLower.includes('home') || messageLower.includes('dashboard')) {
        setTimeout(() => navigate('/dashboard'), 1000);
        return "Taking you to the dashboard...";
      }
    }
    
    // Checkout intent
    if (messageLower.includes('checkout') || 
        messageLower.includes('place order') || 
        messageLower.includes('pay')) {
      if (cart && cart.length > 0) {
        setTimeout(() => navigate('/payment'), 1000);
        return "Taking you to checkout...";
      } else {
        return "Your cart is empty. Would you like to browse our restaurants?";
      }
    }
    
    // Default responses
    return "I can help you find restaurants, view menus, and add items to your cart. Try saying 'Show restaurants', 'Show pizza restaurants', or 'Add [item] from [restaurant]'.";
  };
  
  // Handle sending messages
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: inputText, sender: 'user' }]);
    
    // Clear input and show typing indicator
    const userInput = inputText;
    setInputText('');
    setIsTyping(true);
    
    // Process response with delay for natural feel
    setTimeout(() => {
      const response = processMessage(userInput);
      addBotMessage(response);
      setIsTyping(false);
    }, 800);
  };
  
  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion) => {
    // If restaurants aren't loaded, inform the user
    if (suggestion.includes("restaurant") && !isDataLoaded()) {
      addBotMessage("I'm still loading restaurant data. Here are some sample restaurants: Domino's Pizza, Pizza Hut, McDonald's, Taco Bell, Panda Express.");
      return;
    }
    
    setInputText(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <FaUtensils /> Food Assistant
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="message bot typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
            />
            <button className="send-btn" onClick={handleSendMessage}>
              <FaPaperPlane />
            </button>
          </div>
          
          <div className="chatbot-footer">
            <div className="chatbot-suggestions">
              <button onClick={() => handleSuggestionClick("Show restaurant categories")}>
                Categories
              </button>
              <button onClick={() => handleSuggestionClick("Show pizza restaurants")}>
                Pizza Places
              </button>
              <button onClick={() => handleSuggestionClick("Show my cart")}>
                View Cart
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <FaRobot className="bot-icon" />
          <span className="button-text">Chat with FoodBot</span>
        </button>
      )}
    </div>
  );
};

export default ChatBot;