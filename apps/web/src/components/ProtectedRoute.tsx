import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRole: string;
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole, children }) => {
  const userStr = localStorage.getItem('kohalock_user');

  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    if (user.role !== allowedRole) {
      return <Navigate to={`/${user.role}`} replace />;
    }
  } catch (error) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
