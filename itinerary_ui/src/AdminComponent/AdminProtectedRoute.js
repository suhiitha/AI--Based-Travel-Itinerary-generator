import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const adminFlag = localStorage.getItem('adminFlag');

  if (!token || adminFlag !== 'true') {
    toast.error('Please login as admin to access this page.');
    return <Navigate to="/AdminLogin" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
