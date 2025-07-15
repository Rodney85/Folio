import { EyeIcon, MousePointer, Users, Car } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AnalyticsSummaryProps {
  analytics: any;
  period: string;
}

const AnalyticsSummary = ({ analytics, period }: AnalyticsSummaryProps) => {
  if (!analytics) return null;

  return (
    <section>
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-white mb-3 md:mb-4">Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Views Card */}
        <div className="bg-slate-800 rounded-lg p-5 md:p-6 shadow-md hover:bg-slate-800/80 transition-colors">
          <div className="text-sm md:text-base font-medium text-slate-400 mb-1 md:mb-2">Profile Views</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">{analytics.totalProfileViews || 0}</div>
              <p className="text-xs md:text-sm text-slate-400">Last {period}</p>
            </div>
            <EyeIcon className="h-5 w-5 md:h-6 md:w-6 text-slate-400" />
          </div>
        </div>

        {/* Unique Visitors Card */}
        <div className="bg-slate-800 rounded-lg p-5 md:p-6 shadow-md hover:bg-slate-800/80 transition-colors">
          <div className="text-sm md:text-base font-medium text-slate-400 mb-1 md:mb-2">Unique Visitors</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">{analytics.uniqueVisitors || 0}</div>
              <p className="text-xs md:text-sm text-slate-400">Last {period}</p>
            </div>
            <Users className="h-5 w-5 md:h-6 md:w-6 text-slate-400" />
          </div>
        </div>

        {/* Car Views Card */}
        <div className="bg-slate-800 rounded-lg p-5 md:p-6 shadow-md hover:bg-slate-800/80 transition-colors">
          <div className="text-sm md:text-base font-medium text-slate-400 mb-1 md:mb-2">Car Views</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">{analytics.totalCarViews || 0}</div>
              <p className="text-xs md:text-sm text-slate-400">Last {period}</p>
            </div>
            <Car className="h-5 w-5 md:h-6 md:w-6 text-slate-400" />
          </div>
        </div>

        {/* Product Clicks Card */}
        <div className="bg-slate-800 rounded-lg p-5 md:p-6 shadow-md hover:bg-slate-800/80 transition-colors">
          <div className="text-sm md:text-base font-medium text-slate-400 mb-1 md:mb-2">Product Clicks</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">{analytics.totalProductClicks || 0}</div>
              <p className="text-xs md:text-sm text-slate-400">Last {period}</p>
            </div>
            <MousePointer className="h-5 w-5 md:h-6 md:w-6 text-slate-400" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSummary;
