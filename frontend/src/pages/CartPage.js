import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaPlus, FaMinus, FaShoppingCart, 
         FaInfoCircle, FaReceipt, FaPercent, FaTags } from 'react-icons/fa';
import './CartPage.css';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  // Replace local cart state with context
  const { cart, cartTotal, removeFromCart, decreaseQuantity, addToCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const navigate = useNavigate();

  // Calculate subtotal directly from cart context
  const subtotal = cartTotal;

  // Sample offers data
  const offers = [
    {
      id: 1,
      code: "NEW50",
      description: "50% off up to ₹100 on your first order",
      discount: 50,
      maxDiscount: 100,
      minOrder: 0,
      isFirstOrder: true
    },
    {
      id: 2,
      code: "WELCOME20",
      description: "Flat 20% off on orders above ₹300",
      discount: 20,
      minOrder: 300,
    },
    {
      id: 3,
      code: "SPECIAL10",
      description: "10% off on all premium dishes",
      discount: 10,
      minOrder: 0,
      requiresPremium: true
    },
    {
      id: 4,
      code: "FREEDEL",
      description: "Free delivery on orders above ₹500",
      isFreeDelivery: true,
      minOrder: 500,
    }
  ];

  // Check if offers are applicable based on current cart
  const getApplicableOffers = () => {
    // For demo purposes - consider the first order condition always met for the first offer
    const isFirstOrder = true; 
    
    // For demo purposes - check if any item has a price > 200 to consider it "premium"
    const hasPremiumItems = cart.some(item => item.price > 200);
    
    return offers.map(offer => ({
      ...offer,
      isApplicable: 
        (subtotal >= offer.minOrder) && 
        (!offer.isFirstOrder || isFirstOrder) &&
        (!offer.requiresPremium || hasPremiumItems)
    }));
  };
  
  const applicableOffers = getApplicableOffers();

  // Calculate discount if an offer is selected
  const calculateDiscount = () => {
    if (!selectedOffer) return 0;
    
    // Validate if the offer is still applicable
    const offerIsApplicable = applicableOffers.find(
      offer => offer.id === selectedOffer.id && offer.isApplicable
    );
    
    if (!offerIsApplicable) return 0;
    
    if (selectedOffer.discount) {
      const discountAmount = (subtotal * selectedOffer.discount) / 100;
      return selectedOffer.maxDiscount ? Math.min(discountAmount, selectedOffer.maxDiscount) : discountAmount;
    }
    return 0;
  };
  
  const discount = calculateDiscount();
  const deliveryFee = (selectedOffer && selectedOffer.isFreeDelivery && subtotal >= selectedOffer.minOrder) ? 0 : (subtotal > 0 ? 30 : 0);
  const taxAmount = subtotal * 0.05; // 5% tax
  const totalAmount = subtotal - discount + deliveryFee + taxAmount;

  // Re-validate selected offer when subtotal changes
  useEffect(() => {
    if (selectedOffer) {
      const isStillValid = applicableOffers.find(
        offer => offer.id === selectedOffer.id && offer.isApplicable
      );
      
      if (!isStillValid) {
        setSelectedOffer(null);
      }
    }
  }, [subtotal]);

  const toggleOrderSummary = () => {
    setShowOrderSummary(!showOrderSummary);
  };

  const increaseQuantity = (itemId) => {
    const item = cart.find(item => item._id === itemId);
    if (item) {
      addToCart(item);
    }
  };

  const handleCheckout = () => {
    // Save selected offer to localStorage if applicable
    if (selectedOffer) {
      localStorage.setItem('selectedOffer', JSON.stringify(selectedOffer));
    } else {
      localStorage.removeItem('selectedOffer');
    }
    
    // Navigate to payment page
    navigate('/payment');
  };

  const handleOfferSelect = (offer) => {
    if (offer.isApplicable) {
      setSelectedOffer(selectedOffer?.id === offer.id ? null : offer);
    } else {
      // Show feedback about why offer can't be applied
      let message = "This offer cannot be applied";
      
      if (offer.minOrder > subtotal) {
        message = `You need to add items worth ₹${offer.minOrder - subtotal} more to use this offer`;
      } else if (offer.requiresPremium) {
        message = "This offer is only applicable on premium dishes";
      } else if (offer.isFirstOrder) {
        message = "This offer is only valid for first-time orders";
      }
      
      alert(message);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="cart-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your cart...</p>
          </div>
        </div>
      </>
    );
  }

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="cart-page">
          <div className="cart-empty">
            <div className="empty-cart-image">
              <img src="https://cdn-icons-png.flaticon.com/512/2037/2037457.png" alt="Empty cart" />
            </div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/" className="return-btn">
              Return to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="cart-page">
        {/* Left panel - 40% width */}
        <div className="cart-left-panel">
          <div className="cart-header">
            <h1>Your Cart</h1>
            
            {/* Order summary toggle button */}
            <button 
              className="summary-toggle-btn" 
              onClick={toggleOrderSummary}
            >
              {showOrderSummary ? (
                <>
                  <FaTags /> Show Offers
                </>
              ) : (
                <>
                  <FaReceipt /> View Summary
                </>
              )}
            </button>
            
            <button className="clear-cart-btn" onClick={clearCart}>
              Clear
            </button>
          </div>
          
          <div className="cart-items">
            {cart.map(item => (
              <div key={item._id} className="cart-item">
                <div className="item-image">
                  <img 
                    src={item.image || 'https://via.placeholder.com/80x80?text=Food'} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x80?text=Food';
                    }}
                  />
                  <div className="quantity-control">
                    <button onClick={() => decreaseQuantity(item._id)}>
                      <FaMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item._id)}>
                      <FaPlus />
                    </button>
                  </div>
                </div>
                <div className="item-details">
                  <div className="item-header">
                    <div className="item-title-container">
                      <h3>{item.name}</h3>
                      <span className={`food-tag ${item.isVeg ? 'veg' : 'non-veg'}`}></span>
                    </div>
                    <div className="item-actions">
                      <span className="item-price">₹{item.price * item.quantity}</span>
                      <button className="remove-item" onClick={() => removeFromCart(item._id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <p className="item-description">
                    {item.description || `${item.isVeg ? 'Vegetarian' : 'Non-vegetarian'} dish from our special menu.`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right side panel - toggles between offers and order summary */}
        <div className="right-side-panel">
          {/* Offers panel - visible when order summary is hidden */}
          <div className={`offers-panel ${!showOrderSummary ? 'visible' : ''}`}>
            <div className="offers-container">
              <div className="panel-header">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                  <FaArrowLeft /> Back
                </button>
                <h2><FaPercent /> Available Offers</h2>
              </div>
              
              <div className="current-subtotal">
                Order Subtotal: <strong>₹{subtotal.toFixed(2)}</strong>
              </div>
              
              <div className="offers-list">
                {applicableOffers.map(offer => (
                  <div 
                    key={offer.id}
                    className={`offer-card ${!offer.isApplicable ? 'disabled' : ''} ${selectedOffer?.id === offer.id ? 'selected' : ''}`}
                    onClick={() => handleOfferSelect(offer)}
                  >
                    <div className="offer-header">
                      <span className="offer-code">{offer.code}</span>
                      {selectedOffer?.id === offer.id && <span className="offer-applied">APPLIED</span>}
                    </div>
                    <p className="offer-description">{offer.description}</p>
                    {!offer.isApplicable && (
                      <span className="offer-not-applicable">
                        {offer.minOrder > subtotal 
                          ? `Add ₹${(offer.minOrder - subtotal).toFixed(2)} more to unlock` 
                          : "Not applicable on your order"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="price-summary">
                <div className="summary-row">
                  <span>Item Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {selectedOffer && (
                  <div className="summary-row discount">
                    <span>Discount ({selectedOffer.code})</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Taxes & Charges</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>To Pay</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <button className="place-order-btn" onClick={handleCheckout}>
                <FaShoppingCart /> Checkout • ₹{totalAmount.toFixed(2)}
              </button>
            </div>
          </div>
          
          {/* Order summary panel - visible when toggled */}
          <div className={`order-summary-panel ${showOrderSummary ? 'visible' : ''}`}>
            <div className="order-summary-container">
              <h2>Order Summary</h2>
              <div className="order-items-summary">
                <h3>Items ({cart.reduce((total, item) => total + item.quantity, 0)})</h3>
                <div className="summary-list">
                  {cart.map(item => (
                    <div key={item._id} className="summary-item">
                      <div className="summary-item-name">
                        <span className={`mini-tag ${item.isVeg ? 'veg' : 'non-veg'}`}></span>
                        <span>{item.name} × {item.quantity}</span>
                      </div>
                      <span className="summary-item-price">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="price-breakdown">
                <div className="breakdown-row">
                  <span>Item Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                {selectedOffer && (
                  <div className="breakdown-row discount">
                    <span>Discount ({selectedOffer.code})</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="breakdown-row">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                
                <div className="breakdown-row">
                  <span>Taxes & Charges</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="total-row">
                <span>To Pay</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              
              <button className="place-order-btn" onClick={handleCheckout}>
                <FaShoppingCart /> Checkout • ₹{totalAmount.toFixed(2)}
              </button>
              
              <div className="order-note">
                <FaInfoCircle />
                <p>By placing your order, you agree to our Terms of Service and Privacy Policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;