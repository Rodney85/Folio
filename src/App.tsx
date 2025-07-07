
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import AppLayout from "@/components/layout/AppLayout";
import AuthSyncProvider from "@/components/AuthSyncProvider";
import { useUser } from "@clerk/clerk-react";
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
import AddCarPage from "./pages/AddCarPage";
import CarDetailsPage from "./pages/CarDetailsPage";
import CarGalleryPage from "./pages/CarGalleryPage";
import EditCarPage from "./pages/EditCarPage";

const queryClient = new QueryClient();

// Inner component to use hooks that require auth context
const AppContent = () => {
  const { isSignedIn } = useUser();
  
  return (
    <BrowserRouter>
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
            <Route path="/analytics" element={<AppLayout><AnalyticsPage /></AppLayout>} />
            <Route path="/cars" element={<AppLayout><CarsPage /></AppLayout>} />
            <Route path="/car/:id" element={<AppLayout><CarDetailsPage /></AppLayout>} />
            <Route path="/car/:id/gallery" element={<AppLayout><CarGalleryPage /></AppLayout>} />
            <Route path="/edit-car/:id" element={<AppLayout><EditCarPage /></AppLayout>} />
          </>
        )}
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

// Main App component
const App = () => (
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

export default App;
