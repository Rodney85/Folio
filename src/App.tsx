
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import AppLayout from "@/components/layout/AppLayout";
import AuthSyncProvider from "@/components/AuthSyncProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useUser } from "@clerk/clerk-react";
import { useEffect, Suspense, lazy } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import { Loader2 } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";
import { AnimatePresence } from "framer-motion";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CarsPage = lazy(() => import("./pages/CarsPage"));
const EditProfilePage = lazy(() => import("./pages/EditProfilePage"));
const ProfileMenuPage = lazy(() => import("./pages/ProfileMenuPage"));
const AddCarPage = lazy(() => import("./pages/AddCarPage"));
const CarDetailsPage = lazy(() => import("./pages/CarDetailsPage"));
const CarGalleryPage = lazy(() => import("./pages/CarGalleryPage"));
const EditCarPage = lazy(() => import("./pages/EditCarPage"));
const AddModPage = lazy(() => import("./pages/AddModPage"));
const ShopBuildPage = lazy(() => import("./pages/ShopBuildPage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));
const PublicCarDetailsPage = lazy(() => import("./pages/PublicCarDetailsPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const SubscriptionSuccessPage = lazy(() => import("./pages/SubscriptionSuccessPage"));
const DodoPaymentsTestPage = lazy(() => import("./components/ui/DodoPaymentsTestPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));

const queryClient = new QueryClient();

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Wrapper component for authenticated routes with AppLayout
const AuthenticatedRoutes = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/profile" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/profile/edit" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <EditProfilePage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/profile/menu" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <ProfileMenuPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/subscription" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <SubscriptionPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/analytics" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <AnalyticsPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/subscription/success" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <SubscriptionSuccessPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/test-dodo-payments" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <DodoPaymentsTestPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/add-car" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <AddCarPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/cars" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <CarsPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/car/:id" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <CarDetailsPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/car/:id/gallery" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <CarGalleryPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/edit-car/:id" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <EditCarPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/car/:id/add-mod" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <AddModPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/car/:id/shop-build" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <ShopBuildPage />
            </Suspense>
          </PageTransition>
        } />
      </Routes>
    </AppLayout>
  );
};

const AppContent = () => {
  const { isSignedIn } = useUser();

  return (
    <BrowserRouter>
      <Routes>
        {/* Show profile page if user is signed in, otherwise show landing page */}
        <Route path="/" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              {isSignedIn ? <ProfilePage /> : <Index />}
            </Suspense>
          </PageTransition>
        } />
        {/* Welcome screen still available at this route */}
        <Route path="/welcome" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              {isSignedIn ? <WelcomeScreen /> : <Navigate to="/" />}
            </Suspense>
          </PageTransition>
        } />

        {/* Authentication routes */}
        <Route path="/sign-in/*" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <SignIn />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/sign-up/*" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <SignUp />
            </Suspense>
          </PageTransition>
        } />

        {/* App feature routes - protected by authentication - wrapped in AppLayout */}
        {isSignedIn && <Route path="/*" element={<AuthenticatedRoutes />} />}

        {/* Public Profile Pages - accessible to all users */}
        <Route path="/u/:username" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <PublicProfilePage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/u/:username/car/:id" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <PublicCarDetailsPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/u/:username/car/:id/shop-build" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <ShopBuildPage />
            </Suspense>
          </PageTransition>
        } />

        {/* Public Car Access - direct car links without username */}
        <Route path="/car/:id" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <PublicCarDetailsPage />
            </Suspense>
          </PageTransition>
        } />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </PageTransition>
        } />
      </Routes>
    </BrowserRouter>
  );
};

// Main App component
const App = () => {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default App;
