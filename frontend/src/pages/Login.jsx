import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaMotorcycle } from 'react-icons/fa';
import axios from "axios";
import "../styles/Login.css";

// Remove the mock loginUser function and replace with the real API call
const loginUser = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    return { 
      success: true, 
      token: response.data.token,
      userId: response.data.userId 
    };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Login failed' 
    };
  }
};

const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'Admin'
};


const Login = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError(""); // Clear any errors when toggling modes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (isAdminMode) {
      // Admin login logic - can be hardcoded credentials or an admin API endpoint
      if (email === 'admin@gmail.com' && password === 'Admin') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('foodAppAdminToken', 'admin-token');
        
        setLoginSuccess(true);
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1500);
      } else {
        setError('Invalid admin credentials');
        setIsLoading(false);
      }
    } else {
      // User login with real API
      const result = await loginUser(email, password);
      
      if (result.success) {
        // For demo/development, also store a user in the foodAppUsers structure
        const storedUsers = localStorage.getItem('foodAppUsers');
        let users = [];
        
        if (storedUsers) {
          users = JSON.parse(storedUsers);
        } else {
          users = [];
        }
        
        // Check if this user exists in our local store
        let userFound = users.find(u => u.email === email);
        
        if (!userFound) {
          // Create a new user entry if not found
          userFound = {
            id: result.userId || Date.now().toString(),
            email: email,
            name: email.split('@')[0], // Default name from email if not available
            phoneNumber: ''
          };
          users.push(userFound);
          localStorage.setItem('foodAppUsers', JSON.stringify(users));
        }
        
        // Store user info
        localStorage.setItem('foodAppToken', result.token);
        
        // IMPORTANT: Also store the token with the 'authToken' key for API functions
        localStorage.setItem('authToken', result.token);
        
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'user');
        localStorage.setItem('userId', userFound.id);
        
        // Store for easy access in components
        localStorage.setItem('userName', userFound.name);
        localStorage.setItem('userEmail', email);
        
        // Store structured user object
        const userData = {
          id: userFound.id,
          name: userFound.name,
          email: email,
          phoneNumber: userFound.phoneNumber || '',
          favoriteRestaurants: userFound.favoriteRestaurants || []
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        setLoginSuccess(true);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
        setIsLoading(false);
      }
    }
  };

  // Update handleSignUp in Login.js
const handleSignUp = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Registration successful');
      
      // Store user in local storage for demo/development
      const storedUsers = localStorage.getItem('foodAppUsers');
      let users = [];
      
      if (storedUsers) {
        users = JSON.parse(storedUsers);
      }
      
      users.push({
        id: data.userId || Date.now().toString(),
        name: name,
        email: email,
        password: password, // Note: In real app, only store hashed on server
        phoneNumber: '',
        favoriteRestaurants: []
      });
      
      localStorage.setItem('foodAppUsers', JSON.stringify(users));
      
      // Also store individual items for immediate use after login
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      
      setRegistrationSuccess(true); // Show success animation
      // Clear form fields
      setName('');
      setEmail('');
      setPassword('');
      
      // Switch to sign in mode after delay
      setTimeout(() => {
        setRegistrationSuccess(false);
        setIsSignUpMode(false);
      }, 1500);
    } else {
      setError(data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    setError('Registration failed. Please try again.');
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
              <h2 className="title">{isAdminMode ? 'Admin Login' : 'Sign in'}</h2>
              
              <div className="login-type-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${!isAdminMode ? 'active' : ''}`}
                  onClick={() => setIsAdminMode(false)}
                >
                  User
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${isAdminMode ? 'active' : ''}`}
                  onClick={() => setIsAdminMode(true)}
                >
                  Admin
                </button>
              </div>

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
              <div className="additional-options">
                <p>Looking for work opportunities?</p>
                <Link to="/delivery/login" className="become-partner-btn">
                  <FaMotorcycle /> Become a Delivery Partner
                </Link>
              </div>
            </form>
            
            <form onSubmit={handleSignUp} className="sign-up-form">
              <h2 className="title">Sign up</h2>
              <input
                type="text"
                placeholder="Name"
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
              <h3>New here?</h3>
              <p>Sign up and discover great amount of new opportunities!</p>
              <button className="btn transparent" onClick={toggleMode}>Sign up</button>
            </div>
          </div>
          <div className="panel right-panel">
            <div className="content">
              <h3>One of us?</h3>
              <p>Sign in and continue your journey with us!</p>
              <button className="btn transparent" onClick={toggleMode}>Sign in</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
