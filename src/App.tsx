
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { SEO } from "@/components/SEO";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import AppLayout from "@/components/layout/AppLayout";
import { FloatingNavBar } from "@/components/layout/FloatingNavBar";
import AuthSyncProvider from "@/components/AuthSyncProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useUser } from "@clerk/clerk-react";
import { useEffect, Suspense, lazy } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import { Loader2 } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";
import { AnimatePresence } from "framer-motion";
import { useSmoothScroll } from "./hooks/use-smooth-scroll";
import { GrainOverlay } from "./components/ui/effects/GrainOverlay";

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
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const ReportIssuePage = lazy(() => import("./pages/ReportIssuePage"));

const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const AccountSettingsPage = lazy(() => import("./pages/AccountSettingsPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const SubscriptionSuccessPage = lazy(() => import("./pages/SubscriptionSuccessPage"));
const AffiliatesPage = lazy(() => import("./pages/AffiliatesPage"));
import ProfileOnboarding from "./components/ProfileOnboarding";

// Admin Pages
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const AdminUsersPage = lazy(() => import("./components/admin/AdminUsersPage"));
const AdminUserDetails = lazy(() => import("./components/admin/AdminUserDetails"));
const AdminContentPage = lazy(() => import("./components/admin/AdminContentPage"));
const AdminSettingsPage = lazy(() => import("./components/admin/AdminSettingsPage"));
const AdminIssuesPage = lazy(() => import("./components/admin/AdminIssuesPage"));
const AdminAffiliatesPage = lazy(() => import("./components/admin/AdminAffiliatesPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));

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
      <ProfileOnboarding />
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
        <Route path="/account-settings" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <AccountSettingsPage />
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
        <Route path="/report-issue" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <ReportIssuePage />
            </Suspense>
          </PageTransition>
        } />
      </Routes>
    </AppLayout>
  );
};

const AppContent = () => {
  const { isSignedIn } = useUser();

  // Only enable Lenis smooth scroll on landing page (when not signed in)
  // Lenis conflicts with nested scrollable containers in the app
  useSmoothScroll(!isSignedIn);

  return (
    <BrowserRouter>
      <FloatingNavBar />
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

        {/* Explore Page - accessible to all users */}
        <Route path="/explore" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <ExplorePage />
            </Suspense>
          </PageTransition>
        } />

        {/* Subscription Pages - accessible to all users */}
        <Route path="/subscription" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <SubscriptionPage />
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

        {/* Car Access - show private page with edit/delete for signed-in users, public page for guests */}
        <Route path="/car/:id" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              {isSignedIn ? <CarDetailsPage /> : <PublicCarDetailsPage />}
            </Suspense>
          </PageTransition>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={
            <Suspense fallback={<PageLoader />}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<PageLoader />}>
              <AdminUsersPage />
            </Suspense>
          } />
          <Route path="users/:id" element={
            <Suspense fallback={<PageLoader />}>
              <AdminUserDetails />
            </Suspense>
          } />
          <Route path="content" element={
            <Suspense fallback={<PageLoader />}>
              <AdminContentPage />
            </Suspense>
          } />
          <Route path="issues" element={
            <Suspense fallback={<PageLoader />}>
              <AdminIssuesPage />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<PageLoader />}>
              <AdminSettingsPage />
            </Suspense>
          } />
          <Route path="affiliates" element={
            <Suspense fallback={<PageLoader />}>
              <AdminAffiliatesPage />
            </Suspense>
          } />
        </Route>

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

        {/* Public Info Pages */}
        <Route path="/about" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <AboutPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/terms" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <TermsPage />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/privacy" element={
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <PrivacyPage />
            </Suspense>
          </PageTransition>
        } />
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
  // Note: Lenis smooth scroll is enabled conditionally in AppContent based on auth status

  return (
    <ErrorBoundary>
      <GrainOverlay />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="carfolio-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <HelmetProvider>
              <SEO
                title="CarFolio - The Definitive Automotive Portfolio"
                description="Showcase your builds, manage modifications, and monetize your passion. CarFolio is the ultimate platform for car enthusiasts."
                image="/og-image.png"
                url="https://www.carfolio.cc"
              />
              <AuthSyncProvider>
                <AppContent />
              </AuthSyncProvider>
            </HelmetProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
