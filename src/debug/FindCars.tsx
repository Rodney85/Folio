import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// A utility component to help debug car data issues
// This will display car data in the console
const FindCars = () => {
  const cars = useQuery(api.cars.getUserCars);
  const publishAll = useMutation(api.cars.publishAllCars);

  useEffect(() => {
    if (cars) {
      console.log("All cars found:", cars);
      console.log("Car IDs:", cars.map(car => car._id.toString()));
      
      // Group cars by userId
      const carsByUser = cars.reduce((acc: Record<string, any[]>, car: any) => {
        const userId = car.userId;
        if (!acc[userId]) {
          acc[userId] = [];
        }
        acc[userId].push(car);
        return acc;
      }, {});
      
      console.log("Cars grouped by userId:", carsByUser);
      console.log("Unique userIds:", Object.keys(carsByUser));
    }
  }, [cars]);

  const handlePublishAll = async () => {
    try {
      const result = await publishAll();
      console.log("Publish all result:", result);
    } catch (error) {
      console.error("Error publishing all cars:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Car Data Debugging</h1>
      
      <div className="mb-4">
        <button
          onClick={handlePublishAll}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Publish All Cars
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Check your browser console for car data information
        </p>
      </div>

      <div className="border p-4 rounded bg-gray-50">
        <h2 className="font-bold mb-2">Cars found: {cars?.length || 0}</h2>
        {cars && cars.length > 0 ? (
          <ul className="list-disc pl-5">
            {cars.map((car: any) => (
              <li key={car._id.toString()} className="mb-2">
                <div className="flex justify-between">
                  <span>
                    {car.year} {car.make} {car.model}
                  </span>
                  <span className={`font-semibold ${car.isPublished ? 'text-green-500' : 'text-red-500'}`}>
                    {car.isPublished ? 'Published' : 'Not Published'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {car._id.toString()} | User: {car.userId.substring(0, 20)}...
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No cars found</p>
        )}
      </div>
    </div>
  );
};

export default FindCars;
