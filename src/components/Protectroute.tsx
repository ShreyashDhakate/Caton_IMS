import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  element: React.ReactNode; // Use element prop instead of children
  path: string; // Add path prop
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, path }) => {
  const { isLoggedIn } = useAuth(); // Access the authentication state

  return (
    <Route
      path={path}
      element={isLoggedIn ? element : <Navigate to="/" replace />} // Render element if logged in, otherwise redirect
    />
  );
};

export default ProtectedRoute;
