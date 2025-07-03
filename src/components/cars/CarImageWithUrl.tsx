import React, { useState } from 'react';
import { useConvexImage } from '@/hooks/useConvexImage';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isBackblazeUrl } from '@/utils/storageService';

interface CarImageWithUrlProps {
  storageId: string;
  alt?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
  priority?: boolean;
  withFallback?: boolean;
  testId?: string;
  onClick?: () => void;
}

/**
 * Component that handles displaying a car image from a Convex storage ID
 * Automatically fetches the proper URL and shows a loading/fallback state
 */
const CarImageWithUrl: React.FC<CarImageWithUrlProps> = ({ 
  storageId, 
  alt, 
  className = '',
  aspectRatio,
  priority,
  withFallback,
  testId,
  onClick
 }) => {
  // Check if it's already a Backblaze URL
  const isDirectUrl = isBackblazeUrl(storageId);
  
  // For Backblaze URLs, use directly; for Convex IDs, fetch the URL
  const convexUrl = isDirectUrl ? null : useConvexImage(storageId);
  
  // Determine loading state based on whether we have a URL
  const url = isDirectUrl ? storageId : convexUrl;
  const isLoading = isDirectUrl ? false : (convexUrl === null && !isDirectUrl);
  const error = null; // We removed the error tracking from the hook since it wasn't used properly
  const [localError, setLocalError] = useState(false);
  
  // Handle loading state while URL is being fetched
  if (isLoading && !error) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div data-testid="loading-image" className="animate-pulse bg-muted-foreground/20 w-full h-full" />
      </div>
    );
  }
  
  // Handle error or missing URL
  if (error || !url || localError) {
    if (withFallback) {
      return (
        <div className={cn(
          "flex items-center justify-center bg-muted",
          aspectRatio === "square" && "aspect-square",
          aspectRatio === "video" && "aspect-video",
          className
        )}>
          <div data-testid="fallback-icon" className="text-muted-foreground">
            <Car size={24} />
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
  
  // Render image with error handling and performance optimizations
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setLocalError(true)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
};

export default CarImageWithUrl;
