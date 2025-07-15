import { EyeIcon, MousePointer, Users, Car, Share } from "lucide-react";

interface ProAnalyticsSummaryProps {
  analytics: any;
  period: string;
}

/**
 * Enhanced analytics summary component for Pro tier
 * Shows profile views, car views, product clicks, unique visitors, and shares
 */
const ProAnalyticsSummary = ({ analytics, period }: ProAnalyticsSummaryProps) => {
  if (!analytics) return null;

  // Calculate totals - access directly from analytics or compute if needed
  const totalProfileViews = analytics.totalProfileViews || 0;
  const totalCarViews = analytics.totalCarViews || 0;
  const totalProductClicks = analytics.totalProductClicks || 0;
  const uniqueVisitors = analytics.uniqueVisitors || 0;
  const totalShares = analytics.totalShares || 0; // Will be added in future

  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3">Pro Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Profile Views Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-blue-500 transition-colors">
          <div className="text-sm font-medium text-slate-400 mb-1">Profile Views</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold text-white">{totalProfileViews}</div>
              <p className="text-xs text-slate-400">Last {period}</p>
            </div>
            <EyeIcon className="h-5 w-5 text-blue-400" />
          </div>
        </div>

        {/* Car Views Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-blue-500 transition-colors">
          <div className="text-sm font-medium text-slate-400 mb-1">Car Views</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold text-white">{totalCarViews}</div>
              <p className="text-xs text-slate-400">Last {period}</p>
            </div>
            <Car className="h-5 w-5 text-blue-400" />
          </div>
        </div>

        {/* Product Clicks Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-blue-500 transition-colors">
          <div className="text-sm font-medium text-slate-400 mb-1">Product Clicks</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold text-white">{totalProductClicks}</div>
              <p className="text-xs text-slate-400">Last {period}</p>
            </div>
            <MousePointer className="h-5 w-5 text-blue-400" />
          </div>
        </div>

        {/* Unique Visitors Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-blue-500 transition-colors">
          <div className="text-sm font-medium text-slate-400 mb-1">Unique Visitors</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold text-white">{uniqueVisitors}</div>
              <p className="text-xs text-slate-400">Last {period}</p>
            </div>
            <Users className="h-5 w-5 text-blue-400" />
          </div>
        </div>

        {/* Shares Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-blue-500 transition-colors">
          <div className="text-sm font-medium text-slate-400 mb-1">Shares</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold text-white">{totalShares}</div>
              <p className="text-xs text-slate-400">Last {period}</p>
            </div>
            <Share className="h-5 w-5 text-blue-400" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProAnalyticsSummary;
