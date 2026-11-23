import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { authed } = useAuth();
  if (!authed) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
