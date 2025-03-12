import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShoppingBag, FaCreditCard, FaMobileAlt, FaMoneyBillWave, 
         FaInfoCircle, FaCheck, FaArrowRight, FaLock, FaShieldAlt, FaCheckCircle, FaTimes } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import './PaymentPage.css';
import { useCart } from '../context/CartContext';

const PaymentPage = ({ handleLogout }) => {
  // Use cart from context
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [activeMethod, setActiveMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedUpi, setSelectedUpi] = useState('');
  const [upiId, setUpiId] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const navigate = useNavigate();
  
  // Subtotal comes directly from context
  const subtotal = cartTotal;
  const deliveryFee = 30;
  const taxAmount = subtotal * 0.05; // 5% tax
  
  // Calculate discount if an offer is selected
  const calculateDiscount = () => {
    if (!selectedOffer) return 0;
    
    if (selectedOffer.discount) {
      const discountAmount = (subtotal * selectedOffer.discount) / 100;
      return selectedOffer.maxDiscount ? Math.min(discountAmount, selectedOffer.maxDiscount) : discountAmount;
    } else if (selectedOffer.isFreeDelivery) {
      return deliveryFee;
    }
    return 0;
  };
  
  const discount = calculateDiscount();
  const finalDeliveryFee = selectedOffer?.isFreeDelivery ? 0 : deliveryFee;
  const totalAmount = subtotal + finalDeliveryFee + taxAmount - discount;
  
  // Load offer from localStorage
  useEffect(() => {
    const savedOffer = localStorage.getItem('selectedOffer');
    if (savedOffer) {
      try {
        setSelectedOffer(JSON.parse(savedOffer));
      } catch (error) {
        console.error('Error parsing offer data:', error);
      }
    }
    
    setLoading(false);
  }, []);
  
  // Validate payment form fields based on selected method
  const isPaymentValid = () => {
    if (activeMethod === 'card') {
      return cardNumber.length >= 16 && expiryDate.length === 5 && cvv.length === 3 && cardName.trim() !== '';
    } else if (activeMethod === 'upi') {
      return selectedUpi && upiId.includes('@');
    } else if (activeMethod === 'cash') {
      return true; // Cash on delivery is always valid
    }
    return false;
  };
  
  // Update your handlePayment function
  const handlePayment = () => {
    setLoading(true);
    
    // Generate order ID
    const orderId = 'ORD' + Date.now().toString().slice(-10);
    setOrderId(orderId);
    
    // Get current time
    const orderTime = Date.now();
    const orderDate = new Date(orderTime);
    const timeString = orderDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    setTimeout(() => {
      // Get restaurant info from the cart
      const restaurantName = cart[0]?.restaurantName || "Restaurant";
      const restaurantId = cart[0]?.restaurantId;
      
      // Get customer info - ensure we get current user data
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userId = currentUser.id || localStorage.getItem('userId');
      const userName = currentUser.name || localStorage.getItem('userName');
      const userEmail = currentUser.email || localStorage.getItem('userEmail');
      const userPhone = currentUser.phone || localStorage.getItem('userPhone');
      
      // Use a default address
      const deliveryAddress = {
        name: userName,
        street: '123 Main Street',
        city: 'New Delhi',
        state: 'Delhi',
        zipCode: '110001',
        phone: userPhone
      };
      
      const newOrder = {
        _id: orderId,
        restaurantName: restaurantName,  // Use the name from cart
        restaurantId: restaurantId,      // Include restaurant ID
        items: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal: subtotal,
        deliveryFee: finalDeliveryFee,
        tax: taxAmount,
        discount: discount,
        total: totalAmount,
        status: 'order-received',
        statusHistory: [
          { status: 'order-received', time: timeString, timestamp: orderTime }
        ],
        orderTime: orderTime,
        estimatedDelivery: orderTime + 3600000,
        address: deliveryAddress, // Use the selected address
        paymentMethod: activeMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment',
        
        // Add customer info
        customer: {
          id: userId,
          name: userName,
          email: userEmail,
          phone: userPhone
        },
        
        // Add admin-related fields
        adminStatus: 'pending',
        adminNotified: false
      };
      
      // Store the order in localStorage
      const existingOrders = JSON.parse(localStorage.getItem('foodAppOrders') || '[]');
      localStorage.setItem('foodAppOrders', JSON.stringify([newOrder, ...existingOrders]));
      
      // Store for admin management
      const adminOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      adminOrders.unshift(newOrder); // Add to beginning of array
      localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
      
      // Clear cart after successful order
      clearCart();
      
      // Clear offer
      localStorage.removeItem('selectedOffer');
      
      // Set order success state
      setOrderSuccess(true);
      setLoading(false);
    }, 2000);
  };
  
  if (loading) {
    return (
      <>
        <Navbar handleLogout={handleLogout} />
        <div className="payment-loading">
          <div className="payment-spinner"></div>
          <p>Loading payment details...</p>
        </div>
      </>
    );
  }
  
  if (orderSuccess) {
    return (
      <>
        <Navbar handleLogout={handleLogout} />
        <div className="payment-success-modal">
          <div className="payment-success-content">
            <div className="payment-success-icon">
              <FaCheckCircle />
            </div>
            <h2>Order Placed Successfully!</h2>
            <p>Your delicious food is on the way!</p>
            <div className="payment-order-id">Order ID: {orderId}</div>
            <button onClick={() => navigate('/orders')} className="payment-track-button">
              Track Order <FaArrowRight />
            </button>
            <button onClick={() => navigate('/dashboard')} className="payment-home-button">
              Return to Home
            </button>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Navbar handleLogout={handleLogout} />
      <div className="payment-page">
        {/* Left Panel - Order Summary */}
        <div className="payment-summary-panel">
          <div className="payment-summary-header">
            <button className="payment-back-btn" onClick={() => navigate('/cart')}>
              <FaArrowLeft /> Back to Cart
            </button>
            <h2>Order Summary</h2>
          </div>
          
          <div className="payment-summary-content">
            <div className="payment-items-section">
              <h3>
                <FaShoppingBag /> Your Items ({cart.reduce((total, item) => total + item.quantity, 0)})
              </h3>
              
              <div className="payment-items-list">
                {cart.map(item => (
                  <div key={item._id} className="payment-item">
                    <div className="payment-item-info">
                      <span className={`payment-item-tag ${item.isVeg ? 'veg' : 'non-veg'}`}></span>
                      <span className="payment-item-name">{item.name}</span>
                      <span className="payment-item-qty">×{item.quantity}</span>
                    </div>
                    <span className="payment-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="payment-price-section">
              <div className="payment-price-row">
                <span>Item Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              {selectedOffer && discount > 0 && (
                <div className="payment-price-row discount">
                  <span>Discount {selectedOffer.code && `(${selectedOffer.code})`}</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="payment-price-row">
                <span>Delivery Fee</span>
                <span>₹{finalDeliveryFee.toFixed(2)}</span>
              </div>
              
              <div className="payment-price-row">
                <span>Taxes & Charges</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              
              <div className="payment-total-row">
                <span>To Pay</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              className="payment-proceed-button" 
              onClick={() => setShowPaymentPanel(true)}
            >
              Proceed to Payment <FaArrowRight />
            </button>
            
            <div className="payment-secure-note">
              <FaLock /> Your payment information is secure
            </div>
          </div>
        </div>
        
        {/* Right Panel - Payment Methods (Slides in) */}
        <div className={`payment-methods-slide ${showPaymentPanel ? 'active' : ''}`}>
          <div className="payment-methods-header">
            <button className="payment-methods-close" onClick={() => setShowPaymentPanel(false)}>
              <FaTimes />
            </button>
            <h2>Select Payment Method</h2>
            <p>Total: ₹{totalAmount.toFixed(2)}</p>
          </div>
          
          <div className="payment-methods-tabs">
            <div 
              className={`payment-method-tab ${activeMethod === 'card' ? 'active' : ''}`} 
              onClick={() => setActiveMethod('card')}
            >
              <div className="payment-method-icon">
                <FaCreditCard />
              </div>
              <div className="payment-method-label">Credit / Debit Card</div>
            </div>
            
            <div 
              className={`payment-method-tab ${activeMethod === 'upi' ? 'active' : ''}`} 
              onClick={() => setActiveMethod('upi')}
            >
              <div className="payment-method-icon">
                <FaMobileAlt />
              </div>
              <div className="payment-method-label">UPI Payment</div>
            </div>
            
            <div 
              className={`payment-method-tab ${activeMethod === 'cash' ? 'active' : ''}`} 
              onClick={() => setActiveMethod('cash')}
            >
              <div className="payment-method-icon">
                <FaMoneyBillWave />
              </div>
              <div className="payment-method-label">Cash On Delivery</div>
            </div>
          </div>
          
          <div className="payment-method-content">
            {activeMethod === 'card' && (
              <div className="card-payment-form">
                <div className="payment-card-icons">
                  <div className="payment-card-icon">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png" alt="Visa" />
                  </div>
                  <div className="payment-card-icon">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" />
                  </div>
                  <div className="payment-card-icon">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" alt="American Express" />
                  </div>
                  <div className="payment-card-icon">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/0f/RuPay-Logo.png" alt="RuPay" />
                  </div>
                </div>
                
                <div className="payment-form-group">
                  <label>Card Number</label>
                  <input 
                    type="text" 
                    placeholder="1234 5678 9012 3456" 
                    className="payment-input" 
                    value={cardNumber} 
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength="19"
                  />
                </div>
                
                <div className="payment-form-row">
                  <div className="payment-form-group">
                    <label>Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      className="payment-input" 
                      value={expiryDate} 
                      onChange={(e) => setExpiryDate(e.target.value)}
                      maxLength="5"
                    />
                  </div>
                  <div className="payment-form-group">
                    <label>CVV</label>
                    <input 
                      type="password" 
                      placeholder="123" 
                      className="payment-input" 
                      value={cvv} 
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength="3"
                    />
                  </div>
                </div>
                
                <div className="payment-form-group">
                  <label>Name on Card</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="payment-input" 
                    value={cardName} 
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            {activeMethod === 'upi' && (
              <div className="upi-payment-form">
                <div className="upi-apps-container">
                  <h3>Select UPI App</h3>
                  <div className="upi-apps-grid">
                    <div 
                      className={`upi-app ${selectedUpi === 'gpay' ? 'active' : ''}`} 
                      onClick={() => setSelectedUpi('gpay')}
                    >
                      <div className="upi-app-icon">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/1200px-Google_Pay_Logo_%282020%29.svg.png" alt="Google Pay" />
                      </div>
                      <div className="upi-app-name">Google Pay</div>
                    </div>
                    
                    <div 
                      className={`upi-app ${selectedUpi === 'phonepe' ? 'active' : ''}`} 
                      onClick={() => setSelectedUpi('phonepe')}
                    >
                      <div className="upi-app-icon">
                        <img src="https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png" alt="PhonePe" />
                      </div>
                      <div className="upi-app-name">PhonePe</div>
                    </div>
                    
                    <div 
                      className={`upi-app ${selectedUpi === 'paytm' ? 'active' : ''}`} 
                      onClick={() => setSelectedUpi('paytm')}
                    >
                      <div className="upi-app-icon">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/42/Paytm_logo.png" alt="Paytm" />
                      </div>
                      <div className="upi-app-name">Paytm</div>
                    </div>
                    
                    <div 
                      className={`upi-app ${selectedUpi === 'bhim' ? 'active' : ''}`} 
                      onClick={() => setSelectedUpi('bhim')}
                    >
                      <div className="upi-app-icon">
                        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/BHIM_logo.png/220px-BHIM_logo.png" alt="BHIM" />
                      </div>
                      <div className="upi-app-name">BHIM</div>
                    </div>
                  </div>
                </div>
                
                <div className="upi-id-container">
                  <div className="payment-form-group">
                    <label>UPI ID</label>
                    <input 
                      type="text" 
                      placeholder="username@upi" 
                      className="payment-input" 
                      value={upiId} 
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeMethod === 'cash' && (
              <div className="cash-payment-info">
                <div className="cash-info-box">
                  <div className="cash-info-icon"><FaInfoCircle /></div>
                  <div className="cash-info-content">
                    <p>Pay with cash at the time of delivery.</p>
                    <p>Our delivery person will carry change for up to ₹500.</p>
                  </div>
                </div>
                <div className="cash-terms">
                  <p><FaCheck /> Keep exact change ready to ensure contactless delivery</p>
                  <p><FaCheck /> Order will be handed over only upon payment</p>
                </div>
              </div>
            )}
          </div>
          
          <button 
            className={`payment-submit-button ${!isPaymentValid() ? 'disabled' : ''}`} 
            onClick={handlePayment}
            disabled={!isPaymentValid()}
          >
            Pay ₹{totalAmount.toFixed(2)} <FaArrowRight />
          </button>
          
          <div className="payment-security-note">
            <FaLock /> Secure Payment | <FaShieldAlt /> Your data is protected
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;