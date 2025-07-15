import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChevronLeft, Loader, Car, Eye, MousePointer, Users, Clock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import ResponsiveLayout from "../components/layout/ResponsiveLayout";
import { formatDistanceToNow } from "date-fns";

// Define filter periods
const PERIODS = {
  LAST_7_DAYS: "7 days",
  LAST_30_DAYS: "30 days",
  CUSTOM: "custom",
} as const;

type PeriodType = typeof PERIODS[keyof typeof PERIODS];

// Define type for analytics data returned from Convex
interface AnalyticsData {
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
    other: number;
  };
  geoBreakdown?: Record<string, number>;
  referrers?: Record<string, number>;
}

// Define car type
interface Car {
  _id: any;
  _creationTime: number;
  userId: string;
  make: string;
  model: string;
  year: number;
  power?: string;
  isPublished: boolean;
  images?: string[];
  description?: string;
  trim?: string;
  engine?: string;
  parts?: any[];
  createdAt?: string;
  updatedAt?: string;
  torque?: number;
  order?: number;
}

const CarInsightsPageContent = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { carId } = useParams<{ carId: string }>();
  const [period, setPeriod] = useState<PeriodType>(PERIODS.LAST_30_DAYS);
  const [userId, setUserId] = useState<string | null>(null);

  // Get the user's Convex ID first to avoid user ID mismatch errors
  const profile = useQuery(api.users.getProfile, { clerkId: user?.id ?? "" } as any);
  
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

  // Fetch car details
  const car = useQuery(
    api.cars.getCarById,
    carId ? { carId: carId as any } : undefined
  ) as Car | undefined;

  if (!user) {
    return <div className="p-4 text-white">Please sign in to view analytics.</div>;
  }

  if (!profile || analytics === undefined || car === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Get car-specific analytics data
  const carViews = (analytics as AnalyticsData).carViews?.[carId!] || 0;
  const percentOfTotalViews = analytics.totalCarViews > 0 
    ? ((carViews / analytics.totalCarViews) * 100).toFixed(1) 
    : "0";

  // Calculate product clicks for this car
  const productClicks = car.parts?.reduce((total, partId) => {
    const partIdStr = partId.toString();
    const clicks = (analytics as AnalyticsData).productClicks?.[partIdStr] || 0;
    return total + clicks;
  }, 0) || 0;

  // Click-through rate
  const ctr = carViews > 0 ? ((productClicks / carViews) * 100).toFixed(1) : "0";

  // Get daily views trend for this car (if available)
  // In a full implementation, we would have a dedicated getCarAnalytics query
  // For now, we'll show the overall trend as a placeholder

  return (
    <>
      {/* Top bar */}
      <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
        <button onClick={() => navigate("/analytics/pro")} className="flex items-center text-slate-200 hover:text-white">
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Back to Pro Analytics</span>
        </button>
        
        <h1 className="text-xl font-semibold text-white">Car Insights</h1>
        
        <div className="w-10"></div>
      </div>

      {/* Main content */}
      <div className="flex flex-col p-4 max-w-4xl mx-auto w-full">
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

        {/* Car header */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 mb-6">
          <div className="flex items-center">
            {car.images && car.images[0] ? (
              <div className="w-20 h-20 mr-4 rounded overflow-hidden">
                <img 
                  src={car.images[0]} 
                  alt={`${car.year} ${car.make} ${car.model}`}
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              <div className="w-20 h-20 mr-4 bg-slate-700 rounded flex items-center justify-center">
                <Car className="h-10 w-10 text-slate-500" />
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-semibold text-white">
                {car.year} {car.make} {car.model}
              </h2>
              <p className="text-slate-400">
                {car.trim ? `${car.trim} trim` : ""}
                {car.trim && car.engine ? " • " : ""}
                {car.engine || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Performance metrics */}
        <section>
          <h3 className="text-lg font-semibold text-white mb-3">Performance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Views */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <div className="text-sm font-medium text-slate-400 mb-1">Views</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-2xl font-bold text-white">{carViews}</div>
                  <p className="text-xs text-slate-400">Last {period}</p>
                </div>
                <Eye className="h-5 w-5 text-blue-400" />
              </div>
            </div>

            {/* Product Clicks */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <div className="text-sm font-medium text-slate-400 mb-1">Product Clicks</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-2xl font-bold text-white">{productClicks}</div>
                  <p className="text-xs text-slate-400">Last {period}</p>
                </div>
                <MousePointer className="h-5 w-5 text-blue-400" />
              </div>
            </div>

            {/* Click Through Rate */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <div className="text-sm font-medium text-slate-400 mb-1">CTR</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-2xl font-bold text-white">{ctr}%</div>
                  <p className="text-xs text-slate-400">Clicks / Views</p>
                </div>
                <Users className="h-5 w-5 text-blue-400" />
              </div>
            </div>

            {/* % of Total Views */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <div className="text-sm font-medium text-slate-400 mb-1">% of Total Views</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-2xl font-bold text-white">{percentOfTotalViews}%</div>
                  <p className="text-xs text-slate-400">All cars</p>
                </div>
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Product performance section */}
        <section className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Product Performance</h3>
          {car.parts && car.parts.length > 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Clicks</th>
                    <th className="pb-2">% of Car Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {car.parts.map((partId) => {
                    const partIdStr = partId.toString();
                    const partClicks = (analytics as AnalyticsData).productClicks?.[partIdStr] || 0;
                    const percentOfCarClicks = productClicks > 0 
                      ? ((partClicks / productClicks) * 100).toFixed(1)
                      : "0";

                    // Ideally, we would fetch part details here
                    // For now, just show the part ID
                    return (
                      <tr key={partIdStr} className="border-b border-slate-700 hover:bg-slate-750">
                        <td className="py-3 text-white">Part ID: {partIdStr.slice(0, 6)}...</td>
                        <td className="py-3 text-white">{partClicks}</td>
                        <td className="py-3 text-white">{percentOfCarClicks}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 p-5 rounded-lg text-center">
              <MousePointer className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400">No product data available for this car</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

// Wrap the insights content in ResponsiveLayout for navigation
const CarInsightsPage = () => {
  return (
    <ResponsiveLayout>
      <div className="flex flex-col min-h-screen bg-slate-900 text-slate-50">
        <CarInsightsPageContent />
      </div>
    </ResponsiveLayout>
  );
};

export default CarInsightsPage;
