import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  // Check if user has the required role
  const userRole = localStorage.getItem('userRole');
  const hasRequiredRole = role ? userRole === role : true;
  
  if (!isAuthenticated) {
    // Redirect to appropriate login page based on required role
    if (role === 'delivery_partner') {
      return <Navigate to="/delivery/login" />;
    }
    return <Navigate to="/login" />;
  }
  
  if (role && !hasRequiredRole) {
    // Redirect user to appropriate dashboard if authenticated but wrong role
    if (userRole === 'admin') {
      return <Navigate to="/admin" />;
    } else if (userRole === 'delivery_partner') {
      return <Navigate to="/delivery/dashboard" />;
    }
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

export default ProtectedRoute;