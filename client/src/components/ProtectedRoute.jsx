import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#06110d',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div 
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(18, 183, 106, 0.2)',
              borderTopColor: '#12b76a',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          <span style={{ fontSize: '0.9rem', letterSpacing: '0.05em', color: '#a3a3a3' }}>
            SECURE CHECK...
          </span>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and save location path for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // User role is not authorized for this route, redirect to their authorized landing dashboard
    const defaultDest = user?.role === 'brand' ? '/brand-dashboard' : user?.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={defaultDest} replace />;
  }

  return children;
};
