import React from 'react';
import { Id } from '../../../convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import CarImageWithUrl from './CarImageWithUrl';
import { useMediaQuery } from '../../hooks/useMediaQuery';

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

interface CarThumbnailProps {
  car: Car;
  onClick?: () => void;
  className?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const CarThumbnail: React.FC<CarThumbnailProps> = ({
  car,
  onClick,
  className,
  showDetails = true,
  size = 'md'
}) => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const sizeClasses = {
    sm: 'aspect-square',
    md: 'aspect-square',
    lg: 'aspect-video',
  };

  const imageUrl = car.images && car.images.length > 0
    ? car.images[0]
    : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden cursor-pointer group",
        "rounded-[5px] shadow-sm hover:shadow-md transition-shadow duration-300",
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      {imageUrl ? (
        <CarImageWithUrl
          storageId={imageUrl}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No image</p>
        </div>
      )}


      {/* Overlay with car info */}
      {showDetails && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <div>
            <h3 className="text-white font-semibold text-lg leading-tight">
              {car.make} {car.model}
            </h3>
            {!isMobile && car.power && (
              <p className="text-white/70 text-xs mt-1">{car.power}</p>
            )}
          </div>
        </div>
      )}

      {/* Badge for multiple images */}
      {car.images && car.images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs rounded-full px-2 py-1">
          +{car.images.length - 1}
        </div>
      )}
    </div>
  );
};

export default CarThumbnail;
