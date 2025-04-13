// src/components/auth/PublicRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Always render children, but might show login UI elements if not authenticated
  // This doesn't redirect to login for public routes
  return <>{children}</>;
};

export default PublicRoute;