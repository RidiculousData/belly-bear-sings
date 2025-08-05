import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Detect Safari
  const isSafari = typeof window !== 'undefined' && (
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  );

  // Check if this is a participant page
  const isParticipantPage = location.pathname.startsWith('/participant/');

  console.log('ProtectedRoute - Auth check:', {
    user: !!user,
    loading,
    isSafari,
    isParticipantPage,
    pathname: location.pathname
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Allow participant page to handle its own authentication
  if (isParticipantPage) {
    return <>{children}</>;
  }

  if (!user) {
    console.log('ProtectedRoute - Redirecting to home page');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}; 