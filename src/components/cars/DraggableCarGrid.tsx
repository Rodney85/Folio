import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Loader, Camera, Car, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CarThumbnail from '@/components/cars/CarThumbnail';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import CarImageWithUrl from './CarImageWithUrl';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { SortableItem } from '@/components/cars/SortableItem';

interface Car {
  _id: Id<"cars">;
  make: string;
  model: string;
  year: number;
  power: string;
  torque?: number;
  description?: string;
  images?: string[];
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
  order?: number; // Add order property for sorting
}

interface DraggableCarGridProps {
  userId?: string;
  limit?: number;
  className?: string;
  showAddButton?: boolean;
  instagramStyle?: boolean;
  editMode?: boolean;
}

const DraggableCarGrid: React.FC<DraggableCarGridProps> = ({ 
  userId, 
  limit = 12, 
  className = '',
  showAddButton = true,
  instagramStyle = false,
  editMode = false
}) => {
  // Initialize hooks first - following React hook rules
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");
  
  // Feature flag to check if DnD should be enabled
  // Use the editMode prop as the initial state, but maintain local state for library availability
  const [dndEnabled, setDndEnabled] = useState<boolean>(editMode);
  
  // Query for sorted cars
  const sortedCars = useQuery(api.carOrder?.getUserCarsSorted);
  
  // Fallback query if sorted query is not available
  const userCars = useQuery(api.cars.getUserCars);
  
  // Local state to manage the order of cars for drag-and-drop
  const [cars, setCars] = useState<Car[]>([]);
  
  // Determine which cars to use
  const fetchedCars = sortedCars || userCars || [];
  
  // Update dndEnabled when editMode prop changes
  useEffect(() => {
    setDndEnabled(editMode);
  }, [editMode]);

  // Disable DnD if the required libraries aren't available
  useEffect(() => {
    try {
      // This is just a check to see if the libraries are available
      // If they're not, the import statements at the top would fail
      // But we'll add this extra check for safety
      if (typeof DndContext === 'undefined' || typeof SortableContext === 'undefined') {
        console.warn('DnD libraries not available, disabling drag-and-drop');
        setDndEnabled(false);
      }
    } catch (error) {
      console.warn('Error initializing drag-and-drop:', error);
      setDndEnabled(false);
    }
  }, []);
  
  // Update local state when fetched cars change
  useEffect(() => {
    if (fetchedCars.length) {
      // If cars don't have an order property, add one
      const carsWithOrder = fetchedCars.map((car, index) => ({
        ...car,
        order: car.order !== undefined ? car.order : index
      }));
      
      // Sort cars by order
      const sortedCars = [...carsWithOrder].sort((a, b) => 
        (a.order !== undefined && b.order !== undefined) ? a.order - b.order : 0
      );
      
      setCars(sortedCars);
    }
  }, [fetchedCars]);
  
  // Save the reordered cars back to the database
  const updateCarOrder = useMutation(api.carOrder?.updateCarOrder);
  
  // Get mutation to update car details (for publishing)
  const updateCar = useMutation(api.cars.updateCar);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activating
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setCars((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        
        // Reorder the cars
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update each car with its new order
        const updatedCars = newItems.map((car, index) => ({
          ...car,
          order: index
        }));
        
        // Save the new order to the database and ensure all cars are published
        updatedCars.forEach(car => {
          // Update car order
          if (car.order !== undefined) {
            updateCarOrder({
              id: car._id,
              order: car.order
            });
            
            // Ensure car is published
            // This ensures the public profile will show the car with the updated order
            if (!car.isPublished) {
              updateCar({
                carId: car._id,
                isPublished: true
              });
            }
          }
        });
        
        return updatedCars;
      });
    }
  };

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

  // Always use 3 columns for the grid, regardless of device
  const gridStyles = 'grid grid-cols-3 gap-[2px]';
  
  // Fallback to standard grid without drag functionality if dnd isn't enabled
  if (!dndEnabled) {
    return (
      <div className={`${gridStyles} ${className}`}>
        {cars.map((car) => (
          <div 
            key={car._id}
            className="relative pb-[100%] w-full overflow-hidden cursor-pointer"
          >
            {car.images && car.images.length > 0 ? (
              <CarImageWithUrl
                storageId={car.images[0]}
                alt={`${car.make} ${car.model}`}
                className="absolute inset-0 w-full h-full object-cover hover:opacity-90 transition-opacity"
                onClick={() => handleCarClick(car)}
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
                onClick={() => handleCarClick(car)}
              >
                <Car className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        
        {/* Add car tile - conditionally shown */}
        {showAddButton && (
          <div 
            onClick={handleAddCarClick}
            className={`cursor-pointer relative pb-[100%] w-full overflow-hidden
              flex flex-col items-center justify-center bg-muted/50 hover:bg-muted/80 group`}
          >
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <Camera className="h-8 w-8 mb-2 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Add Car</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <>
      {dndEnabled ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          // Using modifiers instead of dropAnimation for TypeScript compatibility
        >
        <SortableContext
          items={cars.map(car => car._id)}
          strategy={rectSortingStrategy}
        >
          <div className={`${gridStyles} ${className}`}>
            {cars.map((car) => (
              <SortableItem key={car._id} id={car._id}>
                <div 
                  className="relative pb-[100%] w-full overflow-hidden cursor-pointer group"
                >
                  <div className="absolute top-1 right-1 z-10 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical size={14} />
                  </div>
                  {car.images && car.images.length > 0 ? (
                    <CarImageWithUrl
                      storageId={car.images[0]}
                      alt={`${car.make} ${car.model}`}
                      className="absolute inset-0 w-full h-full object-cover hover:opacity-90 transition-opacity"
                      onClick={() => handleCarClick(car)}
                    />
                  ) : (
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
                      onClick={() => handleCarClick(car)}
                    >
                      <Car className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </SortableItem>
            ))}
          
            {/* Add car tile - conditionally shown */}
            {showAddButton && (
              <div 
                onClick={handleAddCarClick}
                className={`cursor-pointer relative pb-[100%] w-full overflow-hidden
                  flex flex-col items-center justify-center bg-muted/50 hover:bg-muted/80 group`}
              >
                <div className='absolute inset-0 flex flex-col items-center justify-center'>
                  <Camera className="h-8 w-8 mb-2 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Add Car</span>
                </div>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
      ) : (
        <div className={`${gridStyles} ${className}`}>
          {cars.map((car) => (
            <div 
              key={car._id}
              className="relative pb-[100%] w-full overflow-hidden cursor-pointer"
            >
              {car.images && car.images.length > 0 ? (
                <CarImageWithUrl
                  storageId={car.images[0]}
                  alt={`${car.make} ${car.model}`}
                  className="absolute inset-0 w-full h-full object-cover hover:opacity-90 transition-opacity"
                  onClick={() => handleCarClick(car)}
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
                  onClick={() => handleCarClick(car)}
                >
                  <Car className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {/* Add car tile - conditionally shown */}
          {showAddButton && (
            <div 
              onClick={handleAddCarClick}
              className={`cursor-pointer relative pb-[100%] w-full overflow-hidden
                flex flex-col items-center justify-center bg-muted/50 hover:bg-muted/80 group`}
            >
              <div className='absolute inset-0 flex flex-col items-center justify-center'>
                <Camera className="h-8 w-8 mb-2 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Add Car</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DraggableCarGrid;
