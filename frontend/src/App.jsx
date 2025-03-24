import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RestaurantsByCategory from './pages/RestaurantsByCategory';
import RestaurantDetails from './pages/RestaurantDetails';
import Register from './pages/Register';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import OrdersPage from './pages/OrdersPage';
import DeliveryPartnerLogin from './pages/DeliveryPartnerLogin';
import DeliveryDashboard from './pages/DeliveryDashboard';
import "./styles.css";

import { RestaurantProvider } from './context/RestaurantContext';
import { CartProvider } from './context/CartContext';
import ChatBot from './components/ChatBot';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add this helper function at the top level of your App component
  const checkAuthentication = () => {
    const token = localStorage.getItem('foodAppToken');
    const isAuth = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    
    console.log('Auth check:', { isAuth, userRole }); // For debugging
    
    if (isAuth === 'true') {
      return true;
    } else {
      // Clear any invalid tokens
      localStorage.removeItem('foodAppToken');
      localStorage.removeItem('foodAppAdminToken');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      return false;
    }
  };

  // Check if user is logged in on component mount
  useEffect(() => {
    const isAuth = checkAuthentication();
    setIsAuthenticated(isAuth);
    setLoading(false);
  }, []);

  // Update the handleLogout function
  const handleLogout = () => {
    // Clear all authentication tokens
    localStorage.removeItem('foodAppToken');
    localStorage.removeItem('foodAppAdminToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    
    // Update authentication state
    setIsAuthenticated(false);
    
    // Redirect to login page
    window.location.href = '/login';
  };

  // Protected route component
  const ProtectedRoute = ({ children, role }) => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <CartProvider>
      <RestaurantProvider>
        <Router>
          <div className="App">
            {!loading && (
              <Routes>
                <Route 
                  path="/" 
                  element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
                />
                <Route 
                  path="/login" 
                  element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
                />
                <Route 
                  path="/register" 
                  element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register setIsAuthenticated={setIsAuthenticated} />} 
                />
                <Route 
                  path="/dashboard" 
                  element={isAuthenticated ? <Dashboard handleLogout={handleLogout} /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/admin" 
                  element={isAuthenticated ? <AdminDashboard handleLogout={handleLogout} /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/restaurants/category/:id" 
                  element={isAuthenticated ? <RestaurantsByCategory handleLogout={handleLogout} /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/restaurants/:id" 
                  element={isAuthenticated ? <RestaurantDetails handleLogout={handleLogout} /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/cart" 
                  element={isAuthenticated ? <CartPage handleLogout={handleLogout} /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/payment" 
                  element={isAuthenticated ? <PaymentPage handleLogout={handleLogout} /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <OrdersPage handleLogout={handleLogout} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/delivery/login" 
                  element={<DeliveryPartnerLogin />} 
                />
                <Route 
                  path="/delivery/dashboard" 
                  element={
                    <ProtectedRoute role="delivery_partner">
                      <DeliveryDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="*" 
                  element={<Navigate to="/" replace />} 
                />
              </Routes>
            )}
            <ChatBot /> {/* Make sure this is here */}
          </div>
        </Router>
      </RestaurantProvider>
    </CartProvider>
  );
};

export default App;
