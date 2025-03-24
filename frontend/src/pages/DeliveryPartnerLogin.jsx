import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaMotorcycle, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import '../styles/Login.css'; // Reuse your existing Login styles

const DeliveryPartnerLogin = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('bike');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if already logged in as delivery partner
    const token = localStorage.getItem('deliveryPartnerToken');
    const role = localStorage.getItem('userRole');
    
    if (token && role === 'delivery_partner') {
      navigate('/delivery/dashboard');
    }
  }, [navigate]);
  
  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError(''); // Clear any errors when toggling modes
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Login flow
      const response = await axios.post('http://localhost:5000/api/auth/delivery-partner/login', {
        email,
        password
      });
      
      const { token, partner } = response.data;
      
      // Store token and user info
      localStorage.setItem('deliveryPartnerToken', token);
      localStorage.setItem('authToken', token); // For API compatibility
      localStorage.setItem('userRole', 'delivery_partner');
      localStorage.setItem('partnerId', partner._id);
      localStorage.setItem('partnerName', partner.name);
      localStorage.setItem('isAuthenticated', 'true');
      
      setLoginSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/delivery/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!phone || !/^\d{10}$/.test(phone)) {
      setError('Valid 10-digit phone number is required');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/delivery-partner/register', {
        name,
        email,
        password,
        phone,
        vehicleType
      });
      
      console.log('Registration successful:', response.data);
      
      setRegistrationSuccess(true);
      
      // Clear form fields
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      
      // Switch to sign in mode after delay
      setTimeout(() => {
        setRegistrationSuccess(false);
        setIsSignUpMode(false);
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      {loginSuccess && (
        <div className="login-success-overlay">
          <div className="success-animation">
            <div className="checkmark">✓</div>
            <div className="loading-bar"></div>
            <p>Successfully logged in!</p>
          </div>
        </div>
      )}
      
      {registrationSuccess && (
        <div className="login-success-overlay">
          <div className="success-animation">
            <div className="checkmark">✓</div>
            <div className="loading-bar"></div>
            <p>Registration successful!</p>
          </div>
        </div>
      )}
      
      <div className={`container ${isSignUpMode ? "sign-up-mode" : ""}`}>
        <div className="forms-container">
          <div className="signin-signup">
            <form onSubmit={handleSubmit} className="sign-in-form">
              <div className="delivery-logo">
                <FaMotorcycle className="motorcycle-icon" />
                <h2 className="title">Delivery Partner Login</h2>
              </div>
              
              <Link to="/login" className="back-link">
                <FaArrowLeft /> Back to user login
              </Link>
              
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="btn" disabled={isLoading}>
                {isLoading ? "Please wait..." : "Sign in"}
              </button>
            </form>
            
            <form onSubmit={handleSignUp} className="sign-up-form">
              <div className="delivery-logo">
                <FaMotorcycle className="motorcycle-icon" />
                <h2 className="title">Become a Delivery Partner</h2>
              </div>
              
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number (10 digits)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                pattern="[0-9]{10}"
                required
              />
              <div className="vehicle-selector">
                <label>Vehicle Type:</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  required
                >
                  <option value="bike">Motorcycle/Scooter</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="car">Car</option>
                </select>
              </div>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="btn" disabled={isLoading}>
                {isLoading ? "Please wait..." : "Sign up"}
              </button>
            </form>
          </div>
        </div>
        
        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>Want to join our team?</h3>
              <p>Sign up as a delivery partner and start earning today!</p>
              <button className="btn transparent" onClick={toggleMode}>Sign up</button>
            </div>
            <img src="/img/delivery-partner.svg" className="image" alt="" />
          </div>
          <div className="panel right-panel">
            <div className="content">
              <h3>Already a partner?</h3>
              <p>Sign in to continue delivering with us!</p>
              <button className="btn transparent" onClick={toggleMode}>Sign in</button>
            </div>
            <img src="/img/delivery-login.svg" className="image" alt="" />
          </div>
        </div>
      </div>
    </>
  );
};

export default DeliveryPartnerLogin;