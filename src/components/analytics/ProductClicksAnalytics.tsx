import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { PackageOpen, Trophy } from "lucide-react";

interface ProductClicksAnalyticsProps {
  analytics: any;
}

const ProductClicksAnalytics = ({ analytics }: ProductClicksAnalyticsProps) => {
  if (!analytics || !analytics.topProducts) return null;

  const topProducts = analytics.topProducts || [];
  
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 text-white">Product Clicks</h2>
      
      {topProducts.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-6 text-center">
          <p className="text-slate-400">No product click data available yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top Products Card */}
          <div className="bg-slate-800 rounded-lg overflow-hidden shadow-md">
            <div className="p-4 md:p-6 border-b border-slate-700 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-slate-400" /> 
              <h3 className="text-sm font-medium text-slate-400">Top Products</h3>
            </div>
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {topProducts.map((product: { partId: string, clicks: number }, index: number) => (
                <ProductClickItem 
                  key={product.partId} 
                  partId={product.partId as Id<"parts">} 
                  clicks={product.clicks}
                  rank={index + 1} 
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Component to display individual product click data with product details
const ProductClickItem = ({ partId, clicks, rank }: { partId: Id<"parts">, clicks: number, rank: number }) => {
  // Fetch all parts and then filter the one we need
  // This is a workaround since there's no direct getPartById API method
  const allParts = useQuery(api.parts.getCarParts, { carId: partId.replace(/\|.*$/, '') as Id<"cars"> });
  const part = allParts?.find(p => p._id === partId);
  
  if (!part) return null;
  
  // Generate badge color based on rank
  const badgeColors = [
    "bg-yellow-500", // 1st place (gold)
    "bg-gray-300",   // 2nd place (silver)
    "bg-amber-600",  // 3rd place (bronze)
  ];
  
  const badgeColor = rank <= 3 ? badgeColors[rank - 1] : "bg-gray-200";
  
  return (
    <div className="flex items-center justify-between py-2 md:py-3 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/20 transition-colors rounded px-2">
      <div className="flex items-center gap-3">
        <div className={`w-6 h-6 md:w-8 md:h-8 ${badgeColor} rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm`}>
          {rank}
        </div>
        
        <div className="flex items-center gap-3">
          {part.image ? (
            <img
              src={part.image}
              alt={part.name}
              className="w-10 h-10 md:w-12 md:h-12 rounded object-cover"
            />
          ) : (
            <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-700 rounded flex items-center justify-center">
              <PackageOpen className="h-5 w-5 text-slate-400" />
            </div>
          )}
          <div>
            <h3 className="font-medium text-white text-sm md:text-base">{part.name}</h3>
            <p className="text-xs text-slate-400">{part.category}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="text-xl md:text-2xl font-semibold text-white">{clicks}</div>
        <span className="text-xs text-slate-400">clicks</span>
      </div>
    </div>
  );
};

export default ProductClicksAnalytics;
