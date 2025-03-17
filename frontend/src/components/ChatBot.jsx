import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUtensils } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useRestaurants } from '../context/RestaurantContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './ChatBot.css';

// Sample fallback data
const SAMPLE_DATA = {
  categories: [
    { _id: 'cat1', name: 'Pizza', image: 'pizza-image.jpg' },
    { _id: 'cat2', name: 'Burger', image: 'burger-image.jpg' },
    { _id: 'cat3', name: 'Asian', image: 'asian-image.jpg' },
    { _id: 'cat4', name: 'Italian', image: 'italian-image.jpg' },
    { _id: 'cat5', name: 'Dessert', image: 'dessert-image.jpg' }
  ],
  restaurants: [
    { _id: 'rest1', name: 'Pizza Hut', rating: 4.5, cuisine: 'Italian', categoryIds: ['cat1', 'cat4'] },
    { _id: 'rest2', name: 'Domino\'s Pizza', rating: 4.3, cuisine: 'Italian', categoryIds: ['cat1', 'cat4'] },
    { _id: 'rest3', name: 'McDonald\'s', rating: 3.9, cuisine: 'Fast Food', categoryIds: ['cat2'] },
    { _id: 'rest4', name: 'Burger King', rating: 4.0, cuisine: 'Fast Food', categoryIds: ['cat2'] },
    { _id: 'rest5', name: 'Chinese Dragon', rating: 4.7, cuisine: 'Chinese', categoryIds: ['cat3'] }
  ],
  menuItems: [
    { _id: 'item1', name: 'Margherita Pizza', price: 9.99, restaurantId: 'rest1', description: 'Classic cheese pizza' },
    { _id: 'item2', name: 'Pepperoni Pizza', price: 11.99, restaurantId: 'rest1', description: 'Pizza with pepperoni' },
    { _id: 'item3', name: 'Hawaiian Pizza', price: 12.99, restaurantId: 'rest2', description: 'Pizza with ham and pineapple' },
    { _id: 'item4', name: 'Big Mac', price: 5.99, restaurantId: 'rest3', description: 'Signature burger' },
    { _id: 'item5', name: 'Whopper', price: 6.49, restaurantId: 'rest4', description: 'Flame-grilled burger' }
  ]
};

const ChatBot = () => {
  // Basic state
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "👋 Hi! I can help you find restaurants, order food, and more!", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Dialogflow state
  const [sessionId, setSessionId] = useState('');
  const [awaitingResponse, setAwaitingResponse] = useState(null); // Track expected user response
  const [suggestedOptions, setSuggestedOptions] = useState([]); // Dynamic suggestion buttons
  
  // References
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Context data
  const { restaurants: contextRestaurants, categories: contextCategories, menuItems: contextMenuItems } = useRestaurants();
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();
  
  // Use either real or sample data
  const usingSampleData = !contextRestaurants || contextRestaurants.length === 0;
  const restaurants = usingSampleData ? SAMPLE_DATA.restaurants : contextRestaurants;
  const categories = usingSampleData ? SAMPLE_DATA.categories : contextCategories;
  const menuItems = usingSampleData ? SAMPLE_DATA.menuItems : contextMenuItems;
  
  // Initialize session ID
  useEffect(() => {
    setSessionId(uuidv4());
  }, []);
  
  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [isOpen]);
  
  // Add sample data notification
  useEffect(() => {
    if (usingSampleData && messages.length === 1) {
      setTimeout(() => {
        addBotMessage("Note: I'm currently using sample data since we can't connect to our restaurant database. All features will still work!");
      }, 1000);
    }
  }, [usingSampleData, messages.length]);
  
  // Helper to add bot messages
  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { text, sender: 'bot' }]);
  };
  
  // ===== CORE FUNCTIONALITY =====
  
  // Get all categories
  const getAllCategories = () => {
    if (!categories || categories.length === 0) {
      return "I don't have any category information at the moment.";
    }
    
    // Set suggested categories for quick selection
    setSuggestedOptions(categories.slice(0, 5).map(cat => cat.name));
    
    // Set waiting state to track the conversation
    setAwaitingResponse('category');
    
    const categoryNames = categories.map(cat => cat.name).join(', ');
    return `We have these restaurant categories: ${categoryNames}. Which category would you like to explore?`;
  };
  
  // Get restaurants by category
  const getRestaurantsByCategory = (categoryName) => {
    if (!categories || !restaurants) {
      return "I can't access restaurant information right now.";
    }
    
    // Find the category by name (case insensitive)
    const category = categories.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    
    // If no exact match, try fuzzy matching
    if (!category) {
      const matchingCategory = categories.find(cat => 
        cat.name.toLowerCase().includes(categoryName.toLowerCase())
      );
      
      if (matchingCategory) {
        return getRestaurantsByCategory(matchingCategory.name);
      }
      
      // Try matching by cuisine
      const matchingRestaurants = restaurants.filter(restaurant => 
        restaurant.cuisine && restaurant.cuisine.toLowerCase().includes(categoryName.toLowerCase())
      );
      
      if (matchingRestaurants.length > 0) {
        return formatRestaurantList(matchingRestaurants, categoryName);
      }
      
      return `I couldn't find any restaurants in the "${categoryName}" category. Our available categories are: ${categories.map(c => c.name).join(', ')}.`;
    }
    
    // Find restaurants by category ID
    const categoryRestaurants = restaurants.filter(restaurant => 
      restaurant.categoryIds && restaurant.categoryIds.includes(category._id)
    );
    
    if (categoryRestaurants.length === 0) {
      return `I couldn't find any restaurants in the ${category.name} category right now.`;
    }
    
    return formatRestaurantList(categoryRestaurants, category.name);
  };
  
  // Format restaurant list
  const formatRestaurantList = (restaurantList, categoryName) => {
    const sortedRestaurants = [...restaurantList].sort((a, b) => b.rating - a.rating);
    
    // Set suggested restaurants for quick selection
    setSuggestedOptions(sortedRestaurants.slice(0, 4).map(r => `Show menu for ${r.name}`));
    
    // Set waiting state
    setAwaitingResponse('restaurant_selection');
    
    const restaurantDisplay = sortedRestaurants
      .map((r, i) => `${i+1}. ${r.name} (${r.rating}⭐)`)
      .join('\n');
    
    return `Here are the top ${categoryName} restaurants:\n${restaurantDisplay}\n\nWhich restaurant's menu would you like to see?`;
  };
  
  // Get menu for a restaurant
  const getRestaurantMenu = (restaurantName) => {
    if (!restaurants || !menuItems) {
      return "I can't access the menu information right now.";
    }
    
    // Clear the awaiting response state
    setAwaitingResponse(null);
    
    // Normalize and find restaurant by name
    const normalizedSearchName = restaurantName.toLowerCase().trim()
      .replace("show menu for ", "")
      .replace("show menu of ", "");
      
    const restaurant = restaurants.find(r => 
      r.name.toLowerCase().includes(normalizedSearchName) ||
      normalizedSearchName.includes(r.name.toLowerCase())
    );
    
    if (!restaurant) {
      return `I couldn't find a restaurant called "${restaurantName}". Would you like me to show you our available restaurants?`;
    }
    
    // Find menu items
    const restaurantMenu = menuItems.filter(item => item.restaurantId === restaurant._id);
    
    if (restaurantMenu.length === 0) {
      return `${restaurant.name} is in our system, but I don't have their menu. Would you like to visit their page?`;
    }
    
    // Set suggested menu items for quick ordering
    setSuggestedOptions(restaurantMenu.slice(0, 3).map(item => `Add ${item.name} from ${restaurant.name}`));
    
    // Set waiting state
    setAwaitingResponse('menu_selection');
    
    const menuDisplay = restaurantMenu
      .slice(0, 6)
      .map(item => `• ${item.name}: $${item.price.toFixed(2)}`)
      .join('\n');
    
    return `Here's the menu for ${restaurant.name}:\n${menuDisplay}\n\nWould you like to add any of these to your cart?`;
  };
  
  // Add item to cart with improved matching
  const addItemToCart = (itemName, restaurantName) => {
    if (!restaurants || !menuItems) {
      return "Sorry, I can't access the menu information right now.";
    }
    
    // Clear the awaiting response state
    setAwaitingResponse(null);
    
    // Normalize and find restaurant with fuzzy matching
    const normalizedRestName = restaurantName.toLowerCase().trim();
    const restaurant = restaurants.find(r => 
      r.name.toLowerCase().includes(normalizedRestName) ||
      normalizedRestName.includes(r.name.toLowerCase())
    );
    
    if (!restaurant) {
      return `I couldn't find a restaurant called "${restaurantName}". Available restaurants include: ${restaurants.slice(0, 3).map(r => r.name).join(', ')}`;
    }
    
    // Find menu items for this restaurant
    const restaurantMenuItems = menuItems.filter(item => item.restaurantId === restaurant._id);
    
    // Normalize and find item with fuzzy matching
    const normalizedItemName = itemName.toLowerCase().trim();
    const menuItem = restaurantMenuItems.find(item => 
      item.name.toLowerCase().includes(normalizedItemName) ||
      normalizedItemName.includes(item.name.toLowerCase())
    );
    
    if (!menuItem) {
      const availableItems = restaurantMenuItems
        .slice(0, 5)
        .map(i => i.name)
        .join(', ');
        
      return `I couldn't find "${itemName}" on ${restaurant.name}'s menu. They offer: ${availableItems}`;
    }
    
    try {
      addToCart({
        ...menuItem,
        quantity: 1,
        restaurantName: restaurant.name
      });
      
      // Set suggested next actions after adding to cart
      setSuggestedOptions(['View Cart', 'Continue Shopping']);
      
      return `Great! I've added ${menuItem.name} from ${restaurant.name} to your cart. The price is $${menuItem.price.toFixed(2)}. Would you like to check out or continue shopping?`;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return "Sorry, I couldn't add that item to your cart. Please try again.";
    }
  };
  
  // View cart
  const viewCart = () => {
    if (!cart || cart.length === 0) {
      // Set suggested next actions for empty cart
      setSuggestedOptions(['Show categories', 'Show pizza restaurants']);
      return "Your cart is currently empty. Would you like to browse restaurants?";
    }
    
    // Set suggested next actions for non-empty cart
    setSuggestedOptions(['Checkout', 'Continue Shopping']);
    
    const cartItems = cart.map(item => 
      `• ${item.quantity}x ${item.name}: $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return `Your cart contains:\n${cartItems}\n\nTotal: $${total.toFixed(2)}\n\nReady to checkout?`;
  };
  
  // Handle checkout process
  const handleCheckout = () => {
    if (!cart || cart.length === 0) {
      return "Your cart is empty. Let's find some food for you first!";
    }
    
    // Navigate to checkout page
    setTimeout(() => navigate('/cart'), 1000);
    return "Taking you to checkout...";
  };
  
  // ===== DIALOGFLOW INTEGRATION =====
  
  // Process message with Dialogflow
  const processWithDialogflow = async (message) => {
    try {
      setIsTyping(true);
      
      // Check if we're awaiting a specific response
      if (awaitingResponse === 'category' && !message.toLowerCase().includes('category')) {
        // User is likely responding with a category name
        const categoryResponse = getRestaurantsByCategory(message);
        return categoryResponse;
      }
      
      // Create context object with current data
      const context = {
        restaurants: restaurants.map(r => ({
          id: r._id,
          name: r.name,
          cuisine: r.cuisine,
          categories: r.categoryIds?.map(cId => {
            const cat = categories.find(c => c._id === cId);
            return cat ? cat.name : null;
          }).filter(Boolean) || []
        })),
        menuItems: menuItems.map(item => ({
          id: item._id,
          name: item.name,
          price: item.price,
          restaurantId: item.restaurantId,
          restaurantName: restaurants.find(r => r._id === item.restaurantId)?.name || ''
        })),
        availableCategories: categories.map(c => c.name)
      };
      
      console.log("Sending to Dialogflow:", message, sessionId);
      
      // Call Dialogflow API
      const response = await axios.post('/api/dialogflow/query', {
        message,
        sessionId,
        context
      });
      
      console.log("Dialogflow response:", response.data);
      
      const { intent, parameters, fulfillmentText } = response.data;
      
      // Check if Dialogflow is prompting for missing information
      if (fulfillmentText && 
          (fulfillmentText.includes("Which food category") || 
           fulfillmentText.includes("What category"))) {
        
        // Show category suggestions
        setSuggestedOptions(categories.slice(0, 5).map(cat => cat.name));
        setAwaitingResponse('category');
        
        const categoryNames = categories.slice(0, 5).map(cat => cat.name).join(', ');
        return `${fulfillmentText} We have ${categoryNames}, and more.`;
      }
      
      // Process response based on intent
      switch (intent) {
        case 'show_categories':
          return getAllCategories();
          
        case 'show_restaurants_by_category': {
          const categoryParam = parameters.category?.stringValue;
          if (categoryParam) {
            return getRestaurantsByCategory(categoryParam);
          } 
          
          // If category parameter is missing but we know the intent
          setSuggestedOptions(categories.slice(0, 5).map(cat => cat.name));
          setAwaitingResponse('category');
          return "Which food category would you like to explore?";
        }
        
        case 'add_to_cart': {
          const itemParam = parameters.item?.stringValue;
          const restaurantParam = parameters.restaurant?.stringValue;
          
          if (itemParam && restaurantParam) {
            return addItemToCart(itemParam, restaurantParam);
          }
          
          if (restaurantParam && !itemParam) {
            // If we have restaurant but no item
            const restaurant = restaurants.find(r => 
              r.name.toLowerCase().includes(restaurantParam.toLowerCase())
            );
            
            if (restaurant) {
              return getRestaurantMenu(restaurantParam);
            }
          }
          
          return "What would you like to add to your cart and from which restaurant?";
        }
        
        case 'view_menu': {
          const restaurantParam = parameters.restaurant?.stringValue;
          if (restaurantParam) {
            return getRestaurantMenu(restaurantParam);
          }
          
          setSuggestedOptions(restaurants.slice(0, 4).map(r => r.name));
          return "Which restaurant's menu would you like to see?";
        }
        
        case 'view_cart':
          return viewCart();
          
        case 'checkout':
          return handleCheckout();
          
        default:
          // Clear any suggestion options for general queries
          setSuggestedOptions([]);
          setAwaitingResponse(null);
          
          // Use Dialogflow's fulfillment text or provide a default
          if (fulfillmentText) {
            return fulfillmentText;
          }
          return "I'm not sure how to help with that. You can ask me about restaurants, menus, or your cart.";
      }
      
    } catch (error) {
      console.error("Error with Dialogflow:", error);
      
      // Fallback to simple pattern matching
      return processMessageLocally(message);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Fallback local processing when Dialogflow fails
  const processMessageLocally = (message) => {
    const messageLower = message.toLowerCase();
    
    // Basic pattern matching as fallback
    if (messageLower.includes('category') || messageLower.includes('categories')) {
      return getAllCategories();
    }
    
    if (messageLower.includes('restaurant') && 
       (messageLower.includes('show') || messageLower.includes('find') || messageLower.includes('list'))) {
      
      // Check for category names
      for (const category of categories || []) {
        if (messageLower.includes(category.name.toLowerCase())) {
          return getRestaurantsByCategory(category.name);
        }
      }
      
      return formatRestaurantList(restaurants, 'popular');
    }
    
    if (messageLower.includes('menu')) {
      for (const restaurant of restaurants || []) {
        if (messageLower.includes(restaurant.name.toLowerCase())) {
          return getRestaurantMenu(restaurant.name);
        }
      }
    }
    
    if ((messageLower.includes('add') || messageLower.includes('order')) && 
        messageLower.includes('from')) {
      const parts = messageLower.split('from');
      if (parts.length >= 2) {
        const itemPart = parts[0]
          .replace('add', '')
          .replace('order', '')
          .trim();
        const restaurantPart = parts[1].trim();
        
        return addItemToCart(itemPart, restaurantPart);
      }
    }
    
    if (messageLower.includes('cart')) {
      return viewCart();
    }
    
    if (messageLower.includes('checkout') || messageLower.includes('pay')) {
      return handleCheckout();
    }
    
    // Set default suggestions if no match
    setSuggestedOptions(['Show categories', 'Show restaurants', 'View cart']);
    
    return "I can help you find restaurants, view menus, and add items to your cart. Try asking about categories, specific restaurants, or adding items to your cart.";
  };
  
  // ===== UI HANDLERS =====
  
  // Send message handler
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: inputText, sender: 'user' }]);
    
    // Clear input and show typing
    const userMessage = inputText;
    setInputText('');
    setIsTyping(true);
    
    try {
      // Process with Dialogflow
      const response = await processWithDialogflow(userMessage);
      addBotMessage(response);
    } catch (error) {
      console.error("Error processing message:", error);
      
      // Fallback to simple response
      addBotMessage("Sorry, I'm having trouble understanding. Could you try asking differently?");
      setIsTyping(false);
    }
  };
  
  // Suggestion click handler
  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };
  
  // Dynamic suggestion buttons based on context
  const renderSuggestionButtons = () => {
    if (suggestedOptions.length > 0) {
      return (
        <div className="chatbot-suggestions">
          {suggestedOptions.map((option, index) => (
            <button 
              key={index} 
              onClick={() => handleSuggestionClick(option)}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }
    
    // Default suggestions
    return (
      <div className="chatbot-suggestions">
        <button onClick={() => handleSuggestionClick("Show categories")}>
          Categories
        </button>
        <button onClick={() => handleSuggestionClick("Show pizza restaurants")}>
          Pizza Places
        </button>
        <button onClick={() => handleSuggestionClick("Show my cart")}>
          View Cart
        </button>
      </div>
    );
  };
  
  // ===== RENDER =====
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
              ref={inputRef}
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
            {renderSuggestionButtons()}
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