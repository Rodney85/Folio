import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ChevronLeft, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import ResponsiveLayout from "../components/layout/ResponsiveLayout";
import ProAnalyticsSummary from "../components/analytics/pro/ProAnalyticsSummary";
import CarViewsTable from "../components/analytics/pro/CarViewsTable";
import AudienceDemographics from "../components/analytics/pro/AudienceDemographics";

// Define analytics data interface for the Pro analytics page
// Use a type name that won't conflict with other components
interface ProAnalyticsData {
  totalProfileViews: number;
  totalCarViews: number;
  totalProductClicks: number;
  uniqueVisitors: number;
  lastActivityTimestamp: number | null;
  periodStart: number;
  periodEnd: number;
  subscriptionPlan: string;
  carViews?: Record<string, number>;
  productClicks?: Record<string, number>;
  topProducts?: Array<{partId: string; clicks: number}>;
  dailyViews?: Record<string, number>;
  viewsByDevice?: {
    desktop: number;
    mobile: number;
    tablet: number;
    other?: number;  // Making this optional to handle various backend response formats
  };
  geoBreakdown?: Record<string, number>;
  referrers?: Record<string, number>;
}

// Define filter periods
const PERIODS = {
  LAST_7_DAYS: "7 days",
  LAST_30_DAYS: "30 days",
  CUSTOM: "custom",
} as const;

type PeriodType = typeof PERIODS[keyof typeof PERIODS];

const ProAnalyticsPageContent = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodType>(PERIODS.LAST_30_DAYS);
  const [userId, setUserId] = useState<string | null>(null);

  // Get the user's Convex ID first to avoid user ID mismatch errors
  const profile = useQuery(api.users.getProfile, user?.id ? { clerkId: user.id } as any : "skip");
  
  useEffect(() => {
    if (profile) {
      setUserId(profile._id.toString());
    }
  }, [profile]);

  // Fetch analytics data with the correct Convex user ID
  const analytics = useQuery(
    api.analytics.getAnalyticsSummary,
    userId
      ? {
          userId,
          ...(period === PERIODS.LAST_7_DAYS ? { last7Days: true } : {}),
          ...(period === PERIODS.LAST_30_DAYS ? { last30Days: true } : {}),
        }
      : undefined
  );

  if (!user) {
    return <div className="p-4 text-white">Please sign in to view analytics.</div>;
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Temporary: Show Pro analytics to all users (subscription gating disabled)
  const hasProAccess = true;

  return (
    <>
      {/* Top bar */}
      <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
        <button onClick={() => navigate("/analytics")} className="flex items-center text-slate-200 hover:text-white">
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Back to Analytics</span>
        </button>
        
        <h1 className="text-xl font-semibold text-white">Pro Analytics</h1>
        
        <div className="w-10"></div>
      </div>

      {/* Main content */}
      <div className="flex flex-col p-4 max-w-5xl mx-auto w-full">
        {/* Period selector */}
        <div className="flex mb-4 bg-slate-800 rounded-lg p-1 self-end">
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              period === PERIODS.LAST_7_DAYS
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white"
            }`}
            onClick={() => setPeriod(PERIODS.LAST_7_DAYS)}
          >
            7 Days
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              period === PERIODS.LAST_30_DAYS
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:text-white"
            }`}
            onClick={() => setPeriod(PERIODS.LAST_30_DAYS)}
          >
            30 Days
          </button>
        </div>

        {analytics === undefined ? (
          <div className="flex justify-center my-8">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : hasProAccess ? (
          <>
            {/* Pro analytics content */}
            <ProAnalyticsSummary analytics={analytics as any} period={period} />
            
            {/* Last activity timestamp */}
            {analytics.lastActivityTimestamp && (
              <div className="mt-3 text-sm text-slate-400">
                Last activity: {new Date(analytics.lastActivityTimestamp).toLocaleString()}
              </div>
            )}
            
            {/* Car views table */}
            <CarViewsTable analytics={analytics as any} period={period} />
            
            {/* Audience demographics */}
            <AudienceDemographics analytics={analytics as any} />
          </>
        ) : (
          <div className="bg-slate-800 border border-blue-500 rounded-lg p-6 text-center my-8">
            <h3 className="text-xl font-semibold text-white mb-2">Upgrade to Pro</h3>
            <p className="text-slate-300 mb-4">
              Unlock advanced analytics, audience demographics, and car insights with Pro Analytics
            </p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg font-medium transition-colors">
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// Wrap the analytics content in ResponsiveLayout for navigation
const ProAnalyticsPage = () => {
  return (
    <ResponsiveLayout>
      <div className="flex flex-col min-h-screen bg-slate-900 text-slate-50">
        <ProAnalyticsPageContent />
      </div>
    </ResponsiveLayout>
  );
};

export default ProAnalyticsPage;
