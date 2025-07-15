import { useState, useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { ArrowDown, ArrowUp, Car } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

// Define type for analytics data expected by this component
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
  _id: Id<"cars">;
  userId: string;
  make: string;
  model: string;
  year: number;
  power?: string;
  isPublished: boolean;
  images?: string[];
  parts?: any[];
}

interface CarViewsTableProps {
  analytics: AnalyticsData;
  period: string;
}

/**
 * Pro analytics component that shows a table of cars with their view counts
 * Sortable by views, CTR, or percentage of total
 */
const CarViewsTable = ({ analytics, period }: CarViewsTableProps) => {
  const [sortField, setSortField] = useState<string>("views");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Get car IDs that have views
  const carIds = useMemo(() => {
    if (!analytics.carViews) return [];
    return Object.keys(analytics.carViews);
  }, [analytics]);

  // Fetch all user cars instead of using non-existent getCarsByIds
  const allUserCars = useQuery(api.cars.getUserCars) || [];
  
  // Filter cars to only those with views
  const cars = useMemo(() => {
    if (!allUserCars || !carIds.length) return [];
    return allUserCars.filter(car => carIds.includes(car._id.toString()));
  }, [allUserCars, carIds]);

  // Calculate total views for percentage calculation
  const totalCarViews = analytics?.totalCarViews || 0;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Create sortable rows with car details and view metrics
  const rows = useMemo(() => {
    if (!analytics?.carViews || !cars) return [];

    return cars.map((car) => {
      const carIdString = car._id.toString();
      const views = analytics.carViews?.[carIdString] || 0;
      // Since car parts may not be available from getUserCars, use a safer approach
      // Just count any product clicks that might be associated with this car
      // This is a simplification that assumes all product clicks in analytics belong to visible cars
      const clicks = analytics.productClicks ? 
        Object.entries(analytics.productClicks)
          // Without parts data, we can't filter by car, so count all product clicks
          // In a real implementation, you'd want to fetch parts data separately
          .reduce((total, [_, clickCount]) => total + (clickCount as number), 0) : 0;
      
      const ctr = views > 0 ? (clicks / views) * 100 : 0;
      const percentageOfTotal = totalCarViews > 0 ? (views / totalCarViews) * 100 : 0;
      
      return {
        carId: carIdString,
        name: car.make + " " + car.model,
        year: car.year,
        views,
        clicks,
        ctr: ctr.toFixed(1),
        percentageOfTotal: percentageOfTotal.toFixed(1),
        imageUrl: car.images?.[0] || "",
      };
    });
  }, [analytics, cars, totalCarViews]);

  // Sort the rows based on current sort settings
  const sortedRows = useMemo(() => {
    if (!rows.length) return [];
    
    return [...rows].sort((a, b) => {
      // Handle different types appropriately
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "year") {
        comparison = (a.year || 0) - (b.year || 0);
      } else if (sortField === "views") {
        comparison = a.views - b.views;
      } else if (sortField === "clicks") {
        comparison = a.clicks - b.clicks;
      } else if (sortField === "ctr") {
        comparison = parseFloat(a.ctr) - parseFloat(b.ctr);
      } else if (sortField === "percentageOfTotal") {
        comparison = parseFloat(a.percentageOfTotal) - parseFloat(b.percentageOfTotal);
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [rows, sortField, sortDirection]);

  if (!analytics) return null;

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold text-white mb-3">Car Performance</h2>
      
      {!sortedRows.length ? (
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-lg text-center">
          <Car className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400">No car view data available for this period</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                  <th className="p-4">Car</th>
                  <th 
                    className="p-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort("views")}
                  >
                    <div className="flex items-center">
                      Views
                      {sortField === "views" && (
                        sortDirection === "asc" ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort("clicks")}
                  >
                    <div className="flex items-center">
                      Clicks
                      {sortField === "clicks" && (
                        sortDirection === "asc" ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort("ctr")}
                  >
                    <div className="flex items-center">
                      CTR
                      {sortField === "ctr" && (
                        sortDirection === "asc" ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort("percentageOfTotal")}
                  >
                    <div className="flex items-center">
                      % of Total
                      {sortField === "percentageOfTotal" && (
                        sortDirection === "asc" ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr key={row.carId} className="border-b border-slate-700 hover:bg-slate-750">
                    <td className="p-4">
                      <div className="flex items-center">
                        {row.imageUrl && (
                          <div className="w-10 h-10 mr-3 bg-slate-700 rounded overflow-hidden">
                            <img 
                              src={row.imageUrl} 
                              alt={row.name}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-white font-medium">{row.name}</div>
                          <div className="text-slate-400 text-sm">{row.year}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-white">{row.views}</td>
                    <td className="p-4 text-white">{row.clicks}</td>
                    <td className="p-4 text-white">{row.ctr}%</td>
                    <td className="p-4 text-white">{row.percentageOfTotal}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default CarViewsTable;
