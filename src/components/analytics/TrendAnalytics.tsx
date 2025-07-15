import { BarChart3 } from "lucide-react";

interface TrendAnalyticsProps {
  analytics: any;
}

const TrendAnalytics = ({ analytics }: TrendAnalyticsProps) => {
  if (!analytics || !analytics.dailyViews) return null;
  
  // Process daily views data for the chart
  const dailyViews = analytics.dailyViews || {};
  
  // Get last 14 days of data
  const today = new Date();
  const dates = [];
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
  }
  
  // Create the dataset for the chart
  const chartData = dates.map(date => {
    return {
      date,
      views: dailyViews[date] || 0,
      // Format date for display (e.g. "Jul 12")
      displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });
  
  // Find max views for scaling
  const maxViews = Math.max(...chartData.map(d => d.views), 1);
  
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 text-white">Trends</h2>
      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-md">
        <div className="p-4 md:p-6 border-b border-slate-700 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-400">Views by Day (Last 14 Days)</h3>
        </div>
        <div className="p-4 md:p-6 lg:p-8">
          {/* Simple bar chart */}
          <div className="flex items-end h-40 md:h-60 gap-1 md:gap-2 pt-4 overflow-x-auto">
            {chartData.map((item) => (
              <div key={item.date} className="flex flex-col items-center flex-1 min-w-8">
                <div 
                  className="w-full bg-blue-600/80 rounded-t"
                  style={{ 
                    height: `${item.views ? (item.views / maxViews) * 100 : 0}%`,
                    minHeight: item.views ? '4px' : '0'
                  }}
                ></div>
                <div className="text-xs md:text-sm mt-2 text-slate-400">
                  {item.displayDate.split(" ")[1]}
                </div>
                {/* Only show some month labels to avoid crowding */}
                {(chartData.indexOf(item) === 0 || 
                  chartData.indexOf(item) === 7 ||
                  chartData.indexOf(item) === 13) && (
                  <div className="text-[10px] text-slate-500">
                    {item.displayDate.split(" ")[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex justify-between mt-6 text-xs md:text-sm text-slate-400">
            <div>14 days ago</div>
            <div>Today</div>
          </div>
          
          {/* Stats */}
          <div className="mt-4 md:mt-6 pt-4 border-t border-slate-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400">Total views</p>
                <p className="text-xl font-bold text-white">
                  {chartData.reduce((sum, item) => sum + item.views, 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Peak day</p>
                <p className="text-xl font-bold text-white">
                  {maxViews === 0 ? '0' : Math.max(...chartData.map(d => d.views))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendAnalytics;
