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
  withFallback = true,
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
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Handle loading state while URL is being fetched
  if (isLoading && !error && !localError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-slate-800",
        aspectRatio === "square" && "aspect-square",
        aspectRatio === "video" && "aspect-video", 
        className
      )}>
        <div data-testid="loading-image" className="animate-pulse bg-slate-700 w-full h-full rounded" />
      </div>
    );
  }
  
  // Handle error or missing URL - always show fallback for car images
  if (error || !url || localError) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center bg-slate-800 border border-slate-700",
        aspectRatio === "square" && "aspect-square",
        aspectRatio === "video" && "aspect-video",
        className
      )}>
        <div data-testid="fallback-icon" className="text-slate-400 flex flex-col items-center">
          <Car size={32} className="mb-2" />
          <span className="text-xs text-slate-500">Image unavailable</span>
          {localError && !isRetrying && (
            <button 
              onClick={() => {
                setIsRetrying(true);
                setLocalError(false);
                setTimeout(() => setIsRetrying(false), 1000);
              }}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Render image with robust error handling
  return (
    <img
      src={url}
      alt={alt || "Car image"}
      className={className}
      onClick={onClick}
      onError={(e) => {
        console.warn(`Failed to load image: ${url}`);
        setLocalError(true);
      }}
      onLoad={() => {
        // Reset error state on successful load (useful for retries)
        if (localError) {
          setLocalError(false);
        }
      }}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      data-testid={testId}
    />
  );
};

export default CarImageWithUrl;
