import React from 'react';
import { Navigate } from 'react-router-dom';

const RequireAdmin = ({ children }) => {
  try {
    const stored = localStorage.getItem('user');
    const user = stored ? JSON.parse(stored) : null;
    if (user && user.role === 'admin') return children;
  } catch (e) {
    // ignore
  }
  return <Navigate to="/" replace />;
};

export default RequireAdmin;
