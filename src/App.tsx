
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import AuthSyncProvider from "@/components/AuthSyncProvider";
import { useUser } from "@clerk/clerk-react";
import WelcomeScreen from "@/components/WelcomeScreen";
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
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/profile/menu" element={<ProfileMenuPage />} />
            <Route path="/add-car" element={<AddCarPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/cars" element={<CarsPage />} />
            <Route path="/car/:id" element={<CarDetailsPage />} />
            <Route path="/car/:id/gallery" element={<CarGalleryPage />} />
            <Route path="/edit-car/:id" element={<EditCarPage />} />
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
