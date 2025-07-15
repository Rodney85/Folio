import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Car } from "lucide-react";

interface CarViewsAnalyticsProps {
  analytics: any;
}

const CarViewsAnalytics = ({ analytics }: CarViewsAnalyticsProps) => {
  if (!analytics || !analytics.carViews) return null;

  // Get car data for the cars with view data
  const carIds = Object.keys(analytics.carViews);
  
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 text-white">Car Views</h2>
      
      {carIds.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-6 text-center">
          <p className="text-slate-400">No car view data available yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg">
            <div className="p-4 md:p-6 border-b border-slate-700">
              <h3 className="text-sm md:text-base font-medium text-slate-400">Views by Car</h3>
            </div>
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {carIds.map((carId) => (
                <CarViewItem 
                  key={carId} 
                  carId={carId as Id<"cars">} 
                  views={analytics.carViews[carId]} 
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Component to display individual car view data with car details
const CarViewItem = ({ carId, views }: { carId: Id<"cars">, views: number }) => {
  const car = useQuery(api.cars.getCarById, { carId });
  
  if (!car) return null;
  
  return (
    <div className="flex items-center justify-between py-2 md:py-3 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/20 transition-colors rounded px-2">
      <div className="flex items-center gap-3 md:gap-4">
        {car.images && car.images.length > 0 ? (
          <img
            src={car.images[0]}
            alt={`${car.make} ${car.model}`}
            className="w-10 h-10 md:w-12 md:h-12 rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-700 rounded flex items-center justify-center">
            <Car className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <div>
          <h3 className="font-medium text-white text-sm md:text-base">{car.year} {car.make} {car.model}</h3>
          <p className="text-xs text-slate-400">ID: {carId.slice(-6)}</p>
        </div>
      </div>
      <div className="text-xl md:text-2xl font-semibold text-white">{views}</div>
    </div>
  );
};

export default CarViewsAnalytics;
