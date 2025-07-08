import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// A utility component to help debug ALL cars in the database
const AllCars = () => {
  const [allCarsData, setAllCarsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Use the regular getUserCars query to display current user's cars
  const userCars = useQuery(api.cars.getUserCars);
  
  // For publish function
  const publishAll = useMutation(api.cars.publishAllCars);

  // Since we can't directly use getAllCarsDebug with useQuery in a component,
  // we'll display what we can with the existing API
  useEffect(() => {
    if (userCars) {
      console.log("Current user's cars:", userCars);
    }
  }, [userCars]);

  const handlePublishAll = async () => {
    try {
      const result = await publishAll();
      console.log("Publish all result:", result);
      // No need to refresh since userCars will update automatically via the query
    } catch (error) {
      console.error("Error publishing all cars:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Database Car Debugging</h1>
      
      <div className="mb-4 space-x-2">
        
        <button
          onClick={handlePublishAll}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Publish All Cars
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Check your browser console for detailed car data information
        </p>
      </div>

      {allCarsData && (
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-bold mb-2">Total cars found: {allCarsData.totalCars}</h2>
          <h3 className="font-semibold mb-2">Unique user IDs: {allCarsData.uniqueUserIds.length}</h3>
          
          <div className="mb-4">
            <h3 className="font-semibold">User IDs in database:</h3>
            <ul className="list-disc pl-5">
              {allCarsData.uniqueUserIds.map((id: string, index: number) => (
                <li key={index} className="break-all">{id}</li>
              ))}
            </ul>
          </div>
          
          {allCarsData.carDetails && allCarsData.carDetails.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-2">Cars:</h3>
              <ul className="list-disc pl-5">
                {allCarsData.carDetails.map((car: any) => (
                  <li key={car.carId} className="mb-2">
                    <div className="flex justify-between">
                      <span>
                        {car.year} {car.make} {car.model}
                      </span>
                      <span className={`font-semibold ${car.isPublished ? 'text-green-500' : 'text-red-500'}`}>
                        {car.isPublished ? 'Published' : 'Not Published'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 break-all">
                      ID: {car.carId} | User: {car.userId}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No cars found in database</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AllCars;
