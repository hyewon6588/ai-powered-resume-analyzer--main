import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ children, isLoggedIn, userRole, allowedRoles }) => {
  console.log('isLoggedIn:', isLoggedIn);
  console.log('userRole:', userRole);
  console.log('allowedRoles:', allowedRoles);
  
  if (!isLoggedIn) {
    alert('Access Denied: You must be logged in to access this page.');
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    alert('Access Denied: You do not have the required role to access this page.');
    return <Navigate to="/" />;
  }

  return children;
};

export default RoleBasedRoute;
