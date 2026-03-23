
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { SEO } from "@/components/SEO";
import { PostHogProvider } from "@/components/PostHogProvider";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import AppLayout from "@/components/layout/AppLayout";
import { FloatingNavBar } from "@/components/layout/FloatingNavBar";
import AuthSyncProvider from "@/components/AuthSyncProvider";
import AffonsoTracker from "@/components/AffonsoTracker";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useUser } from "@clerk/clerk-react";
import { useEffect, Suspense, lazy } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import { Loader2 } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";
import { AnimatePresence } from "framer-motion";
import { useSmoothScroll } from "./hooks/use-smooth-scroll";
import { GrainOverlay } from "./components/ui/effects/GrainOverlay";

// Wrapper to handle dynamic import failures (e.g., when a new deploy changes chunk hashes)
const lazyWithRetry = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error('Dynamic import failed, reloading page...', error);
      window.location.reload();
      return { default: () => <div className="p-8 text-center text-slate-500">Loading module...</div> };
    }
  });

// Lazy load pages for code splitting
const Index = lazyWithRetry(() => import("./pages/Index"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const SignIn = lazyWithRetry(() => import("./pages/SignIn"));
const SignUp = lazyWithRetry(() => import("./pages/SignUp"));
const ProfilePage = lazyWithRetry(() => import("./pages/ProfilePage"));
const CarsPage = lazyWithRetry(() => import("./pages/CarsPage"));
const EditProfilePage = lazyWithRetry(() => import("./pages/EditProfilePage"));
const ProfileMenuPage = lazyWithRetry(() => import("./pages/ProfileMenuPage"));
const AddCarPage = lazyWithRetry(() => import("./pages/AddCarPage"));
const CarDetailsPage = lazyWithRetry(() => import("./pages/CarDetailsPage"));
const CarGalleryPage = lazyWithRetry(() => import("./pages/CarGalleryPage"));
const EditCarPage = lazyWithRetry(() => import("./pages/EditCarPage"));
const AddModPage = lazyWithRetry(() => import("./pages/AddModPage"));
const ShopBuildPage = lazyWithRetry(() => import("./pages/ShopBuildPage"));
const PublicProfilePage = lazyWithRetry(() => import("./pages/PublicProfilePage"));
const PublicCarDetailsPage = lazyWithRetry(() => import("./pages/PublicCarDetailsPage"));
const AnalyticsPage = lazyWithRetry(() => import("./pages/AnalyticsPage"));
const ReportIssuePage = lazyWithRetry(() => import("./pages/ReportIssuePage"));

const ExplorePage = lazyWithRetry(() => import("./pages/ExplorePage"));
const AccountSettingsPage = lazyWithRetry(() => import("./pages/AccountSettingsPage"));
const SubscriptionPage = lazyWithRetry(() => import("./pages/SubscriptionPage"));
const SubscriptionSuccessPage = lazyWithRetry(() => import("./pages/SubscriptionSuccessPage"));

import ProfileOnboarding from "./components/ProfileOnboarding";

// Admin Pages
const AdminLayout = lazyWithRetry(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazyWithRetry(() => import("./components/admin/AdminDashboard"));
const AdminUsersPage = lazyWithRetry(() => import("./components/admin/AdminUsersPage"));
const AdminUserDetails = lazyWithRetry(() => import("./components/admin/AdminUserDetails"));
const AdminContentPage = lazyWithRetry(() => import("./components/admin/AdminContentPage"));
const AdminSettingsPage = lazyWithRetry(() => import("./components/admin/AdminSettingsPage"));
const AdminIssuesPage = lazyWithRetry(() => import("./components/admin/AdminIssuesPage"));

const AdminMessagesPage = lazyWithRetry(() => import("./components/admin/AdminMessagesPage"));
const AboutPage = lazyWithRetry(() => import("./pages/AboutPage"));
const TermsPage = lazyWithRetry(() => import("./pages/TermsPage"));
const PrivacyPage = lazyWithRetry(() => import("./pages/PrivacyPage"));

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
        <Route path="/profile" element={<Navigate to="/" replace />} />
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
      {isSignedIn && <ProfileOnboarding />}
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
          <Route path="messages" element={
            <Suspense fallback={<PageLoader />}>
              <AdminMessagesPage />
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
      <AffonsoTracker />
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
              <PostHogProvider>
                <AuthSyncProvider>
                  <AppContent />
                </AuthSyncProvider>
              </PostHogProvider>
            </HelmetProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
