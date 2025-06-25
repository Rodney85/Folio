
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import AuthSyncProvider from "@/components/AuthSyncProvider";
import { useUser } from "@clerk/clerk-react";
import WelcomeScreen from "@/components/WelcomeScreen";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

const queryClient = new QueryClient();

// Inner component to use hooks that require auth context
const AppContent = () => {
  const { isSignedIn } = useUser();
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Show welcome screen if user is signed in, otherwise show landing page */}
        <Route path="/" element={isSignedIn ? <WelcomeScreen /> : <Index />} />
        {/* Authentication routes */}
        <Route path="/sign-in/*" element={<SignIn />} />
        <Route path="/sign-up/*" element={<SignUp />} />
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
