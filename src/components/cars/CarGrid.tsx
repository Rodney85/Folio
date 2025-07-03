import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Loader, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CarThumbnail from '@/components/cars/CarThumbnail';

interface Car {
  _id: Id<"cars">;
  make: string;
  model: string;
  year: number;
  power: string;
  description?: string;
  images?: string[];
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CarGridProps {
  userId?: string;
  limit?: number;
}

const CarGrid: React.FC<CarGridProps> = ({ userId, limit = 12 }) => {
  const navigate = useNavigate();

  // Fetch cars based on userId if provided, otherwise fetch all published cars
  const cars = useQuery(api.cars.getUserCars) || [];

  const handleCarClick = (car: Car) => {
    navigate(`/car/${car._id}`);
  };
  
  const handleAddCarClick = () => {
    navigate('/add-car');
  };

  if (!cars) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="grid place-items-center py-10">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No cars found.</p>
          <Button onClick={handleAddCarClick} variant="secondary">
            <Camera className="h-4 w-4 mr-2" />
            Add your first car
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cars.map((car) => (
          <CarThumbnail 
            key={car._id}
            car={car}
            onClick={() => handleCarClick(car)}
          />
        ))}
        
        {/* Add car tile - Always present at the end */}
        <div 
          onClick={handleAddCarClick}
          className="relative aspect-square rounded-md cursor-pointer border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition flex flex-col items-center justify-center bg-muted/50 hover:bg-muted/80 group"
        >
          <Camera className="h-8 w-8 mb-2 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Add Car</span>
        </div>
      </div>

      {/* No modal needed as we're navigating to a dedicated page */}
    </>
  );
};

export default CarGrid;
