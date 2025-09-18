import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoaded } = useUser();


  if (!isLoaded) {
    // Handle loading state, you can show a spinner here
    return <div>Loading...</div>;
  }

  // Check if the user is signed in and has the 'admin' role
  if (!user || user.publicMetadata.role !== 'admin') {
    // If not an admin, redirect to the home page
    return <Navigate to="/" replace />;
  }

  // If the user is an admin, render the protected content
  return <>{children}</>;
};

export default AdminRoute;
