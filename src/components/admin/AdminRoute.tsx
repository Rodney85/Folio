import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoaded } = useUser();

  // Debug logs
  console.log("Admin route check - User:", user?.id);
  console.log("Admin metadata:", user?.publicMetadata);
  console.log("Is admin role present?", user?.publicMetadata?.role === 'admin');

  if (!isLoaded) {
    // Handle loading state, you can show a spinner here
    return <div>Loading...</div>;
  }

  // Check if the user is signed in and has the 'admin' role
  if (!user || user.publicMetadata.role !== 'admin') {
    console.log("Access denied - not an admin");
    // If not an admin, redirect to the home page
    return <Navigate to="/" replace />;
  }

  // If the user is an admin, render the protected content
  return <>{children}</>;
};

export default AdminRoute;
