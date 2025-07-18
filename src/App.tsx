
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import AppLayout from "@/components/layout/AppLayout";
import AuthSyncProvider from "@/components/AuthSyncProvider";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { initGA, trackPageView } from "@/utils/analytics";
import WelcomeScreen from "@/components/WelcomeScreen";
import ProfileOnboarding from "@/components/ProfileOnboarding";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

// Import new pages
import ProfilePage from "./pages/ProfilePage";
import CarsPage from "./pages/CarsPage";
import EditProfilePage from "./pages/EditProfilePage";
import ProfileMenuPage from "./pages/ProfileMenuPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProAnalyticsPage from "./pages/ProAnalyticsPage";
import CarInsightsPage from "./pages/CarInsightsPage";
import AddCarPage from "./pages/AddCarPage";
import CarDetailsPage from "./pages/CarDetailsPage";
import CarGalleryPage from "./pages/CarGalleryPage";
import EditCarPage from "./pages/EditCarPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import PublicCarDetailsPage from "./pages/PublicCarDetailsPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminRoute from "./components/admin/AdminRoute";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminContentPage from "./pages/admin/AdminContentPage";
import AdminOperationsPage from "./pages/admin/AdminOperationsPage";

const queryClient = new QueryClient();

// Inner component to use hooks that require auth context
const AppContent = () => {
  const { isSignedIn } = useUser();
  
  return (
    <BrowserRouter>
      <RouteTracker />
      {/* Show the onboarding component for signed-in users */}
      {isSignedIn && <ProfileOnboarding />}
      
      {/* Use AppLayout for authenticated routes, except special cases */}
      <Routes>
        {/* Show profile page if user is signed in, otherwise show landing page */}
        <Route path="/" element={isSignedIn ? <ProfilePage /> : <Index />} />
        {/* Welcome screen still available at this route */}
        <Route path="/welcome" element={isSignedIn ? <WelcomeScreen /> : <Navigate to="/" />} />
        
        {/* Authentication routes */}
        <Route path="/sign-in/*" element={<SignIn />} />
        <Route path="/sign-up/*" element={<SignUp />} />
        
        {/* App feature routes - protected by authentication */}
        {isSignedIn && (
          <>
            <Route path="/profile" element={<AppLayout><ProfilePage /></AppLayout>} />
            <Route path="/profile/edit" element={<AppLayout><EditProfilePage /></AppLayout>} />
            <Route path="/profile/menu" element={<AppLayout><ProfileMenuPage /></AppLayout>} />
            <Route path="/add-car" element={<AppLayout><AddCarPage /></AppLayout>} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/analytics/pro" element={<ProAnalyticsPage />} />
            <Route path="/analytics/car/:carId" element={<CarInsightsPage />} />
            <Route path="/cars" element={<AppLayout><CarsPage /></AppLayout>} />
            <Route path="/car/:id" element={<AppLayout><CarDetailsPage /></AppLayout>} />
            <Route path="/car/:id/gallery" element={<AppLayout><CarGalleryPage /></AppLayout>} />
            <Route path="/edit-car/:id" element={<AppLayout><EditCarPage /></AppLayout>} />

            {/* Admin Route */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AppLayout>
                    <AdminDashboardPage />
                  </AppLayout>
                </AdminRoute>
              }
            >
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="content" element={<AdminContentPage />} />
              <Route path="operations" element={<AdminOperationsPage />} />
            </Route>
          </>
        )}
        
        {/* Public Profile Pages - accessible to all users */}
        <Route path="/u/:username" element={<PublicProfilePage />} />
        <Route path="/u/:username/car/:id" element={<PublicCarDetailsPage />} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

// Route tracker component to track page views
const RouteTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Track page view whenever the location changes
    trackPageView(location.pathname + location.search);
  }, [location]);
  
  return null;
};

// Main App component
const App = () => {
  // Initialize Google Analytics when the app loads
  useEffect(() => {
    initGA();
  }, []);
  
  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="carfolio-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthSyncProvider>
          <AppContent />
        </AuthSyncProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
