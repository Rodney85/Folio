import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Id } from '../../../convex/_generated/dataModel';
import { ChevronLeft, ChevronRight, X, Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import CarImageWithUrl from './CarImageWithUrl';

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
}

interface CarDetailsModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
}

const CarDetailsModal: React.FC<CarDetailsModalProps> = ({ car, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!car) return null;

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (car.images && car.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % car.images!.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (car.images && car.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? car.images!.length - 1 : prev - 1));
    }
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold">
            {car.make} {car.model}
          </DialogTitle>
        </DialogHeader>

        {/* Main image */}
        <div className="relative w-full aspect-video md:aspect-[16/9] lg:aspect-[21/9] bg-muted rounded-lg overflow-hidden">
          {car.images && car.images.length > 0 ? (
            <CarImageWithUrl 
              storageId={car.images[currentImageIndex]} 
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Car className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No image available</p>
            </div>
          )}
          
          {/* Image navigation controls */}
          {car.images && car.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {car.images && car.images.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto justify-center md:justify-start">
            {car.images.map((image, index) => (
              <div 
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded overflow-hidden flex-shrink-0 border-2 cursor-pointer transition-all ${index === currentImageIndex ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
              >
                <CarImageWithUrl 
                  storageId={image} 
                  alt={`${car.make} ${car.model} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Car Details */}
        <div className="p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mb-4">
            <div>
              <h4 className="text-sm text-muted-foreground">Year</h4>
              <p className="font-semibold">{car.year}</p>
            </div>
            <div>
              <h4 className="text-sm text-muted-foreground">Power</h4>
              <p className="font-semibold">{car.power}</p>
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <div className="mt-4">
              <h4 className="text-sm text-muted-foreground mb-1">Description</h4>
              <p className="text-sm">{car.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CarDetailsModal;
