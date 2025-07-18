import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChevronLeft, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import AnalyticsSummary from "../components/analytics/AnalyticsSummary";
import CarViewsAnalytics from "../components/analytics/CarViewsAnalytics";
import ProductClicksAnalytics from "../components/analytics/ProductClicksAnalytics";
import TrendAnalytics from "../components/analytics/TrendAnalytics";
import ResponsiveLayout from "../components/layout/ResponsiveLayout";

// Define filter periods
const PERIODS = {
  LAST_7_DAYS: "7 days",
  LAST_30_DAYS: "30 days",
  CUSTOM: "custom",
};

const AnalyticsPageContent = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<string>(PERIODS.LAST_30_DAYS);
  const [convexUserId, setConvexUserId] = useState<string>("");
  
  // First, get the user's Convex ID
  const userProfile = useQuery(api.users.getProfile);
  
  // Set the Convex user ID when the profile is loaded
  useEffect(() => {
    if (userProfile && userProfile._id) {
      setConvexUserId(userProfile._id);
    }
  }, [userProfile]);
  
  // Get analytics data based on selected period and Convex user ID
  const analytics = useQuery(
    api.analytics.getAnalyticsSummary, 
    convexUserId ? {
      userId: convexUserId, // Use Convex ID instead of Clerk ID
      last7Days: period === PERIODS.LAST_7_DAYS,
      last30Days: period === PERIODS.LAST_30_DAYS,
    } : "skip" // Skip query until we have the Convex user ID
  );



  // Loading state
  if (userProfile === undefined || analytics === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show all starter analytics features
  const hasStarterAccess = true;

  return (
    <>

      {/* Top space for mobile - white background */}
      <div className="h-14 bg-white w-full"></div>
      
      {/* Main content */}
      <div className="flex flex-col p-4 md:p-6 lg:p-8 max-w-3xl md:max-w-4xl lg:max-w-6xl mx-auto w-full">
        {/* Period selector */}
        <div className="flex gap-2 md:gap-4 mb-6 overflow-x-auto pb-2">
          {Object.values(PERIODS).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-full text-sm ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Analytics content */}
        <div className="space-y-8 md:space-y-10 lg:space-y-12">
          {/* Summary section - available to all users */}
          <AnalyticsSummary analytics={analytics} period={period} />
          
          {/* Last activity */}
          {analytics && analytics.lastActivityTimestamp && (
            <div className="text-sm text-slate-400">
              Last activity: {new Date(analytics.lastActivityTimestamp).toLocaleString()}
            </div>
          )}
          

          
          {/* Basic analytics - require Starter plan */}
          <CarViewsAnalytics analytics={analytics} />
          <ProductClicksAnalytics analytics={analytics} />
          <TrendAnalytics analytics={analytics} />
        </div>
      </div>
    </>
  );
};

// Wrap the analytics content in the ResponsiveLayout for navigation
const AnalyticsPage = () => {
  return (
    <ResponsiveLayout>
      <div className="flex flex-col min-h-screen bg-slate-900 text-slate-50">
        <AnalyticsPageContent />
      </div>
    </ResponsiveLayout>
  );
};

export default AnalyticsPage;
