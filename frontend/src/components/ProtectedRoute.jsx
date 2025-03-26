import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  // Get auth state from localStorage
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');
  
  console.log('Protected route check:', { isAuthenticated, userRole, requiredRole: role });
  
  if (!isAuthenticated) {
    // Not authenticated at all
    return <Navigate to="/login" replace />;
  }
  
  // If a specific role is required, check it
  if (role && userRole !== role) {
    // User is authenticated but with wrong role
    console.log('Role mismatch, redirecting');
    return <Navigate to={role === 'delivery_partner' ? '/delivery/login' : '/login'} replace />;
  }
  
  // User is authenticated and has the right role (or no specific role required)
  return children;
};

export default ProtectedRoute;