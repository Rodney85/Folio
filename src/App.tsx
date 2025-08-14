
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
import { initGA, trackPageView } from "@/utils/analytics";
import WelcomeScreen from "@/components/WelcomeScreen";
import ProfileOnboarding from "@/components/ProfileOnboarding";
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
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const ProAnalyticsPage = lazy(() => import("./pages/ProAnalyticsPage"));
const CarInsightsPage = lazy(() => import("./pages/CarInsightsPage"));
const AddCarPage = lazy(() => import("./pages/AddCarPage"));
const CarDetailsPage = lazy(() => import("./pages/CarDetailsPage"));
const CarGalleryPage = lazy(() => import("./pages/CarGalleryPage"));
const EditCarPage = lazy(() => import("./pages/EditCarPage"));
const AddModPage = lazy(() => import("./pages/AddModPage"));
const ShopBuildPage = lazy(() => import("./pages/ShopBuildPage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));
const PublicCarDetailsPage = lazy(() => import("./pages/PublicCarDetailsPage"));

// Lazy load admin pages
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminRoute = lazy(() => import("./components/admin/AdminRoute"));
const AdminOverviewPage = lazy(() => import("./pages/admin/AdminOverviewPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminContentPage = lazy(() => import("./pages/admin/AdminContentPage"));
const AdminOperationsPage = lazy(() => import("./pages/admin/AdminOperationsPage"));

const queryClient = new QueryClient();

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Inner component to use hooks that require auth context
const AppContent = () => {
  const { isSignedIn } = useUser();
  
  return (
    <BrowserRouter>
      <RouteTracker />
      {/* Show the onboarding component for signed-in users */}
      {isSignedIn && <ProfileOnboarding />}
      
      {/* Use AppLayout for authenticated routes, except special cases */}
      <AnimatePresence mode="wait">
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
        
        {/* App feature routes - protected by authentication */}
        {isSignedIn && (
          <>
            <Route path="/profile" element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <ProfilePage />
                </Suspense>
              </AppLayout>
            } />
            <Route path="/profile/edit" element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <EditProfilePage />
                </Suspense>
              </AppLayout>
            } />
            <Route path="/profile/menu" element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <ProfileMenuPage />
                </Suspense>
              </AppLayout>
            } />
            <Route path="/add-car" element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <AddCarPage />
                </Suspense>
              </AppLayout>
            } />
            <Route path="/analytics" element={
              <Suspense fallback={<PageLoader />}>
                <AnalyticsPage />
              </Suspense>
            } />
            <Route path="/analytics/pro" element={
              <Suspense fallback={<PageLoader />}>
                <ProAnalyticsPage />
              </Suspense>
            } />
            <Route path="/analytics/car/:carId" element={
              <Suspense fallback={<PageLoader />}>
                <CarInsightsPage />
              </Suspense>
            } />
            <Route path="/cars" element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <CarsPage />
                </Suspense>
              </AppLayout>
            } />
            <Route path="/car/:id" element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <CarDetailsPage />
                </Suspense>
              </AppLayout>
            } />
            <Route path="/car/:id/gallery" element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <CarGalleryPage />
                </Suspense>
              </AppLayout>
            } />
            <Route path="/edit-car/:id" element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <EditCarPage />
                </Suspense>
              </AppLayout>
            } />
            <Route path="/car/:id/add-mod" element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <AddModPage />
                </Suspense>
              </AppLayout>
            } />
            <Route path="/car/:id/shop-build" element={
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <ShopBuildPage />
                </Suspense>
              </AppLayout>
            } />

            {/* Admin Route */}
            <Route 
              path="/admin" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminRoute>
                    <AppLayout>
                      <AdminDashboardPage />
                    </AppLayout>
                  </AdminRoute>
                </Suspense>
              }
            >
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminOverviewPage />
                </Suspense>
              } />
              <Route path="users" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminUsersPage />
                </Suspense>
              } />
              <Route path="content" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminContentPage />
                </Suspense>
              } />
              <Route path="operations" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminOperationsPage />
                </Suspense>
              } />
            </Route>
          </>
        )}
        
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
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          </PageTransition>
        } />
        </Routes>
      </AnimatePresence>
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
