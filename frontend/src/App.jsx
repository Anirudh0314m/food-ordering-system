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
import DeliveryOrders from './pages/DeliveryOrders';
import DeliveryEarnings from './pages/DeliveryEarnings';
import DeliveryAccount from './pages/DeliveryAccount';
import "./styles.css";

import { RestaurantProvider } from './context/RestaurantContext';
import { CartProvider } from './context/CartContext';
import ChatBot from './components/ChatBot';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // Add this line for role tracking
  const [loading, setLoading] = useState(true);

  // Improved checkAuthentication function that returns role info
  const checkAuthentication = () => {
    const token = localStorage.getItem('foodAppToken') || localStorage.getItem('authToken');
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole');
    
    console.log('Auth check:', { isAuth, role, hasToken: !!token });
    
    if (isAuth && token) {
      return { isAuthenticated: true, userRole: role };
    } else {
      // Clear any invalid tokens
      localStorage.removeItem('foodAppToken');
      localStorage.removeItem('authToken');
      localStorage.removeItem('foodAppAdminToken');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      return { isAuthenticated: false, userRole: null };
    }
  };

  // Check if user is logged in on component mount
  useEffect(() => {
    const authState = checkAuthentication();
    setIsAuthenticated(authState.isAuthenticated);
    setUserRole(authState.userRole);
    setLoading(false);
  }, []);

  // Updated handleLogout function
  const handleLogout = () => {
    localStorage.removeItem('foodAppToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('foodAppAdminToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    
    setIsAuthenticated(false);
    setUserRole(null);
    
    window.location.href = '/login';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // The rest of your component with updated routes...
  return (
    <CartProvider>
      <RestaurantProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Main routes */}
              <Route 
                path="/" 
                element={
                  isAuthenticated ? 
                    (userRole === 'delivery_partner' ? 
                      <Navigate to="/delivery/dashboard" /> : 
                      <Navigate to="/dashboard" />
                    ) : 
                    <Login />
                } 
              />
              
              {/* Regular user routes */}
              <Route 
                path="/login" 
                element={
                  isAuthenticated && userRole !== 'delivery_partner' ? 
                    <Navigate to="/dashboard" /> : 
                    <Login />
                } 
              />
              
              {/* Delivery partner specific routes */}
              <Route 
                path="/delivery/login" 
                element={
                  isAuthenticated && userRole === 'delivery_partner' ? 
                    <Navigate to="/delivery/dashboard" /> : 
                    <DeliveryPartnerLogin />
                } 
              />
              
              <Route 
                path="/delivery/dashboard" 
                element={
                  <ProtectedRoute role="delivery_partner">
                    <DeliveryDashboard handleLogout={handleLogout} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/delivery/orders" 
                element={
                  <ProtectedRoute role="delivery_partner">
                    <DeliveryOrders handleLogout={handleLogout} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/delivery/earnings" 
                element={
                  <ProtectedRoute role="delivery_partner">
                    <DeliveryEarnings handleLogout={handleLogout} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/delivery/account" 
                element={
                  <ProtectedRoute role="delivery_partner">
                    <DeliveryAccount handleLogout={handleLogout} />
                  </ProtectedRoute>
                } 
              />
              
              {/* Other routes remain the same */}
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
                path="*" 
                element={<Navigate to="/" replace />} 
              />
            </Routes>
            <ChatBot />
          </div>
        </Router>
      </RestaurantProvider>
    </CartProvider>
  );
};

export default App;
