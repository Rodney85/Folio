import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Loader, Camera, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CarThumbnail from '@/components/cars/CarThumbnail';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import CarImageWithUrl from './CarImageWithUrl';

interface Car {
  _id: Id<"cars">;
  make: string;
  model: string;
  year: number;
  powerHp?: string;
  torqueLbFt?: string;
  description?: string;
  images?: string[];
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CarGridProps {
  userId?: string;
  limit?: number;
  className?: string;
  showAddButton?: boolean;
  instagramStyle?: boolean;
  readOnly?: boolean;
  cars?: Car[];
}

const CarGrid: React.FC<CarGridProps> = ({ 
  userId, 
  limit = 12, 
  className = '',
  showAddButton = true,
  instagramStyle = false,
  readOnly = false,
  cars: propCars
}) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");
  
  // Use provided cars or fetch them
  const fetchedCars = useQuery(api.cars.getUserCars);
  const cars = propCars || fetchedCars || [];
  
  // If in readOnly mode, don't allow adding cars
  showAddButton = readOnly ? false : showAddButton;

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

  // Determine the grid style based on props and viewport
  const gridStyles = instagramStyle && !isMobile 
    ? 'grid grid-cols-3 gap-[2px]' // Instagram style with consistent 3 columns for tablet/desktop
    : isMobile 
      ? 'grid grid-cols-2 gap-3' // Original style for mobile (unchanged)
      : 'grid grid-cols-3 gap-4'; // Consistent 3 columns like Instagram for tablet/desktop

  return (
    <>
      <div className={`${gridStyles} ${className}`}>
        {cars.map((car) => (
          instagramStyle && !isMobile ? (
            // Instagram-style card for desktop
            <div 
              key={car._id} 
              className="relative pb-[100%] w-full overflow-hidden cursor-pointer"
              onClick={() => handleCarClick(car)}
            >
              {car.images && car.images.length > 0 ? (
                <CarImageWithUrl
                  storageId={car.images[0]}
                  alt={`${car.make} ${car.model}`}
                  className="absolute inset-0 w-full h-full object-cover hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors">
                  <Car className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ) : (
            // Original card style for mobile
            <CarThumbnail 
              key={car._id}
              car={car}
              onClick={() => handleCarClick(car)}
            />
          )
        ))}
        
        {/* Add car tile - conditionally shown */}
        {showAddButton && (
          <div 
            onClick={handleAddCarClick}
            className={`cursor-pointer ${instagramStyle && !isMobile 
              ? 'relative pb-[100%] w-full overflow-hidden' 
              : isMobile 
                ? 'relative aspect-square rounded-md border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition'
                : 'relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition shadow-sm hover:shadow-md'}
              flex flex-col items-center justify-center bg-muted/50 hover:bg-muted/80 group`}
          >
            <div className={instagramStyle && !isMobile ? 'absolute inset-0 flex flex-col items-center justify-center' : ''}>
              <Camera className="h-8 w-8 mb-2 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Add Car</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CarGrid;
